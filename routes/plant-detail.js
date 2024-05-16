var express = require("express");
var router = express.Router();
var plantModel = require("../models/plants");
var plants = require("../controllers/plants");

/**
 * Fetches the common name, description, and taxon of a plant from DBpedia
 * @param {Object} plant - Plant to fetch data for
 * @returns {Object} Object containing the fetched data
 */
const fetchDbpediaData = async (plant) => {
    const endpointUrl = "http://dbpedia.org/sparql";
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
    return result
        ? {
              dbpediaUri: result.plant.value,
              commonName: result.commonName.value,
              description: result.description.value,
              taxon: result.taxon.value,
          }
        : {};
};

/**
 * Updates a plant with data fetched from DBpedia
 * @param {Object} plant - Plant to update with DBpedia data
 */
const updatePlantWithDbpediaData = async (plant) => {
    let dbpediaData = await fetchDbpediaData(plant);

    plant.taxon = dbpediaData.taxon || "No taxon available";
    plant.dbpedia = dbpediaData.description
        ? dbpediaData.description.length > 150
            ? dbpediaData.description.slice(
                  0,
                  150 + dbpediaData.description.slice(150, 160).indexOf(" ")
              ) + " ..."
            : dbpediaData.description
        : "No DBpedia description available";
    plant.uri = dbpediaData.dbpediaUri || "No DBpedia URI available";
};

router.get("/view-plants/:uid", async function (req, res, next) {
    try {
        const plant = await plantModel.findById(req.params.uid);
        if (!plant) {
            return res.status(404).send("Plant not found");
        }

        await updatePlantWithDbpediaData(plant);
        res.render("plant-detail", { title: `${plant.name} Details`, plant: plant });
    } catch (error) {
        console.error("Error while fetching plant:", error);
        res.status(500).send("An error occurred while fetching plant");
    }
});

// Alternative route for plant detail while offline
router.get("/offline-detail", function (req, res, next) {
    res.render("offline-detail", { title: "Offline Plant Detail" });
});

// Updates a plant's chat with current chat history from a user that is online
router.post("/changeChat", (req, res, next) => {
    setImmediate(updateChat, req.body.plantID, req.body.historyChat);
    res.send("Chat update scheduled");
});

async function updateChat(plantID, historyChat) {
    await plants.updateField(plantID, "chat", historyChat);
}

// Updates a plant's chat with the message sent by the user while offline
router.post("/sync-offline-chat", async (req, res, next) => {
    try {
        const { plantID, msg } = req.body;

        const plant = await plantModel.findByIdAndUpdate(
            plantID,
            { $push: { chat: msg } },
            { new: true, useFindAndModify: false }
        );

        if (!plant) {
            console.error("Plant not found for ID:", plantID);
            return res.status(404).send("Chat sync failed");
        }

        res.send("Chat sync successful");
    } catch (error) {
        console.error("Error while syncing chat:", error);
        res.status(500).send("Chat sync failed");
    }
});

// Approve a suggested name for a plant
router.post("/approve-suggestion", async (req, res, next) => {
    try {
        const { plantID, suggestedName } = req.body;

        const plant = await plantModel.findByIdAndUpdate(
            plantID,
            { name: suggestedName, identification_complete: true },
            { new: true, useFindAndModify: false }
        );

        if (!plant) {
            console.error("Plant not found for ID:", plantID);
            return res.status(404).send("Plant not found");
        }

        res.redirect("/view-plants/" + plantID);
    } catch (error) {
        console.error("Error while approving suggestion:", error);
        res.status(500).send("An error occurred while approving suggestion");
    }
});

// Suggest a name for a plant
router.post("/suggest-name", async (req, res, next) => {
    try {
        const { plantID, suggestedName, user: username } = req.body;

        const plant = await plantModel.findOneAndUpdate(
            { _id: plantID },
            { $push: { suggested_names: { username, suggestedName } } },
            { new: true, useFindAndModify: false }
        );

        if (!plant) {
            console.error("Plant not found for ID:", plantID);
            return res.status(404).send("Plant not found");
        }

        res.redirect("/view-plants/" + plantID);
    } catch (error) {
        console.error("Error while adding suggestion:", error);
        res.status(500).send("An error occurred while adding suggestion");
    }
});

module.exports = router;
