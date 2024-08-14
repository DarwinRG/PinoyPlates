// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const {
  registerUser,
  verifyEmail,
  logIn,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controller/authController')


// Route for user registration
router.post('/register', (req, res) => registerUser(req, res))

// Route for email verification
router.post('/verify-email', (req, res) => verifyEmail(req, res))

// Route for user login
router.post('/login', (req, res) => logIn(req, res))

// Route for changing password
router.put('/change-password/:userID', (req, res) => changePassword(req, res))

// Route for forgot passwords
router.post('/forgot-password', (req, res) => {
  forgotPassword(req, res)
})

// Route for resetting passwords
router.put('/reset-password/:resetToken', (req, res) => {
  resetPassword(req, res)
})

module.exports = router
