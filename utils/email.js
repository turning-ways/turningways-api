/* eslint-disable no-console */
const nodemailer = require("nodemailer");

// To use this function, you need to have a ZeptoMail account.
const transport = nodemailer.createTransport({
  host: process.env.ZEPTO_MAIL_HOST,
  port: 465,
  auth: {
    user: process.env.ZEPTO_MAIL_USER,
    pass: process.env.ZEPTO_MAIL_TOKEN,
  },
});

// This function sends an email to the user.
async function sendMail(payload) {
  const mailOptions = {
    from: '"TurningWays" <noreply@turningways.co.in>',
    to: payload.email,
    subject: payload.subject,
    html: payload.html,
  };

  await transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw new Error("Cound not send email");
    }
    console.log("Successfully sent", info.messageId);
  });
}

module.exports = { sendMail };
