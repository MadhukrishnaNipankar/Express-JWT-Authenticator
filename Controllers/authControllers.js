// Controllers/Auth/authController.js

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../Models/authModel");

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.register = async (req, res, next) => {
  try {
    // extracting data from request object
    const { email, password } = req.body;
    console.log(email, password);
    const newUser = await User.create({
      email,
      password,
    });
    console.log("User registered successfully:", newUser);

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error during user registration:", error.message);
    res.status(500).json({
      error: error.message,
      status: "User registration failed",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check if the email and password exist
    if (!email || !password) {
      res.status(400).json({
        error: "email and password fields are mandatory",
        status: "Login failed",
      });
      return next();
    }

    const user = await User.findOne({ email }).select("+password");

    //if user doesn't exist
    if (!user) {
      res.status(400).json({
        error: "Incorrect email or password",
        status: "Login failed",
      });
      return next();
    }

    // check if candidate password is same as actual password
    const correct = await user.comparePassword(password, user.password);

    if (!correct) {
      res.status(400).json({
        error: "Incorrect email or password",
        status: "Login failed",
      });
      return next();
    }

    // if everything is ok,send token to client
    const token = signToken(user._id);
    res.status(200).json({
      token,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong! Please try again later",
      error: error.message,
      status: "Server Error",
    });
    return next();
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) getting token and checking if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        error: "You are not logged in! Please Login to get access",
        status: "Invalid request",
      });
      return next();
    }
    // 2) validate the token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(401).json({
        error: "The user belonging to the token does no longer exist",
        status: "Invalid request",
      });
    }

    // 3) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      res.status(401).json({
        error: "Invalid Token!",
        status: "Invalid request",
      });
    }

    req.user = { id: decoded.id }; // attaching the user id to the request object

    //  All the above cases have passed!  Therefore it is an authenticated request! Hence calling next()
    next();
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong! Please try again later",
      error: error.message,
      status: "Server Error",
    });
    return next();
  }
};

exports.deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have userId available after authentication
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({
        error: "User not found.",
        status: "Deletion failed",
      });
      return next();
    }

    res.status(200).json({
      status: "success",
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error during deleting user account:", error.message);
    res.status(500).json({
      error: error.message,
      status: "Deletion failed",
    });
  }
};
