const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Refreshes the access token using the refresh token stored in cookies.
router.post('/refresh', async (req, res) => {
  try {
    // Extract refresh token from cookies
    const { refreshToken } = req.cookies

    // Check if refresh token is missing
    if (!refreshToken) {
      console.error("Missing refresh token")
      throw new Error("Missing refresh token")
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY)

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.SECRET_KEY,
      { expiresIn: '30m' }
    )

    // Set the new access token in cookies
    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, sameSite: 'none' })
    // Set the new access token in the response header
    res.setHeader('Authorization', `Bearer ${newAccessToken}`)
    // Send response indicating successful token refresh
    res.status(200).json({ newAccessToken, msg: 'token refreshed' })
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('Error refreshing token:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' })
    }
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = router
