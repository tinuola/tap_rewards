var router = require('express').Router();
var low = require('lowdb');
var path = require('path');
var uuid = require('uuid');

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

//Single user info
//var rider = riders[0].name;
//var balance = riders[0].pointBalance;
// console.log(rider);
// console.log(balance);

//==============
//Routes
//==============

//Landing page
router.get("/", function(req,res){
  res.render("home");
});

//Dashboard
// app.get("/dashboard", function(req, res){
//   res.render("dashboard", {rider:rider, balance:balance, rewards:rewards});
// });

router.get("/dashboard", function(req, res){
  res.render("dashboard", {riders:riders, rewards:rewards});
});

//one rider
router.get("/dashboard/:id", function(req, res){
  var rider = riderData.get('riders').find({id: req.params.id}).value();
  // console.log(req.params.id);
  // console.log(rider);
  res.render("dashboard2", {rider:rider, rewards:rewards});
});


router.post("/dashboard/:id", function(req, res){
  var points = req.body.rewardPoints;
  var rider = riderData.get('riders').find({id: req.params.id}).value();
  var balance = rider.pointBalance;
  balance -= points;
  // console.log(req.body);
  // console.log(points);
  // console.log(rider);
  // console.log(balance);

  riderData.get('riders')
    .find({ name: rider.name })
    .assign({ pointBalance: balance})
    .write();

  res.redirect("/dashboard/" + rider.id);
});




// router.post("/dashboard", function(req, res){
//   var points = req.body.rewardPoints;
//   balance -= points;
  // console.log(req.body);
  // console.log(points);
  // console.log(typeof balance);
  // console.log(rider);
  // console.log(balance);

//   riderData.get('riders')
//     .find({ name: rider })
//     .assign({ pointBalance: balance})
//     .write()
//   res.redirect("/dashboard");
// });

//Login page
router.get("/login", function(req,res){
  res.render("login");
});

module.exports = router;