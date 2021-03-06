var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var course = require('./models/courses');
var LocalStrategy = require('passport-local').LocalStrategy;
var session = require('express-session');
require('dotenv').config();
console.log(process.env.mongourl)
var mongoDBuRl = process.env.mongourl || "mongodb://127.0.0.1:27017/myffcs";
var app = express();
mongoose.connect(mongoDBuRl);
var index = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: "myFFCS",
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
//Uncomment it for first time when inserting courses
//course.insertCourses();


app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000)
module.exports = app;
