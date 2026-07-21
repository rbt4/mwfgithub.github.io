const CACHE_PREFIX='deskline-app-';
const CACHE_NAME='deskline-app-v9-0-0';
const APP_SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './loader.js',
  './app-css-1.txt',
  './app-css-2.txt',
  './app-css-3.txt',
  './app-js-1.txt',
  './app-js-2.txt',
  './app-js-3.txt',
  './app-js-4.txt',
  './app-js-5.txt',
  './app-js-6.txt',
  './app-js-7.txt',
  './icons/icon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});

async function networkFirstNavigation(request){
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const cache=await caches.open(CACHE_NAME);
      eventSafePut(cache,'./index.html',response.clone());
    }
    return response;
  }catch(_){
    return (await caches.match('./index.html')) || Response.error();
  }
}

function eventSafePut(cache,key,response){
  cache.put(key,response).catch(()=>{});
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached){
      event.waitUntil((async()=>{
        try{
          const fresh=await fetch(request);
          if(fresh&&fresh.ok&&fresh.type==='basic'){
            const cache=await caches.open(CACHE_NAME);
            await cache.put(request,fresh);
          }
        }catch(_){ }
      })());
      return cached;
    }

    try{
      const response=await fetch(request);
      if(response&&response.ok&&response.type==='basic'){
        const cache=await caches.open(CACHE_NAME);
        event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
      }
      return response;
    }catch(_){
      return Response.error();
    }
  })());
});
