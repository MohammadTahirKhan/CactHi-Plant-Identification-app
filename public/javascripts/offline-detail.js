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
    const plantCard = document.getElementById("plant-card");

    plantCard.innerHTML = `
        <img class="card-img-top object-fit-cover" src="${URL.createObjectURL(plant.image)}" alt="Picture of ${plant.name}"/>
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <h4 class="card-title">${plant.name}</h4>
            </div>
                
            <h6 class="card-subtitle text-muted mb-2">${plant.latitude}&deg; N, ${plant.longitude}&deg; W</h6>
            <p class="card-text">${plant.description}</p>
                
            <div class="row row-cols-2 row-cols-lg-3 text-center g-2 mb-4">
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Height</p>
                        <p class="mb-0">${plant.height} cm</p>
                    </div>
                </div>
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Spread</p>
                        <p class="mb-0">${plant.spread} cm</p>
                    </div>
                </div>
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Flower Colour</p>
                        <p class="mb-0">${plant.flower_colour}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Sun Exposure</p>
                        <p class="mb-0">${plant.sun_exposure}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Seeds/Fruit?</p>
                        <p class="mb-0">${plant.seeds_or_fruit ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <div class="col">
                    <div class="border rounded align-self-center p-2">
                        <p class="mb-0 text-muted">Leaves?</p>
                        <p class="mb-0">${plant.leaves ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
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
    `;

    return plantCard;
};

const sendChatText = async () => {
    const chatInput = document.getElementById("chat_input");
    if (!chatInput.value) return;

    const newMessage = document.createElement('p');
    const history = document.getElementById('history');
    const historyInput = document.getElementById('historyChat');
    
    newMessage.className = "current-user-message";
    newMessage.innerHTML = `${chatInput.value}`;
    history.appendChild(newMessage);
    historyInput.value += `${username}|${chatInput.value}||`;
    
    plantObj.chat += document.getElementById('historyChat').value;
    chatInput.value = '';
    await updatePlant(plantObj);
}

window.onbeforeunload = async () => {
    addPlantToSyncQueue(plantObj);
    console.log("Updated plant");
};

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
var username = null;
var plantObj = null;

console.log("Offline mode");

getCurrentUser().then((user) => {
    username = user;
});

getPlant(id).then((plant) => {
    plantObj = plant;
    createPlantCard(plant);
});