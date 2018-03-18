/*jshint esversion: 6 */

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
let riders = riderData.get("riders").value();
let rewards = rewardData.get("rewards").value();

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
  const riderData2 = low(adapter1);
  let rider = riderData2.get('riders').find({id: req.params.id}).value();
  res.render("dashboard2", {rider:rider, rewards:rewards});
});

//Redeem rewards and update database
router.post("/dashboard/:id", function(req, res){
  let points = req.body.rewardPoints;
  const riderData2 = low(adapter1);
  let rider = riderData2.get('riders').find({id: req.params.id}).value();
  let balance = rider.pointBalance;
  balance -= points;

  riderData2.get('riders')
    .find({ id: rider.id })
    .assign({ pointBalance: balance})
    .write();

  res.redirect("/dashboard/" + rider.id);
});

//================
// auth routes
//================
//// User signup 

let signup_view_path = path.join("auth", "signup");

// display signup page
router.get("/signup", function(req, res) {
  res.render(signup_view_path);
});

// create user
router.post("/signup", function(req, res) {
  
  // remove extra spaces
  let formFirstName = req.body.firstname.trim();
  let formLastName = req.body.lastname.trim();
  let formEmail = req.body.email.trim();
  let formUsername = req.body.username.trim();
  let formPassword = req.body.password.trim();
  let formPassword2 = req.body.password2.trim();
  // creates random id
  let uniqueId = uuid();

  // form validation
  req.checkBody('username', 'Username must have at least 3 characters').isLength({min: 3});
  req.checkBody('password', 'Password must have at least 3 characters').isLength({min: 3});
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password confirmation is required').notEmpty();
  req.checkBody('password', 'Passwords do not match').equals(formPassword2);

  // check for errors
  var errors = req.validationErrors();
  // if there are errors, display signup page
  if (errors) {
    return res.render(signup_view_path, {errors: errors.map(function(error){
      return error.msg;})
    });
  }

  let options = {
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