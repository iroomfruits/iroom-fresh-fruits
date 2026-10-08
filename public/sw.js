/* IROOM Fresh Fruits — V60.98.3 stale-page prevention service worker.
   OAuth/navigation HTML is always network-first and old caches are removed on activation. */
const VERSION = 'iroom-v60-99-home2-fruit-refresh';
const STATIC_CACHE = `${VERSION}-static`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHES') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(fetch(req, {cache:'no-store'}).catch(() => caches.match(req)));
    return;
  }
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req, {cache:'no-store'}));
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(req);
      if (response && response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(req, response.clone()).catch(() => {});
      }
      return response;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
