const { baseURL } = require("../config/config");
const mailSender = require("./mailSender");

class verificationCode {
  constructor(userName, userEmail) {
    this.userName = userName;
    this.userEmail = userEmail;
    this.verifyCode;
  }
  newVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  sendEmail() {
    const subject = "Verify Your Email Address | Super Chat";
    this.verifyCode = this.newVerificationCode();
    const templateData = {
      userName: this.userName,
      userEmail: this.userEmail,
      baseURL: baseURL,
      verificationCode: this.verifyCode,
    };
    const mailInstance = new mailSender(
      this.userEmail,
      subject,
      "verification-email",
      templateData
    );
    return mailInstance.send();
  }
}
module.exports = verificationCode;
