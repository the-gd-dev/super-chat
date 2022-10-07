const { validationResult } = require("express-validator");
const extractErrors = require("../helpers/extractErrors");
const User = require("../models/User");

const bcrypt = require("bcrypt");
const mailSender = require("../helpers/mailSender");
const ejs = require("ejs");
const fs = require("fs");
const { basePath } = require("../paths");
const generateCode = require("../helpers/generateCode");
const { baseURL } = require("../config/config");
const resetLinkGenerator = require("../helpers/resetLinkGenerator");
const ChangePasswordRequest = require("../models/ChangePasswordRequest");
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
      if (user) {
        findUser = user;
        return bcrypt.compare(password, user.password);
      }
      return null;
    })
    .then((result) => {
      if (!result) {
        res.render("auth/login", {
          errors: { email: { message: "User crendetials invalid." } },
        });
      } else {
        req.session.user = findUser;
        req.session.save(() => {
          res.redirect("/");
        });
      }
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
  const verificationCode = generateCode();
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        res.render("auth/register", {
          errors: {
            email: "User already exist to the provided email address.",
          },
        });
      }
      return bcrypt.hash(req.body.password, 12);
    })
    .then((hashedPass) => {
      return User.create({
        verificationCode,
        name: req.body.name,
        display_picture: "https://picsum.photos/200/300",
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
      });
    })
    .then((user) => {
      const subject = "Verify Your Email Address | Super Chat";
      const templateData = {
        userName: user.name,
        userEmail: user.email,
        baseURL: baseURL,
        verificationCode: verificationCode,
      };
      const mailInstance = new mailSender(
        user.email,
        subject,
        "verification-email",
        templateData
      );
      mailInstance.send();
      res.redirect("/verify-me/" + req.body.email);
    })
    .catch((err) => {
      console.log(err);
    });
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
  function returnBackWithMessage(msg) {
    res.render("auth/reset", {
      resetError: true,
      resetErrorMessage: msg,
    });
  }
  if (!userEmail) {
    returnBackWithMessage("Email Address is required.");
  } else {
    let userData = await User.findOne({ email: userEmail });
    if (!userData) {
      returnBackWithMessage("Email Address not found.");
    } else {
      const subject = "Password Change Request | Super Chat";
      const resetLink = await resetLinkGenerator(userData.id);
      const templateData = {
        resetLink,
        userName: userData.name,
      };
      const mailInstance = new mailSender(
        userData.email,
        subject,
        "forgot-password",
        templateData
      );
      mailInstance.send();
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
  const password_token = await ChangePasswordRequest.findOne({ userId, token });
  const currentTime = new Date().getTime();
  var errors = {};
  if (req.query.errors) {
    errors = JSON.parse(req.query.errors);
  } else if (!password_token) {
    errors = { token: { message: "Token or User is invalid." } };
  } else if (currentTime > parseInt(password_token.expiresIn)) {
    errors = { token: { message: "Provided token is expired." } };
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
  const password_token = await ChangePasswordRequest.findOne({ userId, token });
  const currentTime = new Date().getTime();
  if (!password_token) {
    errors = { token: { message: "Token or User is invalid." } };
    res.redirect(
      "/set-password/" +
        token +
        "?userId=" +
        userId +
        "&errors=" +
        JSON.stringify(errors)
    );
  } else if (currentTime > parseInt(password_token.expiresIn)) {
    console.log("time is greateer then the token tme");
    errors = { token: { message: "Provided token is expired." } };
    res.redirect(
      "/set-password/" +
        token +
        "?userId=" +
        userId +
        "&errors=" +
        JSON.stringify(errors)
    );
  } else if (!errors.isEmpty()) {
    let extractErrorsArr = extractErrors(errors.array());
    res.redirect(
      "/set-password/" +
        token +
        "?userId=" +
        userId +
        "&errors=" +
        JSON.stringify(extractErrorsArr)
    );
  } else {
    const userData = await User.findOne({ id: userId });
    const isPasswordMatched = await bcrypt.compare(password, userData.password);
    const isNewPasswordMatched = await bcrypt.compare(newPassword, userData.password);
    if (!isPasswordMatched) {
      res.redirect(
        "/set-password/" +
          token +
          "?userId=" +
          userId +
          "&errors=" +
          JSON.stringify({
            password: { message: "Password not matched.", oldValue: "" },
          })
      );
    } else if(isNewPasswordMatched){
      res.redirect(
        "/set-password/" +
          token +
          "?userId=" +
          userId +
          "&errors=" +
          JSON.stringify({
            new_password: { message: "Choose a different password.", oldValue: "" },
          })
      );
    }else {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.findOne({ id: userId }).update({
        password: hashedPassword,
      });
      await ChangePasswordRequest.find({ userId }).deleteMany();
      const subject = "Password Changed | Super Chat";
      const mailInstance = new mailSender(
        userData.email,
        subject,
        "password-changed",
        {
          baseURL,
          userName: userData.name,
        }
      );
      mailInstance.send();
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
