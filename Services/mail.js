const nodemailer = require("nodemailer");

const sendEmail = async (from, to, subject, text, user, pass, html) => {
  // Validate required parameters
  if (!from || !to || !subject || !text || !user || !pass) {
    throw new Error(
      "Missing required parameters. Please provide from, to, subject, text, user, and app password."
    );
  }

  try {
    // Create Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Email message options
    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: text, // Plain text content
    };

    // Conditionally add html content if provided
    if (html) {
      mailOptions.html = html; // HTML content
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
