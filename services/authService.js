/*jshint esversion: 6 */

var bcrypt = require('bcryptjs');
var low = require('lowdb');
var path = require('path');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

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
  let salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}

// compare if plain text password matches hass password
function comparePassword(plaintextPassword, hashPassword){
  return bcrypt.compareSync(plaintextPassword, hashPassword);
}

exports.signup = function signup(options, res) {
  // get all values for the username that are in the database
  let usernames = riderData.get('riders').map('username').value();

  // check if username is already taken
  let usernameIsTaken = usernames.includes(options.username);

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
        password: hashPassword(options.password),
        id: options.id,
        pointBalance: 8000,
        image: ""
      })
      .write();
    // then redirect
    res.redirect(options.signupSuccessRedirectUrl+ "/" + options.id);
  }

};

// configure passport
exports.configurePassport = function(passport) {
  // Passport serializes and deserializes user instances to and from the session

  // only the user ID is serialized and added to the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // for every request, the id is used to find the user, 
  // which will be restored to req.user
  passport.deserializeUser(function(id, done) {
    // find user in database
    let user = riderData.get('riders').find({id: id}).value();
    if(!user) {
      done({ message: 'Invalid credentials.' }, null);
    } else {
      // the object is what will be available for 'req.user'
      done(null, {id: user.id, username: user.username});
    }
  });

  // configures how to autheticate a user when they log in

  // LocalStrategy uses username / password in the database for authentication
  passport.use(new LocalStrategy(
    function(username, password, done) {
      // look for user in database
      let user = riderData.get('riders').find({ username: username }).value();

      // if user not found, return error
      if(!user) {
        return done(null, false, { message: 'Invalid username & password.' });
      }

      // check if password matches
      let passwordsMatch = comparePassword(password, user.password);
      // if passowrd don't match, return error
      if(!passwordsMatch) {
        return done(null, false, { message: 'Invalid username & password.' });
      }

      //else, if username and password match, return the user
      return done(null, user);
    }
  ));
};