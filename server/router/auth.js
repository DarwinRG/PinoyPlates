// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const User = require('../models/user') // Importing the User model
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const nodemailer = require('nodemailer') // Importing nodemailer for sending emails
const crypto = require('crypto') // Importing crypto for generating random codes
const dotenv = require('dotenv')
dotenv.config()

// Function to hash the password
const hashPassword = async (password) => {
  try {
    // Hash the password with bcrypt
    return await bcrypt.hash(password, 10)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    console.error('Error hashing password:', error.message)
    throw new Error('Failed to hash password.')
  }
}

// Function to validate email
const validateEmail = (email) => {
  const emailRegex = /^[\w.-]+@gmail\.com$/
  if (!emailRegex.test(email)) {
    return { isValid: false, errorMessage: 'Invalid email format. Please use your valid gmail account' }
  }
  return { isValid: true }
}

// Function to validate password format
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return { isValid: false, errorMessage: 'Password should have capital letters, numbers, and symbols' };
  }
  return { isValid: true }
}

// Sends a verification email with a verification code.
const sendVerificationEmail = async (email, verificationCode) => {
  try {
     // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      },
    })

    // Configure email options
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    }

    // Send the email
    await transporter.sendMail(mailOptions)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    console.error('Error sending verification email:', error.message)
    throw new Error('Failed to send verification email.')
  }
}

// Generates a random verification code.
const generateVerificationCode = () => {
  // Generate random bytes and convert them to hexadecimal string
  return crypto.randomBytes(3).toString('hex')
}


// Route for user registration
router.post('/register', async (req, res) => {
  const { username, email, password, passwordConfirmation } = req.body
  try {
    console.log(req.body)

    // Check if all required fields are filled
    if (!username || !email || !password || !passwordConfirmation) {
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Validate username length
    if (username.length < 5 || username.length > 12) {
      return res.status(400).json({ error: 'Username should be longer than 5 characters and maximum of 12 characters' })
    }

    // Check if the username is already taken
    const existingUserName = await User.findOne({ username })
    if (existingUserName) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    const validatedEmail = validateEmail(email)
    if (!validatedEmail.isValid) {
      return res.status(400).json({ error: 'Please input a valid gmail' })
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' })
    }

    // Validate password length
    if (password.length <= 6 || password.length >= 16) {
      return res.status(400).json({ error: 'Passwords should be longer than 6 characters and maximum of 16 characters' })
    }

    // Validate if passwords match
    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Passwords should match' })
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      joinedDate: new Date()
    })

    // Save the new user to the database
    await newUser.save()

    // Send verification email
    await sendVerificationEmail(email, verificationCode)

    // Respond with success message
    res.status(201).json({ msg: 'Verification code sent. Please check your email' })

  } catch (err) {
    console.error('Error registering user:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/verify-email', async(req, res) => {
  const { email, verificationCode } = req.body
  try {
    // Validate request body
    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Find user by email
    const user = await User.findOne({ email: email })

    // 
    if (!user) {
      return res.status(400).json({ error: 'User is not found' })
    }

    // If verification code is incorrect
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    // Update user's verification status
    user.verified = true
    user.verificationCode = null
    await user.save()

    // Respond with success message
    res.status(200).json({ msg: 'Email verified successfully. User registered.' })
  } catch (err) {
    console.log((`Error verifying email: ${err.message}`))
    res.status(500).json({ error : 'Error verifying email. Please try again later.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    console.log(req.body)
    // Check if all required fields are filled
    if (!email || !password) {
      return res.status(400).json({ error: 'Please fill in the required fields' })
    }
     
    // Validate email
    const validatedEmail = validateEmail(email)
    if (!validatedEmail.isValid) {
      return res.status(400).json({ error: 'Please input a valid gmail' })
    }

    // Find user based of the input email
    const user = await User.findOne({ email: email})

    // Validate if user exists
    if (!user) {
      return res.status(404).json({ error: 'User is not found' })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
       return res.status(400).json({ error: 'Incorrect password. Please try again.'})
     }

     // If user's email is not verified
    if(user.verificationCode !== null) {
      return res.status(400).json({ error: 'Please verify your email first'})
    }

     res.status(200).json({
      username: user.username,
      msg: 'User logged in successfully',
      userId: user._id,
      userRole: user.role,
    })
  } catch (err) {
    console.error('Error logging in user:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
