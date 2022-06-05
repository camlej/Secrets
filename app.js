//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// const md5 = require('md5');
// const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model ("User", userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    let newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err){
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      };
    });
  });
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      };
    };
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
