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
