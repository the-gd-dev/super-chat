const nodemailer = require("nodemailer");
const { basePath } = require("../paths");
const ejs = require("ejs");

class mailSender {
  constructor(to, subject, templateFileName, templateData) {
    this.to = to;
    this.subject = subject;
    this.templateFileName = templateFileName;
    this.templateData = templateData;
  }
  _createTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  async generateHTML() {
    return await ejs.renderFile(
      basePath + "/views/emails/" + this.templateFileName + ".ejs",
      this.templateData
    );
  }
  async send() {
    const htmlString = await this.generateHTML();
    const transporter = this._createTransport();
    transporter.sendMail({
      from: "Super Chat App <superchat-support@superchat.io>",
      to: this.to,
      subject: this.subject,
      text: this.text || "",
      html: htmlString,
    });
  }
}
module.exports  = mailSender;
