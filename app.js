var express = require("express");
var bodyParser = require("body-parser");
var low = require("lowdb");
var path = require("path");
var uuid = require("uuid");
var app = express();

//=======
//express Usage
//=======
app.set("view engine", "ejs");
app.use(express.static("public"));

//=======
//bodyParser Usage
//=======
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//=======
//lowdb Usage
//=======
//create data json files
const FileSync = require("lowdb/adapters/FileSync");
const adapter1 = new FileSync("data/riderData.json");
const adapter2 = new FileSync("data/rewardData.json");
const riderData = low(adapter1);
const rewardData = low(adapter2);

//=======
//Data schema
//=======
// Set defaults
riderData.defaults({ riders: []})
  .write()

// rewardData.defaults({ rewards: []})
//   .write()

// Add a rider
// riderData.get("riders")
//   .push({
//     name: "Alice",
//     email: "alice-demo@gmail.com",
//     id: uuid(),
//     pointBalance: 5000,
//     image: ""
//   })
//   .write()

//Add a rider
// riderData.get("riders")
//   .push({
//     name: "Lara",
//     email: "Lara-demo@gmail.com",
//     id: uuid(),
//     pointBalance: 8000,
//     image: ""
//   })
//   .write()


//=======
//[Temp] Database data
//=======
//Get all info from rider and reward dbs
var riders = riderData.get("riders").value();
var rewards = rewardData.get("rewards").value();

//Single user info
var rider = riders[0].name;
var balance = riders[0].pointBalance;
// console.log(rider);
// console.log(balance);


//=======
//Routes
//=======

//Landing page
app.get("/", function(req,res){
  res.render("home");
});

//Dashboard
app.get("/dashboard", function(req, res){
  res.render("dashboard", {rider:rider, balance:balance, rewards:rewards});
});

app.post("/dashboard", function(req, res){
  var points = req.body.rewardPoints;
  balance -= points;
  //console.log(req.body)
  //console.log(points);
  //console.log(typeof balance);
  //console.log(rider);
  //console.log(balance);

  riderData.get('riders')
    .find({ name: rider })
    .assign({ pointBalance: balance})
    .write()

  res.redirect("/dashboard");
});

//Login page
app.get("/login", function(req,res){
  res.render("login");
});


//=======
// Server
//=======
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Tap Rewards server is running...");
});
