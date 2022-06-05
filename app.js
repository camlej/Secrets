//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const md5 = require('md5');
// const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model ("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()){
    res.render('secrets');
  } else {
    res.redirect('/login');
  };
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {return next(err)}
    res.redirect('/');
  });
});

app.post('/register', (req, res) => {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect('/secrets');
      });
    }
  });

  //
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   let newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });
  //
  //   newUser.save(function(err){
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     };
  //   });
  // });
});

app.post('/login', (req, res) => {
  let user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect('/secrets');
      });
    };
  });

  // let username = req.body.username;
  // let password = req.body.password;
  //
  // User.findOne({email: username}, function(err, foundUser){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         if (result === true) {
  //           res.render("secrets");
  //         }
  //       });
  //     };
  //   };
  // });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
