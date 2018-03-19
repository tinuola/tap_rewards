/*jshint esversion: 6 */

var router = require('express').Router();
var low = require('lowdb');
var path = require('path');
var uuid = require('uuid');
var authService = require('./services/authService');
var passport = require('passport');
authService.configurePassport(passport);

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

//Display rider's dashboard
router.get("/dashboard/:id", function(req, res){
  const riderData2 = low(adapter1);
  let rider = riderData2.get('riders').find({id: req.params.id}).value();
  res.render("dashboard", {rider:rider, rewards:rewards});
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

// display signup page if user is not logged in
router.get("/signup", isLoggedOut(), function(req, res) {
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
  let uniqueId = uuid();

  // form validation
  req.checkBody('username', 'Username must have at least 3 characters').isLength({min: 3});
  req.checkBody('password', 'Password must have at least 3 characters').isLength({min: 3});
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password confirmation is required').notEmpty();
  req.checkBody('password', 'Passwords do not match').equals(formPassword2);

  // check for errors
  let errors = req.validationErrors();
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

//================
// login routes
//================
let login_view_path = path.join("auth", "login");

// display login page if user is not logged in
router.get("/login", isLoggedOut(), function(req,res){
  res.render(login_view_path, { errors: [] });
});

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login',
  successFlash: 'You are logged in',
  failureFlash: true }),
  function(req, res, user) {
    res.redirect('/dashboard/' + req.user.id);
  });

// display logout
router.get('/logout', function(req, res){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


//================
// middleware
//================
// isAuthenticated (passport)
// when a user is logged in, isAuthenticated return true

function isLoggedIn () {
	return (req, res, next) => {
    // logged in user? continue and execute function for the route
    if (req.isAuthenticated()) return next(); 
    // user not logged in? skip function for the route, redirect to login page
    return res.redirect('/login');
	};
}

function isLoggedOut () {
	return (req, res, next) => {
    // user not logged in? execute function for the route
    if (!req.isAuthenticated()) return next();
    // logged in user? redirect to user's dashboard
    return res.redirect('/dashboard/' + req.user.id);
	};
}


module.exports = router;