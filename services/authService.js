var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var low = require('lowdb');
var path = require('path');

//==============
//lowdb Usage
//==============
const FileSync = require("lowdb/adapters/FileSync");
const adapter1 = new FileSync("data/riderData.json");
const adapter2 = new FileSync("data/rewardData.json");
const riderData = low(adapter1);
const rewardData = low(adapter2);

//================
// auth services
//================
// takes a plain text password and returns a hash
function hashPassword(plaintextPassword) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}

exports.signup = function signup(options, res) {
  // get all values for the username that are in the database
  var usernames = riderData.get('riders').map('username').value();

  // check if username is already taken
  var usernameIsTaken = usernames.includes(options.username);

  // if username is already taken, show error
  if (usernameIsTaken) {
    return res.render(options.signUpTemplate, {errors: ['This username is already taken']});

  // else create user
  } else {
    // save new user to database
    riderData.get('riders')
      .push({
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        username: options.username,
        // creates hash Password
        password: hashPassword(options.password),
        id: options.id,
        pointBalance: 8000,
        image: ""
      })
      .write();
    // then redirect
    //res.redirect(options.signupSuccessRedirectUrl);
  }
  var rider = riderData.get('riders').find({id: options.id}).value();
  console.log(rider);
  //+ "/" + rider.id

  res.redirect(options.signupSuccessRedirectUrl);
};