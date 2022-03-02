const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
//configure env file
const dotenv = require("dotenv");
dotenv.config();

const publicRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");

const app = express();

// Session Configuration
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

app.use(
  session({
    secret: "12@#$@546",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//setting templating engine
app.set("view engine", "ejs");
app.set("views", "views");

//body parser && static paths
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// app.use(expressValidator());
//global views variables
app.use((req, res, next) => {
  res.locals = {
    isLoggedIn: !!req.session.user,
    user : req.session.user
  };
  next();
});
//routes & middlewares
app.use(publicRoutes);
app.use(authRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => {
    app.listen(process.env.PORT);
    console.log("Listening to http://localhost:" + process.env.PORT);
  })
  .catch((err) => {
    console.log("Error while connecting to DB.");
  });
