// Import required modules
const User = require("./Models/authModel");
const {
  initiateRegistration,
  completeRegistration,
  login,
  changePassword,
  protect,
  deleteUserAccount,
} = require("./Controllers/authControllers");

const sendMail = require("./Services/mail");

// Export the User model and authentication functions
module.exports = {
  User,
  initiateRegistration,
  completeRegistration,
  login,
  changePassword,
  protect,
  deleteUserAccount,
  sendMail,
};
