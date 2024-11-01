// Import necessary modules and packages
const express = require('express') // Importing Express framework
const { verifyToken } = require('../middleware/verifyToken')
const router = express.Router() // Creating a router object to handle routes
const limiter = require('../middleware/rateLimiter') 
const {
  registerUser,
  verifyEmail,
  logIn,
  changePassword,
  forgotPassword,
  resetPassword,
  logOut
} = require('../controller/authController')


// Route for user registration
router.post('/register', limiter, (req, res) => registerUser(req, res))

// Route for email verification
router.post('/verify-email', limiter, (req, res) => verifyEmail(req, res))

// Route for user login
router.post('/login', limiter, (req, res) => logIn(req, res))

// Route for changing password
router.put('/change-password/:userID', verifyToken, (req, res) => changePassword(req, res))

// Route for forgot passwords
router.post('/forgot-password', (req, res) => {
  forgotPassword(req, res)
})

// Route for resetting passwords
router.put('/reset-password/:resetToken', (req, res) => {
  resetPassword(req, res)
})

router.delete('/logout/:userID', (req, res) => {
  logOut( req, res)
})

module.exports = router
