/* IROOM Fresh Fruits - Service Worker v52 */

const VERSION = 'iroom-v52-20260826';
const STATIC_CACHE = `${VERSION}-static`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys.map((key) => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.map(key => caches.delete(key)))
      )
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* 홈페이지 HTML은 항상 서버 최신 버전을 사용 */
  if (
    req.mode === 'navigate' ||
    req.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req, {
            cache: 'no-store'
          });
        } catch (err) {
          const cached = await caches.match(req);

          if (cached) return cached;

          throw err;
        }
      })()
    );

    return;
  }

  /* API 역시 캐시하지 않음 */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req, {
        cache: 'no-store'
      })
    );

    return;
  }

  /* 사진 등은 최신 파일 우선 */
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(req);

          if (response && response.ok) {
            const cache =
              await caches.open(STATIC_CACHE);

            cache.put(
              req,
              response.clone()
            );
          }

          return response;

        } catch (err) {

          const cached =
            await caches.match(req);

          if (cached) return cached;

          throw err;
        }
      })()
    );
  }
});
