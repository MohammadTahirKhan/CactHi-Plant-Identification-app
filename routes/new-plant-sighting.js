var express = require('express');
var router = express.Router();
var plantsController = require('../controllers/plants');
var multer = require('multer');

// Multer configuration for file upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        // Make the file name the date + the file extension
        filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('new-plant-sighting', { title: 'Plant Creation' });
});

router.post('/', function (req, res) {
    console.log(req.body.username);
    console.log(req.body["plant_name"]);
    console.log(req.body);
    res.render('index', { title: "Success" });
});

router.get('/add', function(req, res, next) {
    res.render('new-plant-sighting', { title: 'Add Plants' });
});

router.post('/add', upload.single('myImg'), function (req, res, next) {
    let plantData = req.body;
    let filePath = req.file.path;
    let result = plantsController.create(plantData, filePath);
    console.log(result);
    res.redirect('/');
});
module.exports = router;
