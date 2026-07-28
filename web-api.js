// Web 版 API 桥接 —— 模拟 Electron 的 window.api，用 localStorage + IndexedDB
// 供纯 HTML 环境使用，配合 PWA 实现手机桌面安装

(function initWebApi() {
  if (window.api) return; // 已经是 Electron 环境

  const DB_NAME = 'hanhan-study';
  const STORE = 'attachments';
  let db = null;

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

  window.api = {
    // 数据：用 localStorage 存储
    loadData: async () => {
      try {
        const raw = localStorage.getItem('hanhan-data');
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return { tasks: {}, templates: [], achievements: {} };
    },
    saveData: async (data) => {
      try {
        localStorage.setItem('hanhan-data', JSON.stringify(data));
      } catch (e) {
        console.error('保存数据失败', e);
      }
    },

    // 附件：存 IndexedDB（base64）
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
      // 纯 Web 环境：下载
      const b64 = await window.api.readAttachment(name);
      if (!b64) return;
      const a = document.createElement('a');
      a.href = 'data:application/octet-stream;base64,' + b64;
      a.download = name;
      a.click();
    }
  };
})();
