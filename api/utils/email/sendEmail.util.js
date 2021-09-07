// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require("@sendgrid/mail");
/**
 * This functions sends emails to users
 *
 * @param {object} message configuration
 */
const sendMail = (config) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    from: process.env.EMAIL_FROM, // Change to your verified sender
    ...config,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = sendMail;
