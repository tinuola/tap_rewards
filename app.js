/*jshint esversion: 6 */

var express = require("express");
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var store = require('connect-nedb-session')(session);
var flash = require('connect-flash');
var routes = require('./routes');
var path = require('path');
var app = express();
require('dotenv').config();

//==============
// express usage
//==============
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

//==============
// bodyParser usage
//==============
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//==============
// form validation
//==============
app.use(expressValidator());


//==============
// authentication
//==============
// cookie
app.use(cookieParser());

// setup sessions
let sessionOptions = {
  store: new store({filename: path.join('data', 'sessionFile.json')}),
  secret: "purplestar",
  cookie: {},
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionOptions.cookie.secure = true; // serve secure cookies for https
}
app.use(session(sessionOptions));

// intialize passport
app.use(passport.initialize());
// use express.session() before passport.session()
app.use(passport.session());


//==============
// flash
//==============
app.use(flash());


// global variables available to views dir
app.use(function(req, res, next) {
  res.locals.errors = null;
  // req.user from passport; makes 'user' available in the view
  res.locals.user = req.user || null;
  // req.flash from flash
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});


//==============
// routes
//==============
app.use('/', routes);


//==============
// Server
//==============
let port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Tap Rewards server is running...");
});