const createPlantCard = (plant) => {
    const URL = window.URL || window.webkitURL;
    const plantCard = document.createElement("div");

    plantCard.className = "col-12 col-md-6 col-lg-4 mb-4";
    plantCard.innerHTML = `
        <a class="card" href="/view-plants/${plant._id}" style="text-decoration: none;">
            <img class="card-img-top img-fluid" src="${URL.createObjectURL(
                plant.image
            )}" alt="Picture of ${plant.name}" />
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="card-title">${plant.name}</h4>
                </div>
                <h6 class="card-subtitle text-muted mb-2">${plant.latitude}&deg; N, ${
        plant.longitude
    }&deg; W</h6>
                <p class="card-text">${plant.description}</p>
            </div>
            <div class="card-footer">
                <p class="card-text mb-0"><span class="text-muted">Posted by</span> ${
                    plant.user
                }</p>
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

const registerSW = async () => {
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
        });
        if (registration.installing) {
            console.log("Service worker installing");
        }
        if (registration.waiting) {
            console.log("Service worker installed");
        }
        if (registration.active) {
            console.log("Service worker active");
        }
    }
};

window.onload = () => {
    registerSW();

    if (window.location.pathname !== "/landing-page") {
        getCurrentUser()
            .then((username) => {
                document.getElementById("username").innerText = username;
            })

            .catch(() => {
                window.location.href = "/landing-page";
            });
    }

    if (window.location.pathname === "/view-plants") {
        if (navigator.onLine) {
            console.log("Online mode");

            fetch("/view-plants?json=on")
                .then((response) => response.json())
                .then(async (serverPlants) => {
                    console.log("Updating plants in IDB");

                    let idbPlants = await getAllIDBPlants();

                    for (let serverPlant of serverPlants) {
                        let idbPlant = idbPlants.find(
                            (idbPlant) => idbPlant._id === serverPlant._id
                        );

                        
                        if (!idbPlant) {
                            const response = await fetch(`images/uploads/${serverPlant.image}`);
                            serverPlant.image = await response.blob();
                            addData("plants", serverPlant);
                        } else {
                            for (let key in serverPlant) {
                                if (idbPlant[key] !== serverPlant[key]) {
                                    if (key === "image") {
                                        const response = await fetch(`images/uploads/${serverPlant.image}`);
                                        serverPlant.image = await response.blob();
                                    }
                                    idbPlant[key] = serverPlant[key];
                                }
                            }
                            updatePlant(idbPlant);
                        }
                    }
                });
        } else {
            console.log("Offline mode");

            const plantCards = document.querySelectorAll(".plant-card");
            plantCards.forEach((plantCard) => {
                plantCard.remove();
            });

            const noPlantsElement = document.getElementById("no-plants");
            if (noPlantsElement) {
                noPlantsElement.remove();
            }

            const plantsDiv = document.getElementById("plants");
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
    }
};
