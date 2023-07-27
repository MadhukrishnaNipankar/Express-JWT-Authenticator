// Import required modules
const User = require("./Models/authModel");
const {
  register,
  login,
  protect,
  deleteUserAccount,
} = require("./Controllers/authControllers");

// Export the User model and authentication functions
module.exports = {
  User,
  register,
  login,
  protect,
  deleteUserAccount,
};
