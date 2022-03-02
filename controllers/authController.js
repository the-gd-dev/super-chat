const { validationResult } = require("express-validator");
const extractErrors = require("../helpers/extractErrors");
const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * showing login form
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @response /auth/login
 */
exports.getLogin = (req, res, next) => {
  res.render("auth/login", { errors: {} });
};

/**
 *  loging in exisiting user resource
 * @param { body : { email, password, keep_me_in } } req
 * @param {*} res
 * @param {*} next
 * @response /
 */
exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.render("auth/login", { errors: extractErrorsArr });
  }
  var email = req.body.email;
  var password = req.body.password;
  var findUser;
  User.findOne({ email: email })
    .then((user) => {
      findUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((result) => {
      if (!result) {
        res.render("auth/login", {
          errors: { email: { message: "User crendetials invalid." } },
        });
      }
      req.session.user = findUser;
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

/**
 * showing registration form
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @response /auth/register
 */
exports.getRegister = (req, res, next) => {
  res.render("auth/register", { errors: {} });
};

/**
 * registering the new user resource
 * @param { body : { name, username, email, password, confirm_password } } req
 * @param {*} res
 * @param {*} next
 * @response /
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
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @response /auth/reset
 */
exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset");
};

/**
 * showing reset password form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.postResetPassword = (req, res, next) => {
  console.log(req.body);
  res.render("auth/reset");
};

/**
 * showing reset password form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
