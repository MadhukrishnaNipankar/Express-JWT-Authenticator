const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../Models/authModel");
const sendEmail = require("../Services/mail");
const {
  getInvalidLinkHTML,
  getAccountAlreadyVerifiedHTML,
  getRegistrationCompleteHTML,
  getLinkExpiredHTML,
  getInvalidTokenHTML,
  getRegistrationFailedHTML,
  getVerificationEmailHTML,
} = require("../htmlTemplates");

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

const generateEmailVerificationToken = (email, password) => {
  return jwt.sign({ email, password }, process.env.JWT_SECRET, {
    expiresIn: "3m",
  });
};

exports.initiateRegistration = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "both email and password are required.",
        data: null,
      });
    }

    // if account already registered, return with appropriate message
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Account already registered.",
        data: null,
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email address.",
        data: null,
      });
    }

    // Generate token based on email and plaintext password
    const token = generateEmailVerificationToken(email, password);

    // Construct verification link using configured route
    const verificationLink = `${process.env.HOST}/${process.env.EMAIL_VERIFICATION_ROUTE}/${token}`;

    const from = process.env.EMAIL_USER;
    const to = email;
    const subject = "Account Verification";
    const text = `Verify Email`;
    const html = getVerificationEmailHTML(verificationLink);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Call the sendEmail function
    await sendEmail(from, to, subject, text, user, pass, html);

    // Send success response
    res.status(200).json({
      status: "success",
      message: "Verification email sent successfully. Please check your email.",
      data: null,
    });
  } catch (error) {
    console.error("Error initiating registration:", error.message);
    res.status(500).json({
      status: "fail",
      message: "Failed to initiate registration. Please try again later.",
      error: error.message,
      data: null,
    });
  }
};

exports.completeRegistration = async (req, res, next) => {
  try {
    const token = req.params.token;

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.email || !decoded.password) {
      return res.status(400).send(getInvalidLinkHTML());
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res
        .status(400)
        .send(getAccountAlreadyVerifiedHTML(process.env.LOGIN_URL));
    }

    // Create user in the database
    const newUser = await User.create({
      email: decoded.email,
      password: decoded.password, // Ensure this is already hashed before storing
    });

    console.log("User registered successfully:", newUser);

    return res
      .status(201)
      .send(getRegistrationCompleteHTML(process.env.LOGIN_URL));
  } catch (error) {
    console.error("Error completing registration:", error.message);
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.message);
      return res.status(400).send(getLinkExpiredHTML());
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token:", error.message);
      return res.status(400).send(getInvalidTokenHTML());
    } else {
      console.error("Error completing registration:", error.message);
      return res.status(500).send(getRegistrationFailedHTML(error.message));
    }
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

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log(userId);

    // Check if both oldPassword and newPassword are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Both oldPassword and newPassword are required.",
        data: null,
      });
    }

    // Find the user by userId
    const user = await User.findById(userId).select("+password");
    console.log(user);
    // If user not found
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        data: null,
      });
    }

    // Check if the old password matches the current password
    const isMatch = await user.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect old password.",
        data: null,
      });
    }

    // Update user's password
    user.password = newPassword;
    await user.save();

    // Optional: Revoke existing tokens if required
    // Example: User logged out everywhere after changing password

    // Respond with success message
    res.status(200).json({
      status: "success",
      message: "Password updated successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({
      status: "fail",
      message: "Failed to change password. Please try again later.",
      error: error.message,
      data: null,
    });
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
      status: "fail",
      error: "Something went wrong! Please try again later",
      error: error.message,
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
