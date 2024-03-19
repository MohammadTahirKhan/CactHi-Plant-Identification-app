const plantModel = require('../models/plants');

exports.create = (plantData) => {
    let plant = new plantModel(plantData);

    return plant.save().then(plant => {
        return JSON.stringify(plant);
    }).catch(err => {
        console.log(err);
        return null;
    });
}

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