
var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
var plantModel = require('../models/plants');


/* GET home page. */
router.get('/', function (req, res, next) {
  let result = plants.getAll()
  result.then(students => {
    let data = JSON.parse(students);
    //console.log(data)
    res.render('index', {title: 'PLANTS!!!', data: data});

  })
});

router.get('/view-plants', function(req, res, next) {
  plants.getAll().then(plants => {
    plants = JSON.parse(plants)

    // TODO: CHANGE TO CURRENT USER'S USERNAME
    if (req.query.mySubmissions) {
      plants = plants.filter(plant => plant.user === req.query.username);
    }

    if (req.query.sort === 'oldest') {
      plants.sort((a, b) => new Date(a.date_time_of_sighting) - new Date(b.date_time_of_sighting));

    } else if (req.query.sort === 'unidentified') {
      plants.sort((a, b) => a.identification_complete - b.identification_complete);

    } else if (req.query.sort === 'closest' || req.query.sort === 'farthest') {
      location = req.query.location.split(',');
      plants.sort((a, b) => {
        aDistance = Math.sqrt(Math.pow(a.latitude - location[0], 2) + Math.pow(a.longitude - location[1], 2));
        bDistance = Math.sqrt(Math.pow(b.latitude - location[0], 2) + Math.pow(b.longitude - location[1], 2));

        if (req.query.sort === 'closest')
          return aDistance - bDistance;

        return bDistance - aDistance;
      });
      
    } else {
      plants.sort((a, b) => new Date(b.date_time_of_sighting) - new Date(a.date_time_of_sighting));
    }

    res.render('view-all-plants', {title: 'View All Plants', plants: plants, sort: req.query.sort, mySubmissions: req.query.mySubmissions});
  })
});

router.get('/view-plants/:uid', function(req, res, next) {
  plantModel.findById(req.params.uid).then(plant => {
    res.render('plant-detail', {title: `${plant.name} Details`, plant: plant});
  })
});

router.post('/changeChat', (req, res, next) => {
  console.log(req.body);
  setImmediate(updateChat, req.body.plantID, req.body.historyChat);
  res.send('Chat update scheduled');
});

async function updateChat(plantID, historyChat) {
  await plants.updateField(plantID, 'chat', historyChat);
}


module.exports = router;