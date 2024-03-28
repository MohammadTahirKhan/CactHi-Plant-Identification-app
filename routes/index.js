
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
    res.render('view-all-plants', {title: 'View All Plants', plants: plants});
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