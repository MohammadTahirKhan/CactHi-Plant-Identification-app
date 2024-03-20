
var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');

/* GET home page. */
router.get('/', function (req, res, next) {
  let result = plants.getAll()
  result.then(students => {
    let data = JSON.parse(students);
    //console.log(data)
    res.render('index', {title: 'PLANTS!!!', data: data});

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