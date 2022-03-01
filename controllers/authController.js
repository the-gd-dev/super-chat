const { validationResult } = require("express-validator");
const extractErrors = require("../helpers/extractErrors");
const User = require("../models/user");
const bcrypt = require("bcrypt");
/**
 * showing login form
 * @response /auth/login
 */
exports.getLogin = (req, res, next) => {
  res.render("auth/login", { errors: {} });
};

/**
 * loging in exisiting user resource
 * @params email, password, keep_me_in
 * @response /home
 */
exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.render("auth/login", { errors: extractErrorsArr });
  }
  var email = req.body.email;
  var password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      return bcrypt.compare(password, user.password);
    })
    .then((result) => {
      if (!result) {
        res.render("auth/login", {
          errors: { email: { message: "User crendetials invalid." } },
        });
      }
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

/**
 * showing registration form
 * @response /auth/register
 */
exports.getRegister = (req, res, next) => {
  res.render("auth/register", { errors: {} });
};

/**
 * registering the new user resource
 * @params email, password, keep_me_in
 * @response /home
 */
exports.postRegister = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.render("auth/register", { errors: extractErrorsArr });
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        throw new Error("User already exists to provided email address.");
      }
      return bcrypt.hash(req.body.password, 12);
    })
    .then((hashedPass) => {
      return User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
      });
    })
    .then((user) => {
      res.redirect("/login");
    })
    .catch((err) => {});
};

/**
 * showing reset password form
 * @response /auth/reset
 */
exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset");
};

/**
 * sending reset password email
 * @params email
 * @response /
 */
exports.postResetPassword = (req, res, next) => {
  console.log(req.body);
  res.render("auth/reset");
};
