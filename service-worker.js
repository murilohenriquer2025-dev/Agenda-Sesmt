const CACHE_NAME = 'agenda-sesmt-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Navegações -> tenta rede, senão cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Assets -> cache first
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
      if (r && r.status === 200) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return r;
    })).catch(() => {
      if (event.request.destination === 'image') return caches.match('./icons/icon-192.png');
    })
  );
});
