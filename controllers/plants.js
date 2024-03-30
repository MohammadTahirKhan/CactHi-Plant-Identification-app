const plantModel = require('../models/plants');

exports.create = function (plantData, filePath) {
    // Create a new plant instance using the provided plant data
    let plant = new plantModel({
        name: plantData.name,
        identification_complete: plantData.identification_complete,
        user: plantData.user,
        chat: plantData.chat,
        description: plantData.description,
        image: filePath, // Assuming this is the field for image path
        latitude: plantData.latitude,
        longitude: plantData.longitude,
        height: plantData.height,
        spread: plantData.spread,
        flowers: plantData.flowers,
        flower_colour: plantData.flower_colour,
        leaves: plantData.leaves,
        seeds_or_fruit: plantData.seeds_or_fruit,
        sun_exposure: plantData.sun_exposure,
        date_time_added: plantData.date_time_added,
        last_checked: plantData.last_checked
    });

    // Save the plant to the database and handle success or failure
    return plant.save().then(plant => {
        // Log the created plant
        console.log(plant);

        // Return the plant data as a JSON string
        return JSON.stringify(plant);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};


exports.getAll = function () {
    return plantModel.find({}).then(plants => {
        return JSON.stringify(plants);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

exports.updateField = function (plantId, fieldToUpdate, updatedValue) {
    return plantModel.findByIdAndUpdate(plantId, { [fieldToUpdate]: updatedValue }, { new: true }).then(updatedPlant => {
        if (!updatedPlant) {
            return null;
        }

        console.log('Updated plant:', updatedPlant);

        // Return the updated student as a JSON string
        return JSON.stringify(updatedPlant);
    }).catch(err => {
        // Log the error if update fails
        console.error('Error updating history field:', err);

        // Return null in case of an error
        return null;
    });
};