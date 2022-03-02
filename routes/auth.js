const express = require("express");
const router = express.Router();

const {
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  getResetPassword,
  postResetPassword,
  postLogout
} = require("../controllers/authController");

//validations
const registerationRules = require("../validations/auth/register");
const loginRules = require("../validations/auth/login");
const guestMiddleware = require("../middlewares/guestMiddleware");
//validations

//login
router.get("/login", guestMiddleware, getLogin);
router.post("/login", loginRules, postLogin);
//logout
router.post("/logout", postLogout);

//register
router.get("/register", guestMiddleware, getRegister);
router.post("/register", registerationRules, postRegister);
//reset
router.get("/reset", guestMiddleware, getResetPassword);
router.post("/reset", postResetPassword);
//set password
// router.get("/set-password/:token", getResetPassword);
// router.post("/set-password", postResetPassword);

module.exports = router;
