// // config/mailer.js
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,       // ahana.library@ahanait.com
//     pass: process.env.GMAIL_APP_PASS,   // Gmail App Password (not your login password)
//   },
// });

// module.exports = transporter;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // host: "email-smtp.us-east-1.amazonaws.com", // ← default SES SMTP host
  host: "email-smtp.ap-south-1.amazonaws.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,  // AKIATTVPTUQS54UEHUUT
    pass: process.env.SMTP_PASS,  // BGxFTW8W+Bq+5q...
  },
});

module.exports = transporter;