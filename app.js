var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//=======
//Hard-coded data
//=======
var riders = [
  {
    name: "Alice",
    email: "alice-demo@gmail.com",
    image: "",
    pointBalance: 5000
  },
  {
    name: "Lara",
    email: "Lara-demo@gmail.com",
    image: "",
    pointBalance: 5000
  }
];

var rewards = [
  {
    rewardType: "One-Day Free Metro Ride",
    rewardId: "01",
    rewardImg: "",
    rewardPoints: 100
  },
  {
    rewardType: "One-Day Free Car Parking",
    rewardId: "02",
    rewardImg: "",
    rewardPoints: 200
  },
  {
    rewardType: "One Free Lyft Ride to Metro",
    rewardId: "03",
    rewardImg: "",
    rewardPoints: 300
  },
  {
    rewardType: "One-Week Free Metro Ride",
    rewardId: "04",
    rewardImg: "",
    rewardPoints: 500
  }
]

var rider = riders[0].name;
var balance = riders[0].pointBalance;

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
  //console.log(req.body)
  var points = req.body.rewardPoints
  balance -= points;
  res.render("dashboard", {rider:rider, balance:balance, rewards:rewards});
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
