const CACHE='iroom-v60-44-home2-clean-reference';
const CORE=[
'./','./index.html','./home2.html','./manifest.webmanifest','./favicon.ico',
'./iroom_assets/iroom-v60-15.js',
'./iroom_assets/iroom-v60-44-home2-clean-reference.css',
'./iroom_assets/iroom-v60-44-home2-clean-reference.js',
'./iroom_assets/iroom-logo-user.png',
'./iroom_assets/home2_v6044/hero.webp',
'./iroom_assets/home2_v6044/apple.webp',
'./iroom_assets/home2_v6044/pear.webp',
'./iroom_assets/home2_v6044/shine.webp',
'./iroom_assets/home2_v6044/mandarin.webp',
'./iroom_assets/home2_v6044/strawberry.webp',
'./iroom_assets/home2_v6044/pomegranate.webp',
'./iroom_assets/home2_v6044/grape.webp',
'./iroom_assets/home2_v6044/persimmon.webp',
'./iroom_assets/home2_v6044/gift.webp',
'./iroom_assets/home2_v6044/blueberry.webp',
'./iroom_assets/home2_v6044/kiwi.webp'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(u.pathname.startsWith('/api/')||u.pathname.includes('band-admin.html')||u.pathname.includes('admin-preview')){e.respondWith(fetch(e.request,{cache:'no-store'}));return}e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
