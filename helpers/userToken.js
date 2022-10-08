const ChangePasswordRequest = require("../models/ChangePasswordRequest");
var crypto  = require('crypto');
class userToken {
  constructor(userId, token) {
    this.userId = userId;
    this.token = token;
  }
  /**
   * return single record.
   * @returns { ChangePasswordRequest : class } record.
   */
  async _getPasswordResetRecord() {
    return await ChangePasswordRequest.findOne({
      userId: this.userId,
      token: this.token,
    });
  }
  /**
   * validate token
   * @returns { errors : Object }
   */
  generateNewToken(){
    return crypto.randomBytes(32).toString("hex");
  }
  /**
   * validate token
   * @returns { errors : Object }
   */
  async validateToken() {
    var password_token = await this._getPasswordResetRecord();
    var currentTime = new Date().getTime();
    var errors;
    if (!password_token) {
      errors = { token: { message: "Token or User is invalid." } };
    } else if (currentTime > parseInt(password_token.expiresIn)) {
      errors = { token: { message: "Provided token is expired." } };
    }
    return errors;
  }
  /**
   * After everything delete token
   * @returns 
   */
  async deleteToken() {
    return await ChangePasswordRequest.find({
      userId: this.userId
    }).deleteMany();
  }
}

module.exports = userToken;
