const plantIDB = indexedDB.open('plants');
var CURRENT_USER;

plantIDB.addEventListener('upgradeneeded', () => {
    console.log('Upgrading IndexedDB');

    const db = plantIDB.result;
    db.createObjectStore('usernames', { keyPath: 'username' });
});

plantIDB.addEventListener('success', () => {
    console.log('Successfully opened IndexedDB');
    const transaction = plantIDB.result.transaction(['usernames'], 'readonly');
    const store = transaction.objectStore('usernames');
    const getRequest = store.getAll();

    getRequest.addEventListener('success', () => {
        if (getRequest.result.length === 0) {
            console.log('No usernames in IndexedDB');
            return;
        }

        console.log('Got username from IndexedDB');
        let username = getRequest.result[0].username;
        CURRENT_USER = username;

        if (window.location.href.includes('landing-page')) {
            window.location.href = '/';
        }
        
        const usernameElement = document.getElementById('username');
        usernameElement.innerText = username;
    });
});

plantIDB.addEventListener('error', (error) => {
    console.error(error);
});

