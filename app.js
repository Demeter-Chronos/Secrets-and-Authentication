require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require("bcrypt");
// const saltRounds = 12;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(session({
    secret: 'Node is forcing me to sha put a secret ugh...',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });\

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


app.post("/register", (req, res) => {

    User.register({ username: req.body.username, }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            });
        }
    });


    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });

    //     newUser.save((err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }
    //     });
    // });
});

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        passwor: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            });
        }
    });

    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({
    //         email: username,
    //     },
    //     (err, foundUser) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             if (foundUser) {
    //                 bcrypt.compare(password, foundUser.password, function(err, result) {
    //                     if (result === true) {
    //                         res.render('secrets');
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // );
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000...");
});