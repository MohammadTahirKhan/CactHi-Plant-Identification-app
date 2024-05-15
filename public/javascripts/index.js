/**
 * Main file for offline functionality.
 * Handles registration of the service worker and populating the navbar with the current user's username.
 */


/**
 * Registers the service worker.
 */
const registerSW = async () => {
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
        });
        if (registration.installing) {
            console.log("[SW] Installing");
        }
        if (registration.waiting) {
            console.log("[SW] Installed");
        }
        if (registration.active) {
            console.log("[SW] Active");
        }

        console.log("[SW] Online mode: ", navigator.onLine);
    }
};

window.onload = () => {
    registerSW();

    // If the user is not on the landing page, populate the navbar with the current user's username.
    // If a username is not found, redirect the user to the landing page to add one.
    if (window.location.pathname !== "/landing-page") {
        getCurrentUser()
            .then((username) => {
                document.getElementById("username").innerText = username;
            })

            .catch(() => {
                window.location.href = "/landing-page";
            });
    }
};
