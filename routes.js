var router = require('express').Router();
var low = require('lowdb');
var path = require('path');
var uuid = require('uuid');
var authService = require('./services/authService');

//==============
//lowdb Usage
//==============
//create data json files
const FileSync = require("lowdb/adapters/FileSync");
const adapter1 = new FileSync("data/riderData.json");
const adapter2 = new FileSync("data/rewardData.json");
const riderData = low(adapter1);
const rewardData = low(adapter2);

//==============
//Database data
//==============
//Get all info from rider and reward dbs
var riders = riderData.get("riders").value();
var rewards = rewardData.get("rewards").value();

//==============
//Routes
//==============

//Landing page
router.get("/", function(req,res){
  res.render("home");
});

//Main dashboard
router.get("/dashboard", function(req, res){
  res.render("dashboard", {riders:riders, rewards:rewards});
});

//Display rider's dashboard
router.get("/dashboard/:id", function(req, res){
  var rider = riderData.get('riders').find({id: req.params.id}).value();
  res.render("dashboard2", {rider:rider, rewards:rewards});
});

//Redeem rewards and update database
router.post("/dashboard/:id", function(req, res){
  var points = req.body.rewardPoints;
  var rider = riderData.get('riders').find({id: req.params.id}).value();
  var balance = rider.pointBalance;
  balance -= points;

  riderData.get('riders')
    .find({ id: rider.id })
    .assign({ pointBalance: balance})
    .write();

  res.redirect("/dashboard/" + rider.id);
});

//================
// auth routes
//================
//// User signup 

var signup_view_path = path.join("auth", "signup");

// display signup page
router.get("/signup", function(req, res) {
  res.render(signup_view_path, {errors: [] });
});

// create user
router.post("/signup", function(req, res) {
  
  // remove extra spaces
  var formFirstName = req.body.firstname.trim();
  var formLastName = req.body.lastname.trim();
  var formEmail = req.body.email.trim();
  var formUsername = req.body.username.trim();
  var formPassword = req.body.password.trim();
  var formPassword2 = req.body.password2.trim();
  //creates random id
  var uniqueId = uuid();

  var options = {
    firstName: formFirstName,
    lastName: formLastName,
    email: formEmail,
    username: formUsername,
    password: formPassword,
    id: uniqueId,
    signupSuccessRedirectUrl: "/dashboard",
    signUpTemplate: signup_view_path
  };
  authService.signup(options, res);
});


//////Login page
router.get("/login", function(req,res){
  res.render("login");
});

module.exports = router;