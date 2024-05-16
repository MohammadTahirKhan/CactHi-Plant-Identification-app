importScripts("/javascripts/idb-utils.js");

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open("static");
            console.log("[SW] Caching assets");

            try {
                await cache.addAll([
                    "/",
                    "/landing-page",
                    "/view-plants",
                    "/new-plant-sighting",
                    "/offline-detail",

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
                    "/javascripts/offline-detail.js",
                    "/javascripts/view-all-plants.js",

                    "/images/cactusfriend.png",
                ]);
            } catch (error) {
                console.error("[SW] Error caching assets:", error);
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
    const url = new URL(event.request.url);

    // Skip fetch for uploaded images
    if (!navigator.onLine && url.pathname.startsWith("/images/uploads")) {
        event.respondWith(new Response("", { status: 200 }));
        return;
    }

    event.respondWith(
        (async () => {
            try {
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                const cache = await caches.open("static");
                // Remove the search query from the URL to match the cache
                url.search = "";

                const cachedResponse = await cache.match(url.toString(), { ignoreSearch: true });
                if (cachedResponse) {
                    return cachedResponse;
                }

                throw error;
            }
        })()
    );
});

/**
 * Sends a plant to the server to be synced.
 * @param {Object} plant - The plant to sync
 */
const syncPlant = async (plant) => {
    let formData = new FormData();

    Object.keys(plant).forEach((key) => {
        formData.append(key, plant[key]);
    });

    const response = await fetch("/new-plant-sighting", {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        const store = await openIDB("sync-queue", "readwrite");
        await store.delete(plant._id);
    } else {
        console.error("[SW] Error syncing plant:", response.statusText);
    }
};

/**
 * Sends a chat to the server to be synced.
 * @param {Object} chat - The chat to sync
 */
const syncChat = async (chat) => {
    const data = new URLSearchParams();
    data.append("plantID", chat._id);
    data.append("msg", chat.chat);

    const response = await fetch("/sync-offline-chat", {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (response.ok) {
        const store = await openIDB("chat-sync-queue", "readwrite");
        await store.delete(chat._id);
    } else {
        console.error("[SW] Error syncing chat:", response.statusText);
    }
};

self.addEventListener("sync", (event) => {
    // Uploading newly created plants while offline to the server
    if (event.tag === "sync-plants") {
        console.log("[SW] Uploading plants to server");
        event.waitUntil(
            (async () => {
                const plants = await getAllPlantsToSync();
                await Promise.all(plants.map(syncPlant));
            })()
        );
    }

    // Uploading chat messages while offline to the server
    if (event.tag === "sync-chats") {
        console.log("[SW] Uploading chat messages to server");
        event.waitUntil(
            (async () => {
                const chats = await getAllChatsToSync();
                await Promise.all(chats.map(syncChat));
            })()
        );
    }
});
