# express-jwt-authenticator

express-jwt-authenticator is a powerful and secure Node.js authentication package that simplifies the implementation of JSON Web Token (JWT) based authentication in your applications. It provides a robust and flexible solution for user registration, login, and protected route management, ensuring a seamless and secure user experience.

Provides you Methods for _registration_, _login_, _user account deletion_, _password change_, _password verification through email_ and a middleware for protecting other routes named _protect_.

## Installation

To integrate `express-jwt-authenticator` into your Node.js project, install it via npm:

```bash
npm install express-jwt-authenticator
```

## Configuration

Before using `express-jwt-authenticator`, make sure to set up the following environment variables in your project in .env file:

```dotenv
JWT_SECRET=your_jwt_secret                           # Secret key used to sign JWT tokens
JWT_EXPIRES_IN=7d                                    # Expiry time for JWT tokens (e.g., "1d", "2h")
EMAIL_USER=your_email@example.com                    # Email address for sending verification emails
EMAIL_PASS=your_email_password_or_app_password       # Password or app-specific password for the above email
HOST=http://localhost:8000                           # Base URL for your application
EMAIL_VERIFICATION_ROUTE=verify-email               # Route for email verification link
LOGIN_URL=https://www.instagram.com/                #Login page link of your application
CONNECTION_STRING=`your database connection string` #connection url for mongodb
```

## Sample Usage

### 1. Make sure, your express application is running and is successfully connected to the database

### 2. Use the Authentication Methods in Your Express App/Sample Usage

Integrate the provided authentication functions into your Express application by setting up routes as shown below:

```js
const express = require("express");
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
const {
  initiateRegistration,
  completeRegistration,
  login,
  protect,
  deleteUserAccount,
  changePassword,
} = require("express-jwt-authenticator");

// Adding Config File Contents to process
require("dotenv").config({ path: "./config.env" });

const PORT = process.env.PORT || 8000;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

const connectDb = require("./db");

// Load environment variables from .env file
require("dotenv").config();

// Database Connection
connectDb(CONNECTION_STRING);

// Route to initiate user registration
app.post("/initiateRegistration", initiateRegistration);

// Route to complete registration (typically through email verification)
app.get(
  `/${process.env.EMAIL_VERIFICATION_ROUTE}/:token`,
  completeRegistration
);

// Route to login and obtain a JWT token
app.post("/login", login);

// Route to change the user's password (protected)
app.post("/change-password", protect, changePassword);

// Route to delete the authenticated user's account (protected)
app.delete("/delete", protect, deleteUserAccount);

// Example of a protected route that only authenticated users can access
app.get("/myroute", protect, (req, res) => {
  res.send("Protected route, only authenticated users can access this.");
});

app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}`);
});
```

### 3. Connectdb function for database connection

```js
const mongoose = require("mongoose");

const connectDb = (CONNECTION_STRING) => {
  mongoose
    .connect(CONNECTION_STRING)
    .then((conn) => {
      console.log(
        `Database connection successful on link : ${CONNECTION_STRING}`
      );
    })
    .catch((err) => {
      console.log("There was a problem while connecting to the database", err);
    });
};

module.exports = connectDb;
```

## Documentation for Functions

### `initiateRegistration`

- **Description:** Initiates the user registration process by generating a verification email.
- **Method:** `POST`
- **Route:** `/initiateRegistration`
- **Request Body:**
  - `email` (string, required): The email address of the user.
  - `password` (string, required): The password for the user account.
- **Response:**
  - **Success:**
    - `status`: `"success"`
    - `message`: `"Verification email sent successfully. Please check your email."`
  - **Failure:**
    - `status`: `"fail"`
    - `message`: Detailed error message explaining the failure.

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### `completeRegistration`

This route would be hit by the user through the link sent to him on his/her email for verification.

- **Description:** Completes the registration process by verifying the email and creating the user.
- **Method:** `POST`
- **Route:** `/completeRegistration`
- **Request Body:**
  - `token` (string, required): The email verification token sent to the user's email.
- **Response:**
  - **Success:**
    - `status`: `"success"`
    - `message`: `"User account created successfully."`
  - **Failure:**
    - `status`: `"fail"`
    - `message`: `"Invalid or expired verification token."`

### `login`

- **Description:** Logs in a user with their email and password to obtain a JWT token.
- **Method:** `POST`
- **Route:** `/login`
- **Request Body:**
  - `email` (string, required): The email address of the user.
  - `password` (string, required): The password for the user account.
- **Response:**
  - **Success:**
    - `token` (string): JWT token for authenticated access.
    - `status`: `"success"`
  - **Failure:**
    - `status`: `"fail"`
    - `error`: Detailed error message explaining the failure.

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### `changePassword`

- **Description:** Changes the password for the authenticated user.
- **Method:** `POST`
- **Route:** `/changePassword`
- **Request Body:**
  - `oldPassword` (string, required): The current password of the user.
  - `newPassword` (string, required): The new password to be set for the user account.
- **Response:**
  - **Success:**
    - `status`: `"success"`
    - `message`: `"Password updated successfully."`
  - **Failure:**
    - `status`: `"fail"`
    - `message`: Detailed error message explaining the failure.

**Example Request:**

```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

### `deleteUserAccount`

- **Description:** Deletes the account of the authenticated user.
- **Method:** `DELETE`
- **Route:** `/deleteUserAccount`
- **Request Headers:**
  - `Authorization` (string, required): JWT token in the format `"Bearer <token>"` for authentication.
- **Response:**
  - **Success:**
    - `status`: `"success"`
    - `message`: `"User account deleted successfully."`
  - **Failure:**
    - `status`: `"fail"`
    - `message`: Detailed error message explaining the failure.

**Example Request:**

```http
DELETE /deleteUserAccount
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Adding `protect` Middleware

To secure routes that require authentication, use the `protect` middleware before defining your route handlers. This ensures that only authenticated users can access protected routes.

**Example Usage:**

```js
const express = require("express");
const app = express();
const {
  protect,
  login,
  deleteUserAccount,
} = require("express-jwt-authenticator");

// Example: Protecting a route that requires authentication
app.get("/protectedRoute", protect, (req, res) => {
  res.json({ message: "This is a protected route!" });
});

// Example: Using protect with other functions
app.post("/login", login);
app.delete("/deleteUserAccount", protect, deleteUserAccount);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```
