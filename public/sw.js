const CACHE='iroom-v60-59-home2-clock-restored';
const CORE=[
'./home2.html','./iroom_assets/iroom-v60-59-home2-clock-restored.css','./iroom_assets/iroom-v60-59-home2-clock-restored.js','./iroom_assets/iroom-logo-user.png','./iroom_assets/home2_v6056_hero_reference.webp',
'./iroom_assets/home2_v6055/apple.webp','./iroom_assets/home2_v6055/pear.webp','./iroom_assets/home2_v6055/shine.webp','./iroom_assets/home2_v6055/mandarin.webp','./iroom_assets/home2_v6055/peach.webp','./iroom_assets/home2_v6055/melon.webp','./iroom_assets/home2_v6055/pomegranate.webp','./iroom_assets/home2_v6055/plum.webp','./iroom_assets/home2_v6055/grapefruit.webp','./iroom_assets/home2_v6054_picnic.webp','./iroom_assets/home2_v6054_clock.webp'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))})
