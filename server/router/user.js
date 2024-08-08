// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const User = require('../models/user') // Importing the User model
const sharp = require('sharp')

router.get('/get-user-data/:username', async (req, res) => {
  const { username } = req.params
  try {
    if (!username) {
      return res.status(400).json({ error: 'Parameters not found'})
    }

    const user = await User.findOne({ username: username })

    if (!user) {
      return res.status(400).json({ error: 'User not found'})
    }

    const currentUser = {
      username: user.username,
      email: user.email,
      profilePic: user.profilePic
    }

    res.status(200).json({ currentUser })
  } catch (err) {
    console.error('Error getting user data:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/upload-user-pic/:username', async (req, res, userRepository) => {
  // Extracts necessary details from request body and parameters
  const { base64Image } = req.body
  const username = req.params.username

  try {
    // Allowed image formats
    const allowedFormats = ['jpeg', 'jpg', 'png']
     // Detect the image format from base64 string
    const detectedFormat = base64Image.match(/^data:image\/(\w+);base64,/)
    const imageFormat = detectedFormat ? detectedFormat[1] : null

      // Check if image format is supported
    if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
      return res.status(400).json({ error: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' })
    }

     // Convert base64 image to buffer
    const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64')

    // Resize the image
    const resizedImage = await sharp(imageBuffer)
      .resize({
        fit: 'cover',
        width: 200,
        height: 200,
        withoutEnlargement: true,
      })
      .toFormat(imageFormat)
      .toBuffer()

    // Convert resized image buffer to base64
    const resizedImageBase64 = `data:image/${imageFormat};base64,${resizedImage.toString('base64')}`

    // Update user profile picture in the database
    await User.findOneAndUpdate({ username: username }, { profilePic: resizedImageBase64 }, {new: true})

     // Respond with success message and resized image
    res.status(200).json({ msg: 'Profile picture uploaded successfully', resizedImage: resizedImageBase64 })
  } catch (error) {
    // Handle errors
    console.error('Upload profile picture error:', error.message)
    res.status(500).json({ error: 'Failed to upload profile picture. Please try again later.' })
  }
}
)


module.exports = router