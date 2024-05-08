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

const addData = async (storeName, data) => {
    const store = await openIDB(storeName, "readwrite");
    store.add(data);
};

const updatePlant = async (plant) => {
    const store = await openIDB("plants", "readwrite");
    store.put(plant);
};

const addPlantToSyncQueue = async (plant) => {
    const store = await openIDB("sync-queue", "readwrite");
    store.add(plant);
    console.log("Plant added to sync queue");

    navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register("sync-plants");
    });
};

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
}

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
