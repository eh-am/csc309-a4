var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');


var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/a4', function(err){
  if (err) {
    console.log("ERROR: MongoDB is not available at port 27017.")
    throw err;
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// general routes
var routes = require('./routes/index');

//prefix all routes with /api
app.use('/api', routes);

// middleware to handle uploads
app.use('/api/upload', multer({ 'dest': './public/uploads'}).single('file'), function (req, res, next){
  res.json(req.file.filename);
});



// if the request is not an api request, serve the index
app.all('/*', function (req, res){ //
  res.sendFile(path.join(__dirname, 'public') + '/index.html');
});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;