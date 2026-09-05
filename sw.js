const C='streetquest3d-v20';
const CORE=['./','./index.html','./style.css','./game.js','./manifest.json','./icon-192.png','./icon-512.png','./version.json','./multiplayer-config.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('streetquest3d-')&&k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  )
});

self.addEventListener('message',e=>{
  if(e.data?.type==='SKIP_WAITING')self.skipWaiting();
});

async function networkFirst(req){
  const cache=await caches.open(C);
  try{
    const fresh=await fetch(req,{cache:'no-store'});
    if(fresh&&fresh.ok)cache.put(req,fresh.clone());
    return fresh
  }catch{
    return (await cache.match(req)) || (req.mode==='navigate'?cache.match('./index.html'):Response.error())
  }
}

async function cacheFirst(req){
  const cache=await caches.open(C);
  const hit=await cache.match(req);
  if(hit)return hit;
  const fresh=await fetch(req);
  if(fresh&&fresh.ok)cache.put(req,fresh.clone());
  return fresh
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    const core=/(\.html?|\.js|\.css|\.json)$/.test(url.pathname)||e.request.mode==='navigate';
    e.respondWith(core?networkFirst(e.request):cacheFirst(e.request))
  }else{
    e.respondWith(cacheFirst(e.request))
  }
});
