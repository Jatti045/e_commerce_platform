const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL,
    to: email,
    subject: subject,
    text: message,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (error) {
    console.error("Email sending failed: ", error);
    throw new Error(
      `Failed to send email to ${email}. Please check the email address, ensure your email service is configured correctly, and verify that your Gmail credentials are valid.`
    );
  }
};

module.exports = sendEmail;
