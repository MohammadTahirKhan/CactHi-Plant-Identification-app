/**
 * Contains utility functions for interacting with IndexedDB.
 */

/**
 * Opens the specified IndexedDB store in the specified mode.
 * @param {string} storeName - One of: plants, sync-queue, username
 * @param {string} mode - One of: readwrite, readonly
 * @returns {Promise<IDBObjectStore>} The object store
 */
const openIDB = (storeName, mode) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants");

        request.addEventListener("upgradeneeded", () => {
            const db = request.result;

            db.createObjectStore("username", {
                keyPath: "username",
                autoIncrement: true,
            });

            db.createObjectStore("plants", {
                keyPath: "_id",
                autoIncrement: true,
            });

            db.createObjectStore("sync-queue", {
                keyPath: "_id",
                autoIncrement: true,
            });

            db.createObjectStore("chat-sync-queue", {
                keyPath: "_id",
                autoIncrement: true,
            });
        });

        request.addEventListener("success", () => {
            const db = request.result;
            const transaction = db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            resolve(store);
        });

        request.addEventListener("error", (error) => {
            reject(error);
        });
    });
};

/**
 * Adds the specified data to the specified store.
 * @param {string} storeName - Either plants or username
 * @param {Object} data - The data to add
 */
const addData = async (storeName, data) => {
    const store = await openIDB(storeName, "readwrite");
    store.add(data);
};

/**
 * Updates a plant in the 'plants' store.
 * @param {Object} plant - object to overwrite the existing plant with
 */
const updatePlant = async (plant) => {
    const store = await openIDB("plants", "readwrite");
    store.put(plant);
};

/**
 * Appends a message to the chat for the specified plant.
 * Adds the plant to the chat-sync-queue store and notifies the service worker to sync.
 * Then updates the chat in the plant store.
 * @param {string} _id - ID of the plant to update the chat for
 * @param {string} msg - message to add to the chat
 */
const updateChat = async (_id, msg) => {
    const store = await openIDB("chat-sync-queue", "readwrite");
    const request = store.get(_id);

    request.onsuccess = async function (event) {
        let chat = event.target.result;

        if (chat) {
            chat.chat += msg;
        } else {
            chat = { _id: _id, chat: msg };
        }
        store.put(chat);

        navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register("sync-chats");
        });

        const plantStore = await openIDB("plants", "readwrite");
        const plantRequest = plantStore.get(_id);

        plantRequest.onsuccess = function (event) {
            const plant = event.target.result;
            plant.chat += msg;
            plantStore.put(plant);
        };
    };
};

/**
 * Gets a plant from the IDB with the specified id.
 * @param {string} id - id of the plant to get
 * @returns {Promise<Object>} The plant with the specified id
 */
const getPlant = async (id) => {
    const store = await openIDB("plants", "readonly");

    return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};

/**
 * Adds a plant to the 'sync-queue' store and notifies the service worker to sync.
 * @param {Object} plant - plant to add to the sync queue
 */
const addPlantToSyncQueue = async (plant) => {
    const store = await openIDB("sync-queue", "readwrite");
    store.put(plant);

    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-plants");
    });
};

/**
 * Gets all plants in the 'sync-queue' store.
 * @returns {Promise<Array<Object>>} All plants in the 'sync-queue' store
 */
const getAllPlantsToSync = async () => {
    const store = await openIDB("sync-queue", "readonly");

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};

/**
 * Gets all plants in the 'chat-sync-queue' store.
 * @returns {Promise<Array<Object>>} All plants in the 'sync-queue' store
 */
const getAllChatsToSync = async () => {
    const store = await openIDB("chat-sync-queue", "readonly");

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};

/**
 * Gets all plants in the 'plants' store.
 * @returns {Promise<Array<Object>>} - All plants in the 'plants' store
 */
const getAllIDBPlants = async () => {
    const store = await openIDB("plants", "readonly");

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};

/**
 * Gets the current user from the 'username' store.
 * @returns {Promise<string>} - The username of the current user
 */
const getCurrentUser = async () => {
    const store = await openIDB("username", "readonly");

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = function (event) {
            if (event.target.result.length === 0) {
                reject("No user found");
                return;
            }

            resolve(event.target.result[0].username);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};
