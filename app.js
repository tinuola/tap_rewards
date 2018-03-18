/*jshint esversion: 6 */

var express = require("express");
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var routes = require('./routes');
var path = require('path');
var app = express();
require('dotenv').config();

//==============
// express Usage
//==============
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

//==============
// bodyParser Usage
//==============
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//==============
// form validation
//==============
app.use(expressValidator());


//==============
// Authentication
//==============
// cookie
app.use(cookieParser());

// setup sessions
var sessionOptions = {
  secret: "purplestar",
  cookie: {},
  resave: false,
  saveUninitialized: true,
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


// global variables that are available to the views
app.use(function(req, res, next) {
  res.locals.errors = null;
  // req.user comes from passport 
  // makes 'user' available in the view
  res.locals.user = req.user || null;
  next();
});


//==============
// routes
//==============
app.use('/', routes);


//==============
// Server
//==============
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Tap Rewards server is running...");
});