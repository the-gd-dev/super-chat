const { baseURL } = require("../config/config");
const addToCurrentDate = require("./addToCurrentDate");
const generateToken = require("./generateToken");
const ChangePasswordRequest = require("../models/ChangePasswordRequest");
module.exports = async function (userId = "") {
  if (userId) {
    const token = generateToken();
    const expiresIn = addToCurrentDate("hours", 2);
    await ChangePasswordRequest.create({
        userId,
        token,
        expiresIn
    });
    return baseURL + "/set-password/" + token + "?userId=" + userId;
  }
};
