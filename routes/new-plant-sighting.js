var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('new-plant-sighting', { title: 'Plant Creation' });
});

router.post('/',function (req,res){
    console.log(req.body.username)
    console.log(req.body["plant_name"])
    console.log(req.body)
    res.render('index',{title:"Success"});
});

module.exports = router;
