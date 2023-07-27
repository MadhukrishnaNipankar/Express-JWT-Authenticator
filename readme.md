# express-jwt-authenticator

**express-jwt-authenticator** is a powerful and secure Node.js authentication package that simplifies the implementation of JSON Web Token (JWT) based authentication in your applications. It provides a robust and flexible solution for user registration, login, and protected route management, ensuring a seamless and secure user experience.

Provides you Methods for _register_,_login_ _deleteUserAccount_ and a middleware for protecting other routes named _protect_.

## Installation

To use this package in your Node.js project, you can install it via npm.

```bash
npm i express-jwt-authenticator
```

## Functions Provided

### Register a New User

- **Function name:** `register`
- **Method required:** `POST`
- **Description:** Register a new user with an email and password.
- **Request Body:**
  - `email` (required): The email address of the user to register.
  - `password` (required): The password for the user account.

### Login

- **Function name:** `login`
- **Method required:** `POST`
- **Description:** Login with an email and password to get a JWT token.
- **Request Body:**
  - `email` (required): The email address of the user.
  - `password` (required): The password for the user account.

### Protected Route

You can use this as a middleware to protect all your routes. Call this just before your custom functions, and it will take care of your stateless authentication

- **Function name:** `protected`
- **Description:** A protected middleware function that requires a valid JWT token for access.
- **Request Headers:**
  - `Authorization`: The JWT token should be included in the `Authorization` header in the format `Bearer <token>`.

### Delete User Account

- **Function name:** `delete`
- **Method required:** `DELETE`
- **Description:** Delete the authenticated user's account.
- **Request Headers:**
  - `Authorization`: The JWT token should be included in the `Authorization` header in the format `Bearer <token>`.

## Usage

To get started with jwt-auth, follow the steps below:

1. Install the package as shown in the **Installation** section.

2. Import the required modules and functions in your project:

```js
const {
  User,
  register,
  login,
  protect,
  deleteUserAccount,
} = require("jwt-auth");
```

3. Connect to your MongoDB database using mongoose and specify the CONNECTION_STRING environment variable.

```js
const mongoose = require("mongoose");
const CONNECTION_STRING = process.env.CONNECTION_STRING;

mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
```

4. Define your Express app and middleware, and set up the required environment variables:

```js
const express = require("express");
const app = express();
require("dotenv").config({ path: "./config.env" });
```

5.  Implement the authentication routes in your Express app:

```js
app.post("/register", register);
app.post("/login", login);
app.get("/myroute", protected, () => {
  "Protected route, only authenticated users can access!";
});
app.delete("/delete", protect, deleteUserAccount);
```

6.  Start your server:

```js
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Required Environment Variables

This package requires the following environment variables to be set in your project:

- **JWT_SECRET**: A secret key used to sign the JWT tokens for secure authentication.
- **JWT_EXPIRES_IN**: The expiration time for the JWT tokens in the format "1d", "2h", etc.
- **CONNECTION_STRING**: The MongoDB connection string for connecting to your database.
  Please make sure to set these variables in your project's environment or in a configuration file like **config.env**
