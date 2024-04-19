
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

    if (req.query.sort === 'recent') {
      plants.sort((a, b) => b.date_time_added - a.date_time_added);

    } else if (req.query.sort === 'oldest') {
      plants.sort((a, b) => a.date_time_added - b.date_time_added);

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
    }

    res.render('view-all-plants', {title: 'View All Plants', plants: plants, sort: req.query.sort});
  })
});

router.get('/view-plants/:uid', function(req, res, next) {
  plantModel.findById(req.params.uid).then(plant => {
    res.render('plant-detail', {title: `${plant.name} Details`, plant: plant});
  })
});

router.post('/changeChat', function (req, res, next) {
  const pushData = req.body.historyChat.split("$$");
  console.log(pushData[0]);
  console.log("ABOVE THIS");
  let result = plants.updateField(pushData[0], 'chat',pushData[1]);
  console.log(result);
  res.redirect('/');
});


module.exports = router;