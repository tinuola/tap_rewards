var express = require("express");
var bodyParser = require("body-parser");
var routes = require('./routes');
var app = express();

//==============
//express Usage
//==============
app.set("view engine", "ejs");
app.use(express.static("public"));

//==============
//bodyParser Usage
//==============
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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