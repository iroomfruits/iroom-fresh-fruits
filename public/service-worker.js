const CACHE='iroom-v81';
const CORE=[
  '/',
  '/index.html',
  '/band-order.html',
  '/manifest.webmanifest'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .catch(err=>console.warn('[SW] precache failed',err))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);

  // API calls must always go to network.
  if(url.pathname.startsWith('/api/')){
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation pages: network first, cached fallback.
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
          return response;
        })
        .catch(async()=>{
          const exact=await caches.match(event.request);
          if(exact)return exact;
          if(url.pathname.includes('band-order'))return caches.match('/band-order.html');
          return caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});