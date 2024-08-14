const User = require('../models/user') // Importing the User model
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const nodemailer = require('nodemailer') // Importing nodemailer for sending emails
const crypto = require('crypto') // Importing crypto for generating random codes
const dotenv = require('dotenv').config()
const logger = require('../logger/logger')
const { generateTokens } = require('../middleware/verifyToken')
const { generateResetToken, sendResetPasswordEmail } = require('../utils/passwordReset')

// Function to hash the password
const hashPassword = async (password) => {
  try {
    // Hash the password with bcrypt
    return await bcrypt.hash(password, 10)
  } catch (error) {
    // Handle errors and throw an error for the caller to handle
    logger.error('Error hashing password:', error)
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
    logger.error('Error sending verification email:', error.message)
    throw new Error('Failed to send verification email.')
  }
}

// Generates a random verification code.
const generateVerificationCode = () => {
  // Generate random bytes and convert them to hexadecimal string
  return crypto.randomBytes(3).toString('hex')
}

const registerUser = async (req, res) => {
  const { username, email, password, passwordConfirmation } = req.body
  try {
    // Log the registration attempt
    logger.info('Registration attempt received', { username, email })

    // Check if all required fields are filled
    if (!username || !email || !password || !passwordConfirmation) {
      logger.warn('Registration failed: Missing fields', { username, email })
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Validate username length
    if (username.length < 5 || username.length > 12) {
      logger.warn('Registration failed: Invalid username length', { username })
      return res.status(400).json({ error: 'Username should be longer than 5 characters and maximum of 12 characters' })
    }

    // Check if the username is already taken
    const existingUserName = await User.findOne({ username })
    if (existingUserName) {
      logger.warn('Registration failed: Username already taken', { username })
      return res.status(400).json({ error: 'Username already taken' })
    }

    const validatedEmail = validateEmail(email)
    if (!validatedEmail.isValid) {
      logger.warn('Registration failed: Invalid email format', { email })
      return res.status(400).json({ error: 'Please input a valid email' })
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      logger.warn('Registration failed: Email already registered', { email })
      return res.status(400).json({ error: 'Email is already registered' })
    }

    // Validate password length
    if (password.length <= 6 || password.length >= 16) {
      logger.warn('Registration failed: Invalid password length', { username })
      return res.status(400).json({ error: 'Passwords should be longer than 6 characters and maximum of 16 characters' })
    }

    // Validate if passwords match
    if (password !== passwordConfirmation) {
      logger.warn('Registration failed: Passwords do not match', { username })
      return res.status(400).json({ error: 'Passwords should match' })
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)
    logger.info('Password hashed successfully', { username })

    // Generate verification code
    const verificationCode = generateVerificationCode()
    logger.info('Verification code generated', { username, verificationCode })

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
    logger.info('New user saved to the database', { username, email })

    // Send verification email
    await sendVerificationEmail(email, verificationCode)
    logger.info('Verification email sent to', { email })

    // Respond with success message
    res.status(201).json({ msg: 'Verification code sent. Please check your email' })

  } catch (err) {
    logger.error('Error registering user:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const verifyEmail =  async (req, res) => {
  const { email, verificationCode } = req.body
  try {
    // Log the incoming verification attempt
    logger.info('Email verification attempt received', { email })

    // Validate request body
    if (!email || !verificationCode) {
      logger.warn('Verification failed: Missing fields', { email, verificationCode })
      return res.status(400).json({ error: 'Please fill in all the required fields' })
    }

    // Find user by email
    const user = await User.findOne({ email: email })
    if (!user) {
      logger.warn('Verification failed: User not found', { email })
      return res.status(400).json({ error: 'User is not found' })
    }

    // If verification code is incorrect
    if (user.verificationCode !== verificationCode) {
      logger.warn('Verification failed: Incorrect verification code', { email })
      return res.status(400).json({ error: 'Incorrect verification code' })
    }

    // Update user's verification status
    user.verified = true
    user.verificationCode = null
    await user.save()
    logger.info('User verified and updated successfully', { email })

    // Respond with success message
    res.status(200).json({ msg: 'Email verified successfully. User registered.' })

  } catch (err) {
    logger.error('Error verifying email:', err)
    res.status(500).json({ error: 'Error verifying email. Please try again later.' })
  }
}

const logIn  = async (req, res) => {
  const { email, password } = req.body
  try {
    logger.info('User login attempt received', { email })

    // Check if all required fields are filled
    if (!email || !password) {
      logger.warn('Login failed: Missing fields', { email })
      return res.status(400).json({ error: 'Please fill in the required fields' })
    }
     
    // Validate email
    const validatedEmail = validateEmail(email)
    if (!validatedEmail.isValid) {
      logger.warn('Login failed: Invalid email format', { email })
      return res.status(400).json({ error: 'Please input a valid email' })
    }

    // Find user based on the input email
    const user = await User.findOne({ email: email })
    if (!user) {
      logger.warn('Login failed: User not found', { email })
      return res.status(404).json({ error: 'User is not found' })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      logger.warn('Login failed: Incorrect password', { email })
      return res.status(400).json({ error: 'Incorrect password. Please try again.' })
    }

    // Check if user's email is verified
    if (user.verificationCode !== null) {
      logger.warn('Login failed: Email not verified', { email })
      return res.status(400).json({ error: 'Please verify your email first' })
    }

    // Generate tokens
    const tokens = generateTokens(user)
    const accessToken = tokens.accessToken
    const refreshToken = tokens.refreshToken

    // Set cookies with access and refresh tokens
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    res.cookie('accessToken', accessToken, { 
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })

    logger.info('User logged in successfully', { email })

    // Respond with success message and tokens
    res.status(200).json({
      username: user.username,
      msg: 'User logged in successfully',
      userID: user._id,
      userRole: user.role,
      accessToken,
      refreshToken
    })
  } catch (err) {
    logger.error('Error logging in user:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirmation } = req.body
    const { userID } = req.params

    if (!currentPassword || !newPassword || !newPasswordConfirmation ) {
      return res.status(404).json({ error: "Please fill in all the required fields" })
    }

    if (!userID) {
      return res.status(404).json({ error: 'User ID is not found' })
    }

    const user = await User.findById(userID)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.'})
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'Your old password cant be your new password' })
    }
    if (newPassword !== newPasswordConfirmation) {
      return res.status(400).json({ error: "Passwords doesnt match" })
    }

    const hashedPassword = await hashPassword(newPassword, 10)
    await User.findOneAndUpdate({ _id: userID }, { password: hashedPassword }, { new: true })

    res.status(200).json({ msg: 'Password changed successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    // Check if user exists with the provided email
    const user = await User.findOne({ email: email })

    if (!user) {
      return res.status(404).json({ error: 'User email not found' })
    }

    // Generate reset token
    const resetToken = generateResetToken(user)

    // Save the reset token to the user object
    user.resetPasswordToken = resetToken
    await user.save()

    // Send reset password email
    await sendResetPasswordEmail(email, resetToken)

    return res.status(200).json({ msg: 'Your request has been processed, please wait 5-10 mins for the email.' })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const resetPassword = async (req, res) => {
  const { resetToken } = req.params
  const { newPassword, newPasswordConfirmation } = req.body

  try {
    console.log(resetToken)
    // Find user by reset token
    const user = await User.findOne({ resetPasswordToken: resetToken })

    console.log(user)

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired reset token' })
    }

    // Check if reset token has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired' })
    }

    // Check if passwords are matched
    if (newPassword !== newPasswordConfirmation) {
      return res.status(400).json({ error: 'Passwords dont match'})
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user's password
    user.password = hashedPassword
    // Clear reset token and expiration time
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res.status(200).json({ msg: 'Password reset successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  registerUser,
  verifyEmail,
  logIn,
  changePassword,
  forgotPassword,
  resetPassword
}