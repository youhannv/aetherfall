const C='streetquest3d-v2';
const A=['./','./index.html','./style.css','./game.js','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(e.request.url.startsWith(self.location.origin)){const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp))}return resp}).catch(()=>caches.match('./index.html'))))});