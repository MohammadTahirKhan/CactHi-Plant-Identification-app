
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

router.post('/suggest-name', async (req, res, next) => {
  try {
    // Extract suggestion data from the request
    const plantID = req.body.plantID;
    const suggestedName = req.body.suggestedName;
    const username = 'gardener123'; // TODO: CHANGE TO CURRENT USER'S USERNAME
  
    // Retrieve the plant document 
    const plant = await plantModel.findById(plantID);
    if (!plant) {
      // Plant document not found
      console.error('Plant not found for ID:', plantID);
      return res.status(404).send('Plant not found');
    }

    if (plant.suggested_names === null || plant.suggested_names === undefined) {
      plant.suggested_names = []; // Initialize suggested_names if it's null or undefined
    }
    plant.suggested_names.push({ username: username, suggestedName: suggestedName });
  
    // Save the updated plant document
    await plant.save();
  
    // Redirect or send response as needed
    res.redirect('/view-plants/' + plantID); 
  } catch (error) {
    console.error('Error while adding suggestion:', error);
    // Handle error and send appropriate response
    res.status(500).send('An error occurred while adding suggestion');
  }
});


router.get('/view-plants', function(req, res, next) {
  plants.getAll().then(plants => {
    plants = JSON.parse(plants)

    // TODO: CHANGE TO CURRENT USER'S USERNAME
    if (req.query.mySubmissions) {
      plants = plants.filter(plant => plant.user === "gardener123");
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