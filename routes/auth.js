const express = require("express");
const router = express.Router();

const {
  getLogin,
  getRegister,
  postRegister,
  postLogin,
  getResetPassword,
  postResetPassword,
} = require("../controllers/authController");

//validations
const registerationRules = require("../validations/auth/register");
const loginRules = require("../validations/auth/login");
//validations

//login
router.get("/login", getLogin);
router.post("/login", loginRules, postLogin);
//register
router.get("/register", getRegister);
router.post("/register", registerationRules, postRegister);
//reset
router.get("/reset", getResetPassword);
router.post("/reset", postResetPassword);
//set password
// router.get("/set-password/:token", getResetPassword);
// router.post("/set-password", postResetPassword);

module.exports = router;
