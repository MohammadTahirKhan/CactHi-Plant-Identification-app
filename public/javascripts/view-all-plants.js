/**
 * Controls the view-all-plants page.
 */


/**
 * Creates a card for a plant to display on the page.
 * @param {Object} plant - Plant object to create a card for
 * @returns {HTMLDivElement} Card element for the plant
 */
const createPlantCard = (plant) => {
    const URL = window.URL || window.webkitURL;
    const plantCard = document.createElement("div");

    plantCard.className = "col-12 col-md-6 col-lg-4 mb-4";
    plantCard.innerHTML = `
        <a class="card" href="/offline-detail?id=${plant._id}" style="text-decoration: none;">
            <img class="card-img-top img-fluid" src="${URL.createObjectURL(plant.image)}" alt="Picture of ${plant.name}" />
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="card-title">${plant.name}</h4>
                </div>
                <h6 class="card-subtitle text-muted mb-2">${plant.latitude}&deg; N, ${plant.longitude}&deg; W</h6>
                <p class="card-text">${plant.description}</p>
            </div>
            <div class="card-footer">
                <p class="card-text mb-0"><span class="text-muted">Posted by</span> ${plant.user}</p>
                <p class="card-text">
                    <span class="text-muted">Plant seen on</span>
                    ${new Date(plant.date_time_of_sighting).toLocaleDateString()}
                    <span class="text-muted">at</span>
                    ${new Date(plant.date_time_of_sighting).toLocaleTimeString()}
                </p>
            </div>
        </a>
    `;

    return plantCard;
};

// If online, relies on server to populate the page with plants.
// Updates plants in the IDB with the server's plants.
if (navigator.onLine) {
    fetch("/view-plants?json=on")
        .then((response) => response.json())
        .then(async (serverPlants) => {
            let idbPlants = await getAllIDBPlants();

            console.log("[SW] Syncing plants")
            for (let serverPlant of serverPlants) {
                let idbPlant = idbPlants.find((idbPlant) => idbPlant._id === serverPlant._id);

                const response = await fetch(`images/uploads/${serverPlant.image}`);
                serverPlant.image = await response.blob();

                // If the plant is not in the IDB, add it. Otherwise, update it.
                if (!idbPlant) {
                    addData("plants", serverPlant);
                } else {
                    Object.assign(idbPlant, serverPlant);
                    updatePlant(idbPlant);
                }
            }
        });

// If offline, populates the page with plants from the IDB.
// Plants that are created while offline are also displayed.
} else {
    const plantsDiv = document.getElementById("plants");
    plantsDiv.innerHTML = "";
    plantsDiv.dataset.masonry = "";
    plantsDiv.style = "";

    getAllIDBPlants().then(async (plants) => {
        const toSyncPlants = await getAllPlantsToSync();
        plants = plants.concat(toSyncPlants);

        plants.forEach((plant) => {
            const plantCard = createPlantCard(plant);
            plantsDiv.appendChild(plantCard);
        });
    });
}
