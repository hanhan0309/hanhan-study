// Service Worker — 让 PWA 离线可用
const CACHE = 'hanhan-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './melody.js',
  './web-api.js',
  './renderer.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 导航请求走网络优先，失败才缓存
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./'))
    );
    return;
  }
  // 其他请求缓存优先
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
