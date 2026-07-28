// Web 版 API 桥接 —— localStorage + GitHub 同步
// 妈妈和孩子打开同一个网址，数据自动同步

(function initWebApi() {
  if (window.api) return;

  const DB_NAME = 'hanhan-study';
  const STORE = 'attachments';
  const REPO = 'hanhan0309/hanhan-study';
  const DATA_FILE = 'data.json';
  let db = null;

  // 获取存储的 token
  function getToken() {
    return localStorage.getItem('gh_sync_token') || '';
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: 'name' });
        }
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  // GitHub API 调用
  async function ghAPI(path, opts = {}) {
    const token = getToken();
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': token ? `token ${token}` : ''
    };
    if (!token) throw new Error('no_token');
    const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, { ...opts, headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
  }

  // 从 GitHub 拉取 data.json
  async function pullFromGitHub() {
    try {
      const data = await ghAPI(`/contents/${DATA_FILE}`);
      if (data.content) {
        const json = atob(data.content.replace(/\n/g, ''));
        return { data: JSON.parse(json), sha: data.sha };
      }
    } catch (e) {
      // token 未设置或网络错误，忽略
    }
    return null;
  }

  // 推送到 GitHub
  async function pushToGitHub(data) {
    try {
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      let sha = '';
      try {
        const existing = await ghAPI(`/contents/${DATA_FILE}`);
        sha = existing.sha || '';
      } catch (e) { /* 文件不存在 */ }

      const body = { message: '📝 更新学习数据', content };
      if (sha) body.sha = sha;

      await ghAPI(`/contents/${DATA_FILE}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      return true;
    } catch (e) {
      console.log('GitHub 同步失败（离线或未设置token）:', e.message);
      return false;
    }
  }

  window.api = {
    // ===== 数据加载 =====
    loadData: async () => {
      // 先从 GitHub 拉取最新数据
      let ghData = null;
      const remote = await pullFromGitHub();
      if (remote) ghData = remote.data;

      // 从本地加载
      let localData = { tasks: {}, templates: [], achievements: {} };
      try {
        const raw = localStorage.getItem('hanhan-data');
        if (raw) localData = JSON.parse(raw);
      } catch (e) {}

      // 合并：GitHub 数据优先，本地补充
      if (ghData) {
        // 合并 tasks（按日期深度合并）
        const merged = { ...localData, ...ghData };
        merged.tasks = { ...localData.tasks, ...ghData.tasks };
        // 每个日期的任务也合并（GitHub 优先，本地的不覆盖已存在的）
        for (const day of Object.keys(localData.tasks)) {
          if (!ghData.tasks[day]) {
            merged.tasks[day] = localData.tasks[day];
          }
        }
        // achievements 也合并
        merged.achievements = { ...localData.achievements, ...ghData.achievements };
        // templates 以 GitHub 为准
        merged.templates = ghData.templates || localData.templates;
        localStorage.setItem('hanhan-data', JSON.stringify(merged));
        return merged;
      }

      return localData;
    },

    // ===== 数据保存 =====
    saveData: async (data) => {
      try {
        localStorage.setItem('hanhan-data', JSON.stringify(data));
      } catch (e) {
        console.error('本地保存失败', e);
      }
      // 异步推送到 GitHub（不阻塞 UI）
      pushToGitHub(data);
    },

    // ===== Token 管理 =====
    setToken: (token) => {
      localStorage.setItem('gh_sync_token', token);
    },
    getToken: () => getToken(),
    hasToken: () => !!getToken(),

    // ===== 附件 =====
    saveAttachment: async (name, buffer) => {
      await openDB();
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const unique = Date.now() + '_' + String(name).replace(/[^\w.\-\u4e00-\u9fa5]/g, '_');
      const bytes = new Uint8Array(buffer);
      let b64 = '';
      for (let i = 0; i < bytes.length; i++) {
        b64 += String.fromCharCode(bytes[i]);
      }
      const record = {
        name: unique,
        data: btoa(b64),
        originalName: name,
        type: 'application/octet-stream'
      };
      await new Promise((resolve, reject) => {
        const req = store.put(record);
        req.onsuccess = resolve;
        req.onerror = reject;
      });
      return { path: unique, name: unique };
    },

    readAttachment: async (name) => {
      await openDB();
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const record = await new Promise((resolve, reject) => {
        const req = store.get(name);
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
      });
      return record ? record.data : null;
    },

    openAttachment: async (name) => {
      const b64 = await window.api.readAttachment(name);
      if (!b64) return;
      const a = document.createElement('a');
      a.href = 'data:application/octet-stream;base64,' + b64;
      a.download = name;
      a.click();
    }
  };
})();
