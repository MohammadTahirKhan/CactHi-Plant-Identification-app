
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

router.post('/changeChat', function (req, res, next) {

  res.redirect('/');
  console.log(req);
  console.log("X");

});

module.exports = router;