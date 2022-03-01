const { body } = require("express-validator");
const customMessage = require("../../helpers/customMessage");
const User = require("../../models/user");

module.exports = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(customMessage("email", "required", ""))
    .isEmail()
    .withMessage("Email address is invalid."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(customMessage("password", "required")),
];
