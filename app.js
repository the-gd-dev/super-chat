const express = require("express");
const path = require("path");
const http = require("http");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const { Server } = require("socket.io");
const MongoDBStore = require("connect-mongodb-session")(session);

//configure env file
const dotenv = require("dotenv");
dotenv.config();

const publicRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// app.use(expressValidator());
//global views variables
app.use((req, res, next) => {
  res.locals = {
    isLoggedIn: !!req.session.user,
    user: req.session.user,
  };
  next();
});
var users = {};
var rooms = {};
//routes & middlewares
app.use(publicRoutes);
app.use(authRoutes);
io.on("connection", (socket) => {
  socket.on("connected", (payload) => {
    // console.log("connected--->socket.io--->", payload);
    users[payload.currentUserId] = socket.id;
    console.log("connected users--->", users);
  });
  socket.on("chat-message", (payload) => {
    // console.log(payload);
    io.to(users[payload.sender]).emit("chat-message", payload);
    io.to(users[payload.reciever]).emit("chat-message", payload);
  });
  socket.on("disconnect", (payload = {}) => {
    // console.log("disconnect--->socket.io--->", payload);
    if (users[payload.userId]) delete users[payload.userId];
  });
});
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => {
    server.listen(process.env.PORT, () => {
      console.log("Listening to http://localhost:" + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to DB.");
  });
