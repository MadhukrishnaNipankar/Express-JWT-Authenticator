const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Please enter a valid email address.",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash the password before saving it to the database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  // if the password is modified,then hash the password
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Method to compare the entered password with the hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword,
  actualPassword
) {
  // this will return true if both are the same
  return await bcrypt.compare(candidatePassword, actualPassword);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
