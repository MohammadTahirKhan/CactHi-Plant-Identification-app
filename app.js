var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const socketIo = require('socket.io');

var indexRouter = require('./routes/index');
var newPlantRouter = require('./routes/new-plant-sighting');
var plantDetailRouter = require('./routes/plant-detail');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist/'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images/uploads', express.static(path.join(__dirname, '/public/images/uploads')));

app.use('/', indexRouter);
app.use('/new-plant-sighting', newPlantRouter);
app.use('/', plantDetailRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
