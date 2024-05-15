
var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
var plantModel = require('../models/plants');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'PLANTS!!!'});
});

// Suggest a name for a plant
router.post('/suggest-name', async (req, res, next) => {
  try {
    // Extract suggestion data, plantId and user from the request
    const plantID = req.body.plantID;
    const suggestedName = req.body.suggestedName;
    const username = req.body.user;
  
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

// Approve a suggested name for a plant
router.post('/approve-suggestion', async (req, res, next) => {
  try {
    // Extract suggestion data from the request
    const plantID = req.body.plantID;
    const suggestedName = req.body.suggestedName;
    
    // Retrieve the plant document
    const plant = await plantModel.findById(plantID);
    if (!plant) {
      // Plant document not found
      console.error('Plant not found for ID:', plantID);
      return res.status(404).send('Plant not found');
    }
    
    // Update the plant document with the approved name
    plant.name = suggestedName;
    plant.identification_complete = true;

    // Save the updated plant document

    await plant.save();

    // Redirect or send response as needed
    res.redirect('/view-plants/' + plantID);
  } catch (error) {
    console.error('Error while approving suggestion:', error);
    // Handle error and send appropriate response
    res.status(500).send('An error occurred while approving suggestion');
  }
});






router.get('/view-plants', function(req, res, next) {  
  let result = plants.getAll();

  result.then(async plants => {
    let data = JSON.parse(plants);
    
    if (req.query.json) {
      res.json(data);
      return;
    }
    
  
    if (req.query.mySubmissions) {
      data = data.filter(plant => plant.user === req.query.username);
    }

      if (req.query.mySubmissions) {
        data = data.filter(plant => plant.user === req.query.username);
      }

      if (req.query.sort === 'oldest') {
        data.sort((a, b) => new Date(a.date_time_of_sighting) - new Date(b.date_time_of_sighting));

      } else if (req.query.sort === 'unidentified') {
        data.sort((a, b) => a.identification_complete - b.identification_complete);

      } else if (req.query.sort === 'closest' || req.query.sort === 'farthest') {
        location = req.query.location.split(',');
        data.sort((a, b) => {
          aDistance = Math.sqrt(Math.pow(a.latitude - location[0], 2) + Math.pow(a.longitude - location[1], 2));
          bDistance = Math.sqrt(Math.pow(b.latitude - location[0], 2) + Math.pow(b.longitude - location[1], 2));

          if (req.query.sort === 'closest')
            return aDistance - bDistance;

          return bDistance - aDistance;
        });

      } else {
        data.sort((a, b) => new Date(b.date_time_of_sighting) - new Date(a.date_time_of_sighting));
      }

      res.render('view-all-plants', {
        title: 'View All Plants',
        plants: data,
        sort: req.query.sort,
        mySubmissions: req.query.mySubmissions
      });
    })
  });

const fetchDbpediaData = async (plant) => {
  const endpointUrl = 'http://dbpedia.org/sparql';
  const sparqlQuery = `
            PREFIX dbo: <http://dbpedia.org/ontology/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?plant ?commonName ?description ?taxon
            WHERE {
              VALUES ?commonName { "${plant.name}"@en }
              ?plant rdfs:label ?commonName;
                      dbo:abstract ?description;
                      dbp:taxon ?taxon.
              FILTER (lang(?description) = "en")
            }
        `;
  const encodedQuery = encodeURIComponent(sparqlQuery);
  const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

  let response = await fetch(url);
  let json = await response.json();
  let result = json.results.bindings[0];
  return result ? {
    dbpediaUri: result.plant.value,
    commonName: result.commonName.value,
    description: result.description.value,
    taxon: result.taxon.value
  } : {};
};

const updatePlantWithDbpediaData = async (plant) => {
  let dbpediaData = await fetchDbpediaData(plant);

  plant.taxon = dbpediaData.taxon || "No taxon available";
  plant.dbpedia = dbpediaData.description 
    ? dbpediaData.description.length > 150
      ? dbpediaData.description.slice(0,150+dbpediaData.description.slice(150,160).indexOf(" ")) + " ..."
      : dbpediaData.description
    : "No DBpedia description available";
  plant.uri = dbpediaData.dbpediaUri || "No DBpedia URI available";
};

router.get('/view-plants/:uid', function(req, res, next) {
  plantModel.findById(req.params.uid).then(async plant => {
    await updatePlantWithDbpediaData(plant);
    res.render('plant-detail', {title: `${plant.name} Details`, plant: plant});
  }).catch(error => {
    res.status(404).send('Plant not found');
  });
});

router.get('/offline-detail', function(req, res, next) {
  res.render('offline-detail', {title: 'Offline Plant Detail'});
});


router.post('/changeChat', (req, res, next) => {
  setImmediate(updateChat, req.body.plantID, req.body.historyChat);
  res.send('Chat update scheduled');
});

router.post('/sync-offline-chat', (req, res, next) => {
  plantModel.findById(req.body.plantID).then(plant => {
      plant.chat += req.body.msg;
      plant.save()
          .then(() => {
              res.send('Chat sync successful');
          })
          .catch(error => {
              console.error(error);
              res.status(500).send('Chat sync failed');
          });
  })
  .catch(error => {
      console.error(error);
      res.status(500).send('Chat sync failed');
  });
});

async function updateChat(plantID, historyChat) {
  await plants.updateField(plantID, 'chat', historyChat);
}


module.exports = router;