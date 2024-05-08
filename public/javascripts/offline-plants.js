const createPlantCard = (plant) => {
  const URL = window.URL || window.webkitURL;
  const plantCard = document.createElement("div");

  plantCard.className = "col-12 col-md-6 col-lg-4 mb-4";
  plantCard.innerHTML = `
        <a class="card" href="/view-plants/${plant._id}" style="text-decoration: none;">
            <img class="card-img-top img-fluid" src="${URL.createObjectURL(plant.image_of_plant)}" alt="Picture of ${plant.name}" />
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="card-title">${plant.name}</h4>
                </div>
                <h6 class="card-subtitle text-muted mb-2">${plant.latitude}&deg; N, ${plant.longitude}&deg; W</h6>
                <p class="card-text">${plant.description}</p>
            </div>
            <div class="card-footer">
                <p class="card-text mb-0"><span class="text-muted">Posted by</span> ${plant.username}</p>
                <p class="card-text">
                    <span class="text-muted">Plant seen on</span>
                    ${new Date(plant.datetime).toLocaleDateString()}
                    <span class="text-muted">at</span>
                    ${new Date(plant.datetime).toLocaleTimeString()}
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

registerSW();

window.onload = () => {
  if (!navigator.onLine && window.location.pathname === "view-plants") {
    console.log("Offline mode");

    const noPlantsElement = document.getElementById("no-plants");
    const plantsDiv = document.getElementById("plants");
    plantsDiv.dataset.masonry = "";
    plantsDiv.style = "";

    if (noPlantsElement) {
      noPlantsElement.remove();
    }

    getAllIDBPlants().then((plants) => {
      plants.forEach((plant) => {
        console.log(plant);
        const plantCard = createPlantCard(plant);
        plantsDiv.appendChild(plantCard);
      });
    });
  }
};
