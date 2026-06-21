const CACHE_NAME = 'qual-a-sena-mz-v3'; // 👈 muda este número (v3, v4...) sempre que publicares uma atualização
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instala o novo Service Worker e já o ativa, sem esperar
self.addEventListener('install', event => {
  self.skipWaiting(); // força a ativação imediata da nova versão
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Assume o controlo de todas as abas/instâncias abertas imediatamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // assume controlo sem precisar reabrir o app
  );
});

// Network-first: tenta sempre buscar a versão mais recente da internet primeiro
// Só usa o cache se não houver internet
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guarda a versão nova no cache para uso offline
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request)) // sem internet -> usa cache
  );
});
