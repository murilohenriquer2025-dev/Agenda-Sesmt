const CACHE_NAME = 'agenda-sesmt-v2';
const OFFLINE_URL = '/Agenda-Sesmt/offline.html';
const ASSETS = [
  '/Agenda-Sesmt/',
  '/Agenda-Sesmt/index.html',
  '/Agenda-Sesmt/manifest.json',
  '/Agenda-Sesmt/icons/icon-192.png',
  '/Agenda-Sesmt/icons/icon-512.png',
  OFFLINE_URL
];

// Install: cache dos assets essenciais
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Falha ao fazer cache durante install:', err))
  );
});

// Activate: limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch: rota para navegação + cache-first para assets
self.addEventListener('fetch', event => {
  const req = event.request;

  // Apenas GET
  if (req.method !== 'GET') return;

  // Navegação (páginas) -> tenta network, fallback offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(resp => {
        // atualiza cache com nova versão da navegação
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return resp;
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Para recursos estáticos: cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkResp => {
        // salva no cache cópia dos assets para offline
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return networkResp;
      }).catch(() => {
        // fallback simples: se for imagem, retorna ícone; senão, nada
        if (req.destination === 'image') {
          return caches.match('/Agenda-Sesmt/icons/icon-192.png');
        }
      });
    })
  );
});
