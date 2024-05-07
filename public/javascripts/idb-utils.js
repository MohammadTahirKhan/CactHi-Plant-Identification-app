const openIDB = (storeName, mode) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("plants");
    request.addEventListener("upgradeneeded", () => {
      console.log("Upgrading IndexedDB");

      const db = request.result;
      db.createObjectStore("username", {
        keyPath: "username",
        autoIncrement: true,
      });
      db.createObjectStore("plants", { keyPath: "_id", autoIncrement: true });
    });

    request.addEventListener("success", () => {
      console.log("Successfully opened IndexedDB");
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

const getData = async (storeName, key) => {
  const store = await openIDB(storeName, "readonly");
  return new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
};

const getAllData = async (storeName) => {
  const store = await openIDB(storeName, "readonly");
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


if (window.location.pathname !== "/landing-page") {
  getCurrentUser()
    .then((username) => {
      document.getElementById("username").innerText = username;
    })

    .catch((error) => {
      window.location.href = "/landing-page";
    });
}
