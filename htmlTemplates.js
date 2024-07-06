// htmlTemplates.js
const generateHTML = (title, message, additionalContent = "") => `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        h1 {
          color: #5bc0de;
        }
        p {
          color: #333;
        }
        a {
          color: #337ab7;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        ${additionalContent}
      </div>
    </body>
  </html>
`;

// emailTemplates.js
const generateEmailTemplate = (title, message, linkText, link) => `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
        }
        .container {
          background-color: white;
          padding: 20px;
          margin: 40px auto;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          text-align: center;
        }
        h1 {
          color: #5bc0de;
        }
        p {
          color: #333;
        }
        a {
          display: inline-block;
          padding: 10px 20px;
          background-color: #337ab7;
          color: white!important;
          text-decoration: none;
          border-radius: 4px;
        }
        a:hover {
          background-color: #286090;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${link}">${linkText}</a>
      </div>
    </body>
  </html>
`;

const getInvalidLinkHTML = () =>
  generateHTML(
    "Invalid Link",
    "Unable to verify. Please generate the request again."
  );

const getAccountAlreadyVerifiedHTML = (loginURL) =>
  generateHTML(
    "Account Already Verified",
    `Your email has already been verified. You can log in <a href="${loginURL}">here</a>.`
  );

const getRegistrationCompleteHTML = (loginURL) =>
  generateHTML(
    "Registration Complete",
    `Your email has been verified and your account has been created successfully.`,
    `<p>You can now log in <a href="${loginURL}">here</a>.</p>`
  );

const getLinkExpiredHTML = () =>
  generateHTML(
    "Link Expired",
    "Your verification link has expired. Please generate a new verification request."
  );

const getInvalidTokenHTML = () =>
  generateHTML(
    "Invalid Token",
    "The token provided is invalid. Please generate a new verification request."
  );

const getRegistrationFailedHTML = (error) =>
  generateHTML(
    "Registration Failed",
    "Failed to complete registration. Please try again later.",
    `<p>Error: ${error}</p>`
  );

const getVerificationEmailHTML = (verificationLink) =>
  generateEmailTemplate(
    "Account Verification",
    "Please verify your email by clicking the button below:",
    "Verify Email",
    verificationLink
  );

module.exports = {
  getInvalidLinkHTML,
  getAccountAlreadyVerifiedHTML,
  getRegistrationCompleteHTML,
  getLinkExpiredHTML,
  getInvalidTokenHTML,
  getRegistrationFailedHTML,
  getVerificationEmailHTML,
};
