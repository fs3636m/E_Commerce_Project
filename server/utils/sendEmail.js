// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    // Create a temporary Ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Test App" <${testAccount.user}>`,
      to,
      subject,
      text,
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
