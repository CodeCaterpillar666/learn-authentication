const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs/dist/bcrypt");
const Schema = mongoose.Schema;

// MongoDB url
// mongodb+srv://dbUser:<password>@authentication.x6vwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const mongoDb = "mongodb+srv://dbUser:dbUserPassword@authentication.x6vwd.mongodb.net/Authentication?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
    //   if (user.password !== password) {
    //     return done(null, false, { message: "Incorrect password" });
    //   }
    //   return done(null, user);
    bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// index controller
app.get("/", (req, res) => {
    res.render("index", { user: req.user });
});

app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );

// sign-up controller
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

/* Three valid sign-up post method to
   1.create a new user and then
   2.store its information(username and password) into mongodb
   The three methods difference:
   1.one without bcrypt, which means we save whatever entered and posted into mongodb as it is
   2.one with async bcrypt.hash
   3.one with sync bcrypt.hash
*/

// // Valid post method without bcrypt
// app.post("/sign-up", (req, res, next) => {
//     const user = new User({
//       username: req.body.username,
//       password: req.body.password
//     }).save(err => {
//       if (err) { 
//         return next(err);
//       }
//       res.redirect("/");
//     });
//   });

// // Valid post method with bcrypt async hash function
// app.post("/sign-up", (req, res, next) => {
//     // https://openbase.com/js/bcryptjs/documentation#usage---async
//     bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
//         if (err) {
//             console.log(err);
//         } else {
//             const user = new User({
//                 username: req.body.username,
//                 password: hashedPassword,
//             }).save(err => {
//                 if (err) { 
//                     return next(err);
//                 }
//                 res.redirect("/");
//             });
//         }
//     });
// });

// // Valid post method with bcrypt sync hash function
// app.post("/sign-up", (req, res, next) => {
//     // https://openbase.com/js/bcryptjs/documentation#usage---sync
//     const hashedPassword = bcrypt.hashSync(req.body.password, 10);
//     const user = new User({
//         username: req.body.username,
//         password: hashedPassword,
//     }).save(err => {
//         if (err) { 
//             return next(err);
//         }
//         res.redirect("/");
//     });
// });

// log-out controller/router
app.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));