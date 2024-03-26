let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PlantSchema = new Schema({
    name                    : {type: String, required: true},
    identification_complete : {type: Boolean, required: true, default: false},
    user                    : {type: String, required: true},
    chat                    : {type: String, required: false},
    description             : {type: String, required: true},
    image                   : {type: String, required: true},
    latitude                : {type: String, required: true},
    longitude               : {type: String, required: true},
    height                  : {type: Number, required: true},
    spread                  : {type: Number, required: true},
    flowers                 : {type: Boolean, required: true},
    flower_colour           : {type: String, required: true},
    leaves                  : {type: Boolean, required: true},
    seeds_or_fruit          : {type: Boolean, required: true},
    sun_exposure            : {type: String, required: true, enum: ['Full Sun', 'Partial Sun', 'Shade']},
    date_time_added         : {type: Date, required: true, default: Date.now},
    last_checked            : {type: Date, required: true, default: Date.now}
});

PlantSchema.set('toObject', {
    getters: true,
    virtuals: true
});

let Plant = mongoose.model('Plant', PlantSchema);

module.exports = Plant;