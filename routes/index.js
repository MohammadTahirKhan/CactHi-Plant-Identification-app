var express = require("express");
var router = express.Router();
var plants = require("../controllers/plants");

router.get("/", function (req, res, next) {
    res.render("index", { title: "PLANTS!!!" });
});

router.get("/landing-page", function (req, res, next) {
    res.render("landing-page", { title: "Welcome" });
});

router.get("/view-plants", function (req, res, next) {
    let result = plants.getAll();

    result.then(async (plants) => {
        let data = JSON.parse(plants);

        // Used by service worker to sync plants in indexedDB
        if (req.query.json) {
            res.json(data);
            return;
        }

        if (req.query.mySubmissions) {
            data = data.filter((plant) => plant.user === req.query.username);
        }

        if (req.query.sort === "oldest") {
            data.sort(
                (a, b) => new Date(a.date_time_of_sighting) - new Date(b.date_time_of_sighting)
            );

        } else if (req.query.sort === "unidentified") {
            data.sort((a, b) => a.identification_complete - b.identification_complete);

        } else if (req.query.sort === "closest" || req.query.sort === "farthest") {
            // User's geolocation
            location = req.query.location.split(",");

            // Euclidean distance between two points
            data.sort((a, b) => {
                aDistance = Math.sqrt(
                    Math.pow(a.latitude - location[0], 2) + Math.pow(a.longitude - location[1], 2)
                );
                bDistance = Math.sqrt(
                    Math.pow(b.latitude - location[0], 2) + Math.pow(b.longitude - location[1], 2)
                );

                if (req.query.sort === "closest") {
                  return aDistance - bDistance;
                } else {
                  return bDistance - aDistance;
                }
            });
            
          // Sort by most recently seen
        } else {
            data.sort(
                (a, b) => new Date(b.date_time_of_sighting) - new Date(a.date_time_of_sighting)
            );
        }

        res.render("view-all-plants", {
            title: "View All Plants",
            plants: data,
            sort: req.query.sort,
            mySubmissions: req.query.mySubmissions,
        });
    });
});

module.exports = router;
