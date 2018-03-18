var express = require("express");
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var routes = require('./routes');
var path = require('path');
var app = express();

//==============
//express Usage
//==============
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

//==============
//bodyParser Usage
//==============
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//==============
// form validation
app.use(expressValidator());
//==============

// global variables that are available to the views
app.use(function(request, response, next) {
  response.locals.errors = null;
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