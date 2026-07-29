// Web 版 API — localStorage + GitHub 同步 + 扩展数据支持
(function initWebApi() {
  if (window.api) return;

  const DB_NAME = 'hanhan-study';
  const STORE = 'attachments';
  const REPO = 'hanhan0309/hanhan-study';
  const DATA_FILE = 'data.json';
  let db = null;

  // 默认数据
  function defaultData() {
    return {
      tasks: {}, templates: [], achievements: {},
      stars: 0, purchases: [],
      shop: [
        { id: 's1', name: '皇冠', icon: '👑', cost: 20, category: '装扮' },
        { id: 's2', name: '蝴蝶结', icon: '🎀', cost: 15, category: '装扮' },
        { id: 's3', name: '墨镜', icon: '🕶️', cost: 10, category: '装扮' },
        { id: 's4', name: '天使翅膀', icon: '🪽', cost: 30, category: '装扮' },
        { id: 's5', name: '魔法棒', icon: '🪄', cost: 25, category: '装扮' },
        { id: 's6', name: '小裙子', icon: '👗', cost: 35, category: '装扮' },
        { id: 's7', name: '项链', icon: '📿', cost: 12, category: '装扮' },
        { id: 's8', name: '天使光环', icon: '😇', cost: 40, category: '装扮' },
        { id: 's9', name: '贴纸包', icon: '🌟', cost: 5, category: '实物' },
        { id: 's10', name: '小零食', icon: '🍬', cost: 8, category: '实物' },
        { id: 's11', name: '小玩具', icon: '🧸', cost: 50, category: '实物' },
        { id: 's12', name: '绘本', icon: '📚', cost: 60, category: '实物' },
        { id: 's13', name: '文具套装', icon: '✏️', cost: 30, category: '实物' },
      ],
      settings: { password: '123456', theme: 'melody' }
    };
  }

  function getToken() { return localStorage.getItem('gh_sync_token') || ''; }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE))
          req.result.createObjectStore(STORE, { keyPath: 'name' });
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  async function ghAPI(path, opts = {}) {
    const token = getToken();
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = 'token ' + token;
    const res = await fetch('https://api.github.com/repos/' + REPO + path, { ...opts, headers });
    if (!res.ok) throw new Error('GitHub ' + res.status);
    return res.json();
  }

  async function pullFromGitHub() {
    try {
      const data = await ghAPI('/contents/' + DATA_FILE);
      if (data.content) return JSON.parse(atob(data.content.replace(/\n/g, '')));
    } catch (e) {}
    return null;
  }

  async function pushToGitHub(data) {
    try {
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      let sha = '';
      try { sha = (await ghAPI('/contents/' + DATA_FILE)).sha || ''; } catch (e) {}
      const body = { message: '📝 更新学习数据', content };
      if (sha) body.sha = sha;
      await ghAPI('/contents/' + DATA_FILE, { method: 'PUT', body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' } });
      return true;
    } catch (e) { console.log('同步失败:', e.message); return false; }
  }

  function mergeData(local, remote) {
    if (!remote) return local;
    const merged = { ...defaultData(), ...local, ...remote };
    merged.tasks = { ...local.tasks, ...remote.tasks };
    for (const day of Object.keys(local.tasks)) {
      if (!remote.tasks || !remote.tasks[day]) merged.tasks[day] = local.tasks[day];
    }
    merged.achievements = { ...local.achievements, ...remote.achievements };
    merged.purchases = remote.purchases || local.purchases || [];
    merged.shop = remote.shop || local.shop || defaultData().shop;
    merged.settings = { ...local.settings, ...remote.settings };
    merged.stars = remote.stars !== undefined ? remote.stars : local.stars || 0;
    return merged;
  }

  window.api = {
    loadData: async () => {
      const remote = await pullFromGitHub();
      let local = defaultData();
      try { const raw = localStorage.getItem('hanhan-data'); if (raw) local = JSON.parse(raw); } catch (e) {}
      const merged = mergeData(local, remote);
      localStorage.setItem('hanhan-data', JSON.stringify(merged));
      return merged;
    },

    saveData: async (data) => {
      try { localStorage.setItem('hanhan-data', JSON.stringify(data)); } catch (e) {}
      pushToGitHub(data);
    },

    setToken: (token) => localStorage.setItem('gh_sync_token', token),
    getToken: () => getToken(),
    hasToken: () => !!getToken(),

    saveAttachment: async (name, buffer) => {
      await openDB();
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const unique = Date.now() + '_' + String(name).replace(/[^\w.\-\u4e00-\u9fa5]/g, '_');
      const bytes = new Uint8Array(buffer);
      let b64 = '';
      for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
      const record = { name: unique, data: btoa(b64), originalName: name, type: 'application/octet-stream' };
      await new Promise((r, e) => { const req = store.put(record); req.onsuccess = r; req.onerror = e; });
      return { path: unique, name: unique };
    },

    readAttachment: async (name) => {
      await openDB();
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const record = await new Promise((r, e) => { const req = store.get(name); req.onsuccess = () => r(req.result); req.onerror = e; });
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
