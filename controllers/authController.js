const { validationResult } = require("express-validator");
const extractErrors = require("../helpers/extractErrors");
const User = require("../models/User");
const userToken = require("../helpers/userToken");
const userPassword = require("../helpers/userPassword");
const userRegisteration = require("../helpers/userRegisteration");
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
exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.render("auth/login", { errors: extractErrorsArr });
  }
  var email = req.body.email;
  var password = req.body.password;
  var findUser = await User.findOne({ email: email });
  var userPasswordInstance = new userPassword(findUser.id, password);
  var result = await userPasswordInstance.matchUserPassword();
  if (!findUser || !result) {
    res.render("auth/login", {
      errors: { email: { message: "User crendetials invalid." } },
    });
  } if (!findUser.isVerfied) {
    res.render("auth/login", {
      errors: { email: { message: "User verfication pending. Kindly check your email." } },
    });
  } else {
    req.session.user = findUser;
    req.session.save(() => {
      res.redirect("/");
    });
  }
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
exports.postRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return res.render("auth/register", { errors: extractErrorsArr });
  }
  const { name, username, email, password } = req.body;
  //User Registeration Process
  const newUser = new userRegisteration(name, email, password, username);
  let isUserExistResult = await newUser.isUserExistsAlready();
  if (isUserExistResult !== false) {
    res.render("auth/register", isUserExistResult);
  }
  var isRegistered = await newUser.register();
  res.redirect("/verify-me/" + req.body.email);
};

/**
 * showing verfiy user form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.getVerifyPage = async (req, res, next) => {
  let verificationCodeErrStatus = req.query.isInvalid === "true";

  if (!req.params.email) {
    res.redirect(200, "/login");
  } else {
    const userFind = await User.findOne({ email: req.params.email });
    if (userFind) {
      if (userFind.isVerfied) {
        res.redirect(200, "/login");
      } else {
        res.render("auth/verify", {
          verificationCodeError: verificationCodeErrStatus,
          verificationErrMsg: verificationCodeErrStatus
            ? "Verification code is invalid."
            : "",
          userEmail: req.params.email,
          code: [],
        });
      }
    } else {
      res.redirect(404, "/404");
    }
  }
};
/**
 * submit verfiy user form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.postVerifyUserData = async (req, res, next) => {
  const code = req.body.code.filter((c) => c !== "");
  const userFind = await User.findOne({ email: req.body.email });
  if (code.length !== 6 || userFind.verificationCode !== code.join("")) {
    res.redirect("/verify-me/" + req.body.email + "?isInvalid=true");
  } else {
    await User.findOne({ email: req.body.email }).updateOne({
      verificationCode: "",
      isVerfied: true,
    });
    return res.redirect("/login");
  }
};

/**
 * showing reset password form
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @response /auth/reset
 */
exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset", {
    resetError: false,
    resetErrorMessage: "",
  });
};
/**
 * submit reset password form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.postResetPassword = async (req, res, next) => {
  const userEmail = req.body.email;
  const userPasswordInstance = new userPassword(userEmail, "");
  function returnBackWithMessage(msg) {
    res.render("auth/reset", {
      resetError: true,
      resetErrorMessage: msg,
    });
  }
  if (!userEmail) {
    returnBackWithMessage("Email Address is required.");
  } else {
    let userData = await userPasswordInstance.getUserByEmail();
    if (!userData) {
      returnBackWithMessage("Email Address not found.");
    } else {
      await userPasswordInstance.sendForgotPasswordEmail();
      return res.redirect("/login");
    }
  }
};

/**
 * showing reset password form
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @response /auth/reset
 */
exports.getSetPassword = async (req, res, next) => {
  const token = req.params.token;
  const userId = req.query.userId;
  const userTokenInstance = new userToken(userId, token);
  var errors = await userTokenInstance.validateToken();
  if (req.query.errors) {
    errors = JSON.parse(req.query.errors);
  }
  res.render("auth/set-password", { token, userId, errors });
};
/**
 * submit reset password form
 * @param {body { email }} req
 * @param {*} res
 * @param {*} next
 * @response /auth/new-password
 */
exports.postSetPassword = async (req, res, next) => {
  var errors = validationResult(req);
  const token = req.body._token;
  const userId = req.body.userId;
  const password = req.body.password;
  const newPassword = req.body.new_password;
  const userTokenInstance = new userToken(userId, token);
  const userOldPasswordInstance = new userPassword(userId, password);
  const userNewPasswordInstance = new userPassword(userId, newPassword);
  var token_errors = await userTokenInstance.validateToken();
  function sendBackToSetPasswordPage(errors) {
    return res.redirect(
      "/set-password/" +
        token +
        "?userId=" +
        userId +
        "&errors=" +
        JSON.stringify(errors)
    );
  }
  if (token_errors) {
    return sendBackToSetPasswordPage(token_errors);
  } else if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    return sendBackToSetPasswordPage(extractErrorsArr);
  } else {
    if (!(await userOldPasswordInstance.matchUserPassword())) {
      const oldPassErrors = {
        password: { message: "Password not matched.", oldValue: "" },
      };
      return sendBackToSetPasswordPage(oldPassErrors);
    } else if (await userNewPasswordInstance.matchUserPassword()) {
      const newPassErrors = {
        new_password: { message: "Choose a different password.", oldValue: "" },
      };
      return sendBackToSetPasswordPage(newPassErrors);
    } else {
      await userNewPasswordInstance.updateUserPassword();
      await userTokenInstance.deleteToken();
      await userNewPasswordInstance.sendPasswordResetEmail();
      return res.redirect("/login");
    }
  }
};

/**
 * logout the user
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
