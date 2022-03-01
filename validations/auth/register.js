const { body } = require("express-validator");
const customMessage = require("../../helpers/customMessage");
const User = require("../../models/user");

module.exports = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(customMessage("name", "required"))
    .isLength({ min: 4 })
    .withMessage(customMessage("name", "min", "4")),
  body("username")
    .trim()
    .notEmpty()
    .withMessage(customMessage("username", "required"))
    .isLength({ min: 4 })
    .withMessage(customMessage("username", "min", "4"))
    .isAlphanumeric()
    .withMessage(customMessage("username", "typo", "alphanumeric")),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(customMessage("email", "required", ""))
    .isEmail()
    .withMessage("Email address is invalid."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(customMessage("password", "required"))
    .isLength({ min: 6 })
    .withMessage(customMessage("name", "min", "6"))
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
];
