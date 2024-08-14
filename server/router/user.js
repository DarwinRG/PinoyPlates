// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const {
  getUserData,
  uploadProfilePic,
  followUser,
  unfollowUser,
  changeUserName
} = require('../controller/userController')
const { verifyToken } = require('../middleware/verifyToken')

// Route for getting the user data
router.get('/get-user-data/:username', verifyToken, (req, res) => getUserData(req, res) )

// Route for uploading user profile picture
router.post('/upload-user-pic/:username', (req, res) => uploadProfilePic(req, res))

// Route for following another user
router.post('/follow/:username/:followingUsername', (req, res) => followUser(req, res))

// Route for unfollowing another user
router.post('/unfollow/:username/:followingUsername', (req, res) => unfollowUser(req, res))

// Route for changing username
router.put('/change-username/:userID', (req, res) => changeUserName(req, res))



module.exports = router