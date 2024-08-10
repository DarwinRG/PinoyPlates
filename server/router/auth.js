// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const {
  registerUser,
  verifyEmail,
  logIn
} = require('../controller/authController')


// Route for user registration
router.post('/register', (req, res) => registerUser(req, res))

// Route for email verification
router.post('/verify-email', (req, res) => verifyEmail(req, res))

// Route for user login
router.post('/login', (req, res) => logIn(req, res))

module.exports = router
