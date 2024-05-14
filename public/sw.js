importScripts("/javascripts/idb-utils.js");

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open("static");
            console.log("Caching assets");

            try {
                await cache.addAll([
                    "/",
                    "/view-plants",
                    "/new-plant-sighting",

                    "/manifest.json",
                    "/stylesheets/style.css",

                    "/css/bootstrap.min.css",
                    "/js/bootstrap.min.js",

                    "/leaflet/leaflet.css",
                    "/leaflet/leaflet.js",

                    "/javascripts/idb-utils.js",
                    "/javascripts/index.js",
                    "/javascripts/map.js",
                    "/javascripts/new-plant.js",
                    "/javascripts/view-all-plants.js",

                    "/images/yuh.png",
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

            return fetch(event.request).catch((error) => {
                console.error(`Error fetching '${event.request.url}':`, error);
            });
        })()
    );
});

/**
 * Sends a plant to the server to be synced.
 * @param {Object} plant - The plant to sync
 */
async function syncPlant(plant) {
    let formData = new FormData();

    Object.keys(plant).forEach((key) => {
        formData.append(key, plant[key]);
    });

    const response = await fetch("/new-plant-sighting", {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        console.log("Plant synced successfully");
        const store = await openIDB("sync-queue", "readwrite");
        await store.delete(plant._id);
    } else {
        console.error("Error syncing plant:", response.statusText);
    }
}

self.addEventListener("sync", (event) => {
    if (event.tag === "sync-plants") {
        console.log("Syncing plants");
        event.waitUntil(
            (async () => {
                const plants = await getAllPlantsToSync();
                console.log("Plants to sync:", plants);
                await Promise.all(plants.map(syncPlant));
            })()
        );
    }
});
