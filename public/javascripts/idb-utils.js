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
            console.log("Upgrading IndexedDB");

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
 * Gets a plant from the 'plants' store with the specified id.
 * @param {number} id - id of the plant to get
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
    store.add(plant);
    console.log("Plant added to sync queue");

    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-plants");
    });
};

/**
 * Gets all plants in the 'sync-queue' store.
 * @returns {Promise<Array<Object>>} - All plants in the 'sync-queue' store
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
            }

            resolve(event.target.result[0].username);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
};
