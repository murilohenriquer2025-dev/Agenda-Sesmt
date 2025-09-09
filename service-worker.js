const CACHE = 'agenda-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/Agenda-Sesmt/', '/Agenda-Sesmt/manifest.json', '/Agenda-Sesmt/icon-192.png'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
