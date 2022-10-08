const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("./mailSender");
const userToken = require("./userToken");
const addToCurrentDate = require("./addToCurrentDate");
const { baseURL } = require("../config/config");
const ChangePasswordRequest = require("../models/ChangePasswordRequest");

class userPassword {
  constructor(userId, password) {
    this.userId = userId;
    this.password = password;
  }
  /**
   * Get Existing User
   * @returns
   */
  async _getUser() {
    return await User.findById(this.userId);
  }
  /**
   * Get Existing User
   * @returns
   */
  async getUserByEmail() {
    return await User.findOne({ email: this.userId });
  }
  /**
   * hashed new password
   * @returns
   */
  async hashPassword() {
    return await bcrypt.hash(this.password, 12);
  }
  /**
   * Match hashed passwords
   * @returns
   */
  async matchUserPassword() {
    const user = await this._getUser();
    return await bcrypt.compare(this.password, user.password);
  }
  /**
   * Update new user password
   * @returns
   */
  async updateUserPassword() {
    const hashedPass = await this.hashPassword();
    return await User.find(this.userId).update({
      password: hashedPass,
    });
  }
  /**
   * Forgot Password Email
   * @returns
   */
  async sendForgotPasswordEmail() {
    const userData = await this.getUserByEmail();
    const subject = "Password Change Request | Super Chat";
    const resetLink = await this.newPasswordResetLink(userData.id);
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
    return mailInstance.send();
  }
  /**
   * send password reset successfull e-mail
   * @return {mailSender : class}
   */
  async sendPasswordResetEmail() {
    const userData = await this._getUser();
    const subject =  "Password Changed Successfully | Super Chat";
    const mailInstance = new mailSender(
      userData.email,
      subject,
      "password-changed",
      {
        baseURL,
        userName: userData.name,
      }
    );
    return mailInstance.send();
  }
  /**
   * Generate New Password Reset Link
   * @returns {String}
   */
  async newPasswordResetLink(userId) {
    if (userId) {
      const token = new userToken().generateNewToken();
      const expiresIn = addToCurrentDate("hours", 2);
      await ChangePasswordRequest.create({
        userId: userId,
        token,
        expiresIn,
      });
      return baseURL + "/set-password/" + token + "?userId=" + userId;
    }
    return false;
  }
}
module.exports = userPassword;
