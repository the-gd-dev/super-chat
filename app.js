const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

//configure env file
const dotenv = require("dotenv");
dotenv.config();

const publicRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");

const app = express();

//setting templating engine
app.set("view engine", "ejs");
app.set("views", "views");

//body parser && static paths
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// app.use(expressValidator());

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
