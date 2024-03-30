let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PlantSchema = new Schema({
    name                    : {type: String, required: true, default: ""},
    identification_complete : {type: Boolean, required: true, default: false},
    user                    : {type: String, required: true},
    chat                    : {type: String, required: false},
    description             : {type: String, required: true},
    image                   : {type: String, required: true},
    latitude                : {type: String, required: true},
    longitude               : {type: String, required: true},
    height                  : {type: String, required: true},
    spread                  : {type: String, required: true},
    flowers                 : {type: Boolean, required: true},
    flower_colour           : {type: String, required: true},
    leaves                  : {type: Boolean, required: true},
    fruits_or_seeds         : {type: Boolean, required: true},
    sun_exposure            : {type: String, required: true, enum: ['Full Sun', 'Partial Sun', 'Full Shade']},
    date_time_added         : {type: Date, required: true, default: Date.now},
    last_checked            : {type: Date, required: true, default: Date.now},
    date_of_sighting        : {type: Date, required: true, default: Date.now},
    time_of_sighting        : {type: String},
});

PlantSchema.set('toObject', {
    getters: true,
    virtuals: true
});

let Plant = mongoose.model('Plant', PlantSchema);

module.exports = Plant;