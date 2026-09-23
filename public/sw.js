const CACHE='iroom-v60-27-home2-editorial';
const CORE=[
  './','./index.html','./home2.html','./manifest.webmanifest','./favicon.ico',
  './iroom_assets/iroom-v60-15.css','./iroom_assets/iroom-v60-15.js','./iroom_assets/iroom-v60-16-dual.css',
  './iroom_assets/iroom-v60-27-home2-editorial.css','./iroom_assets/iroom-v60-27-home2-editorial.js',
  './iroom_assets/stilllife27/hero.webp','./iroom_assets/stilllife27/apple.webp','./iroom_assets/stilllife27/pear.webp','./iroom_assets/stilllife27/shine.webp',
  './iroom_assets/stilllife27/chestnut.webp','./iroom_assets/stilllife27/fig.webp','./iroom_assets/stilllife27/pomegranate.webp',
  './iroom_assets/iroom-owner-sketch-v60-16.png','./iroom_assets/iroom-logo-final.png',
  './iroom_assets/iroom-app-icon-32-v60-10.png','./iroom_assets/iroom-app-icon-64-v60-10.png',
  './iroom_assets/iroom-app-icon-180-v60-10.png','./iroom_assets/iroom-app-icon-192-v60-10.png',
  './iroom_assets/iroom-app-icon-512-v60-10.png','./iroom_assets/iroom-app-icon-512-maskable-v60-10.png'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(u.pathname.startsWith('/api/')||u.pathname.includes('band-admin.html')||u.pathname.includes('admin-preview')){
    e.respondWith(fetch(e.request,{cache:'no-store'}));return;
  }
  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
