const CACHE='iroom-v33-exact-3-fixes';
const ASSETS=['./','./index.html','./iroom_assets/iroom-v33.css','./iroom_assets/iroom-v33.js','./iroom_assets/iroom-logo-final.png','./iroom_assets/hero_faded/spring.jpg','./iroom_assets/hero_faded/summer.jpg','./iroom_assets/hero_faded/autumn.jpg','./iroom_assets/hero_faded/winter.jpg','./manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))})
