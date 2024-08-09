const jwt = require('jsonwebtoken')
require('dotenv').config()

// Generates access and refresh tokens for a given users
const generateTokens = (user) => {
  // Retrieve the secret key from environment variables
  const secretKey = process.env.SECRET_KEY
  
  // Generate access token with a 30-minute expiry
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '30m' } 
  )

  // Generate refresh token with a 3-hour expiry
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    secretKey,
    { expiresIn: '3h' } 
  )

  return { accessToken, refreshToken }
}

// Middleware function to verify the authenticity of JWT token attached to request.

const verifyToken = (req, res, next) => {
  // Extract token from cookies
  const token = req.cookies.accessToken

  console.log(token)

  // Handle missing token
  if (!token) {
    return res.status(401).send("Unauthorized: Missing token")
  }
  
  // Retrieve the secret key from environment variables
  const secretKey = process.env.SECRET_KEY

  // Handle missing secret key
  if (!secretKey) {
    console.error("Missing secret key")
    return res.status(500).send("Internal Server Error: Missing secret key")
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    // Log token for debugging

    // Handle verification errors
    if (err) {
      console.error(err)

      // Handle expired token
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send("Forbidden: Token has expired")
      }

      // Handle other verification failures
      return res.status(401).send("Forbidden: Token verification failed")
    }

    // Store decoded token in request object
    req.user = decoded
    next()
  })
}

module.exports = { verifyToken, generateTokens }