getCurrentUser().then((username) => {
    document.querySelector('input[name="user"]').value = username;
});

console.log("online", navigator.onLine);

const form = document.getElementById("new-plant-form");
form.onsubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    var plant = {};
    formData.forEach((value, key) => {
        plant[key] = value;
    });

    if (navigator.onLine) {
        fetch("/new-plant-sighting", {
            method: "POST",
            body: formData,
        }).then((response) => {
            if (response.ok) {
                window.location.href = "/view-plants";
            }
        });
    } else {
        await addPlantToSyncQueue(plant);
        // window.location.href = "/view-plants";
    }
};
