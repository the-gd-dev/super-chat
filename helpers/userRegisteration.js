const User = require("../models/User");
const userPassword = require("./userPassword");
const verificationCode = require("./verificationCode");

class userRegisteration {
  constructor(name, email, password, username, display_picture) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.username = username;
    this.display_picture = display_picture || "https://picsum.photos/200/300";
  }
  /**
   * Find user by email
   * @return {User : model}
   */
  async findUserByEmail() {
    await User.findOne({ email: this.email });
  }
  /**
   * Check User Already Exists
   * @return {User : model}
   */
  async isUserExistsAlready() {
    let user = await this.findUserByEmail();
    if (user) {
      return {
        errors: {
          email: {
            message: "User already exist to the provided email address.",
            oldValue: this.email,
          },
        },
      };
    }
    return false;
  }
  /**
   * register user
   * @returns 
   */
  async register() {
    const userPasswordInstance = new userPassword("", this.password);
    const hashedPass = await userPasswordInstance.hashPassword();
    const verification = new verificationCode(this.name, this.email);
    verification.sendEmail();
    const user = await User.create({
      verificationCode: verification.verifyCode,
      name: this.name,
      display_picture: this.display_picture,
      username: this.username,
      email: this.email,
      password: hashedPass,
    });
    return {
      msg: "New User Registered.",
    };
  }
}
module.exports = userRegisteration;
