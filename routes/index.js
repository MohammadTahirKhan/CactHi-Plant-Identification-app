
var express = require('express');
var router = express.Router();

var plants = require('../controllers/plants')

/* GET home page. */
router.get('/', function (req, res, next) {
  let result = plants.getAll()
  result.then(students => {
    let data = JSON.parse(students);
    console.log(data)
    res.render('index', {title: 'PLANTS!!!', data: data});

  })

});



module.exports = router;
