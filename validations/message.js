const { body } = require("express-validator");
const customMessage = require("../helpers/customMessage");

module.exports = [
  body("message").trim().notEmpty().withMessage(customMessage("message", "required")),
  body("sender_id").trim().notEmpty().withMessage(customMessage("Sender Id", "required")),
  body("user_id").trim().notEmpty().withMessage(customMessage("User Id", "required")),
];
