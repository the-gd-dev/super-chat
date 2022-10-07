const { body } = require("express-validator");
const customMessage = require("../../helpers/customMessage");

module.exports = [
  body("_token")
    .trim()
    .notEmpty()
    .withMessage(customMessage("token", "required")),
  body("userId")
    .trim()
    .notEmpty()
    .withMessage(customMessage("userId", "required")),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(customMessage("Password", "required"))
    .isLength({ min: 6 })
    .withMessage(customMessage("Password", "min", "6")),
  body("new_password")
    .trim()
    .notEmpty()
    .withMessage(customMessage("New Password", "required"))
    .isLength({ min: 6 })
    .withMessage(customMessage("New Password", "min", "6"))
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
];
