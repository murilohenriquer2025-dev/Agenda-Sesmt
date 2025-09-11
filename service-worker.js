// service-worker.js simples e funcional
const CACHE_NAME = 'agenda-sesmt-v1';
const ASSETS = [
  '/Agenda-Sesmt/',
  '/Agenda-Sesmt/index.html',
  '/Agenda-Sesmt/manifest.json',
  '/Agenda-Sesmt/icons/icon-192.png',
  '/Agenda-Sesmt/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Erro ao cachear assets:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', event => {
  // Serve do cache quando possível, senão busca na rede
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
