self.addEventListener("install", (event) => {
    event.waitUntil(
      (async () => {
        const cache = await caches.open("static");
        console.log("Caching assets");
  
        try {
          await cache.addAll([
            "/",
            "/manifest.json",
            "/view-plants",
            "/new-plant-sighting",
            "/stylesheets/style.css",
            "/css/bootstrap.min.css",
            "/js/bootstrap.min.js",
            "/javascripts/idb-utils.js",
            "/javascripts/offline-plants.js",
            "/images/yuh.png",
            "/leaflet/leaflet.css",
            "/leaflet/leaflet.js",
            "/javascripts/map.js"
          ]);
          console.log("Assets cached successfully");
        } catch (error) {
          console.error("Error caching assets:", error);
        }
      })()
    );
  });

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      keys.forEach((key) => {
        if (key !== "static") {
          caches.delete(key);
        }
      });
    })()
  );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
      (async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
  
        if (cachedResponse) {
          return cachedResponse;
        }
  
        // If the request is for an image, add it to the cache
        if (event.request.url.includes("/images/")) {
          try {
            const fetchResponse = await fetch(event.request);
            // Clone the response so we can use it more than once
            const responseClone = fetchResponse.clone();
            // Add the image to the cache
            cache.put(event.request, responseClone);
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
  
        return fetch(event.request).catch((error) => {
          console.error(`Error fetching '${event.request.url}':`, error);
        });
      })()
    );
  });

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-plants") {
  }
});
