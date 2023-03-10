importScripts("./assets/js/dexie.min.js");


const staticTodoApp = "todo-pwa-v1"; // cache name
//const staticTodoApp = "todo-pwa-v2"; // Replace first cache when upgrading

const assets = [
  ".",
  "/",
  "./index.html",
  "./todo-pwa.manifest.json",
  "./assets/js/dexie.min.js",
  "./assets/css/style.css",
  "./assets/js/main.js"
]

// This code executes in its own worker or thread
self.addEventListener("install", installEvent => {
  console.log("Service worker installed");
  installEvent.waitUntil(async () => {
    // Download and store assets
    const cache = await caches.open(staticTodoApp);
    return cache.addAll(assets);
    });
});

self.addEventListener("activate", event => {
  console.log("Service worker activated");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== staticTodoApp){
            return caches.delete(cacheName);
          };
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
    console.log(`URL requested: ${event.request.url}`);
    
  //  fetch(event.request); // Ignore cache and fetch request

    event.respondWith(
      caches.match(event.request)
      .then(cachedResponse => {
        // Update the cache to serve updated content on the next request
          return cachedResponse || fetch(event.request);
      }
    )
  )
});
