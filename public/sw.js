const CACHE="iroom4-v24-static-1";
const CORE=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./iroom_assets/iroom-v8.css?v=24",
  "./iroom_assets/iroom-v8.js?v=24",
  "./iroom_assets/iroom-logo-final.png",
  "./iroom_assets/app-icon-192.png",
  "./iroom_assets/app-icon-512.png"
];
self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));
});
self.addEventListener("activate",event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin || url.pathname.includes("/api/"))return;
  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put("./index.html",copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      }
      return res;
    }))
  );
});
