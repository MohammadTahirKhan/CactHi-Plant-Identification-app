var map = L.map("map", {
    center: [0, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    maxBounds: [
        [-90, -180],
        [90, 180],
    ],
});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    noWrap: true,
}).addTo(map);

/**
 * Adds a marker on the map with specified latitude and longitude
 */
addMarker = (lat, long) => {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    L.marker([lat, long]).addTo(map);
};

map.on("click", (e) => {
    addMarker(e.latlng.lat, e.latlng.lng);
    document.getElementById("latitude").value = e.latlng.lat;
    document.getElementById("longitude").value = e.latlng.lng;
});

/**
 * Adds a marker to the map at the user's current location
 */
const locationButton = document.getElementById("use-cur-location");
locationButton.onclick = (e) => {
    e.preventDefault();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById("latitude").value = position.coords.latitude;
            document.getElementById("longitude").value = position.coords.longitude;

            map.setView([position.coords.latitude, position.coords.longitude], 15);
            addMarker(position.coords.latitude, position.coords.longitude);
        });
    }
};
