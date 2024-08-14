const User = require('../models/user') // Importing the User model
const Notification = require('../models/notifications')
const sharp = require('sharp')
const logger = require('../logger/logger')
const mongoose = require('mongoose')

const getUserData = async (req, res) => {
  const { username } = req.params
  try {
    if (!username) {
      logger.warn('Parameters not found for get-user-data')
      return res.status(400).json({ error: 'Parameters not found' })
    }

    // Find the user and populate posts, notifications, and likes
    const user = await User.findOne({ username: username })
      .populate({
        path: 'posts', // Reference to the Posts schema
        select: 'dishName ingredients dishImage datePosted hearts comments status',
        populate: {
          path: 'comments.author', // Populate the user details in comments
          select: 'username profilePic'
        } // Select fields to include in the result
      })
      .populate({
        path: 'notifications', // Reference to the Notification schema
        select: 'message type createdAt',
        populate: {
          path: 'userId', // Populate the user details who triggered the notification
          select: 'username profilePic'
        } // Select fields to include in the result
      })
      .populate({
        path: 'likes', // Reference to the Posts schema (likes)
        select: 'dishName ingredients dishImage datePosted hearts comments status', // Specify fields to include
        populate: {
          path: 'comments.author', // Populate the user details in comments
          select: 'username profilePic'
        } // Select fields to include in the result
      })

    if (!user) {
      logger.warn(`User not found: ${username}`)
      return res.status(400).json({ error: 'User not found' })
    }

    // Filter posts to include only those with status 'accepted'
    const acceptedPosts = user.posts.filter(post => post.status === 'accepted')

    const currentUser = {
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      joinedDate: user.joinedDate,
      posts: acceptedPosts, // Filtered posts
      likes: user.likes, // Populated likes with detailed information
      followers: user.followers, // Optionally populated
      following: user.following, // Optionally populated
      notifications: user.notifications // Newly added
    }

    res.status(200).json({ currentUser })
  } catch (err) {
    logger.error('Error getting user data:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const uploadProfilePic = async (req, res, userRepository) => {
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
      logger.warn('Unsupported image format received:', imageFormat)
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
  } catch (err) {
    // Handle errors
    logger.error('Upload profile picture error:', err)
    res.status(500).json({ error: 'Failed to upload profile picture. Please try again later.' })
  }
}

const followUser = async (req, res) => {
  const { username, followingUsername } = req.params

  // Validate usernames
  if (!username || !followingUsername) {
    logger.warn('Invalid usernames for follow operation:', { username, followingUsername })
    return res.status(400).json({ error: 'Invalid usernames' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Find the user by username
    const user = await User.findOne({ username }).session(session)
    if (!user) {
      await session.abortTransaction()
      session.endSession()
      logger.warn(`User not found for follow operation: ${username}`)
      return res.status(404).json({ error: 'User not found' })
    }

    // Find the user to follow by username
    const userToFollow = await User.findOne({ username: followingUsername }).session(session)
    if (!userToFollow) {
      await session.abortTransaction()
      session.endSession()
      logger.warn(`User to follow not found: ${followingUsername}`)
      return res.status(404).json({ error: 'User to follow not found' })
    }

    // Prevent self-following
    if (user._id.equals(userToFollow._id)) {
      await session.abortTransaction()
      session.endSession()
      logger.warn('Attempt to follow self:', { username, followingUsername })
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    // Check if user is already following the user
    if (user.following.includes(userToFollow._id)) {
      await session.abortTransaction()
      session.endSession()
      logger.warn('User already following the specified user:', { username, followingUsername })
      return res.status(400).json({error: 'You are already following this user' })
    }

    // Initialize following and followers arrays if undefined
    user.following = user.following || []
    userToFollow.followers = userToFollow.followers || []

    // Add userToFollow to the following list of user
    user.following.push(userToFollow._id)
    // Add user to the followers list of userToFollow
    userToFollow.followers.push(user._id)

    // Create a notification for userToFollow
    const notification = new Notification({
      userId: user._id,
      message: `${username} is now following you.`,
      type: 'follow',
      createdAt: new Date(),
    })

    // Save both users and the notification
    await Promise.all([
      user.save({ session }),
      userToFollow.save({ session }),
      notification.save({ session }),
    ])

    // Push notification reference to the userToFollow's notifications array
    userToFollow.notifications = userToFollow.notifications || []
    userToFollow.notifications.push(notification._id)
    await userToFollow.save({ session })

    await session.commitTransaction()
    session.endSession()

    logger.info(`User successfully followed: ${username} -> ${followingUsername}`)

    res.status(200).json({ message: 'Successfully followed the user' })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    logger.error('Error following user:', err)
    res.status(500).json({ error: 'Server error', error: err })
  }
}

const unfollowUser =  async (req, res) => {
  const { username, followingUsername } = req.params

  // Validate usernames
  if (!username || !followingUsername) {
    logger.warn('Invalid usernames for unfollow operation:', { username, followingUsername })
    return res.status(400).json({ error: 'Invalid usernames' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Find the user by username
    const user = await User.findOne({ username }).session(session)
    if (!user) {
      await session.abortTransaction()
      session.endSession()
      logger.warn(`User not found for unfollow operation: ${username}`)
      return res.status(404).json({ error: 'User not found' })
    }

    // Find the user to unfollow by username
    const userToUnfollow = await User.findOne({ username: followingUsername }).session(session)
    if (!userToUnfollow) {
      await session.abortTransaction()
      session.endSession()
      logger.warn(`User not found for unfollow operation: ${username}`)
      return res.status(404).json({error: 'User to unfollow not found' })
    }

    // Prevent self-unfollowing
    if (user._id.equals(userToUnfollow._id)) {
      await session.abortTransaction()
      session.endSession()
      logger.warn('Attempt to unfollow self:', { username, followingUsername })
      return res.status(400).json({ error: 'Cannot unfollow yourself' })
    }

    // Check if user is already not following the user
    if (!user.following.includes(userToUnfollow._id)) {
      await session.abortTransaction()
      session.endSession()
      logger.warn('User not following the specified user:', { username, followingUsername })
      return res.status(400).json({ error: 'You are not following this user' })
    }

    // Remove userToUnfollow from the following list of user
    user.following.pull(userToUnfollow._id)
    // Remove user from the followers list of userToUnfollow
    userToUnfollow.followers.pull(user._id)

    await Promise.all([
      user.save({ session }),
      userToUnfollow.save({ session }),
    ])

    await session.commitTransaction()
    session.endSession()

    logger.info(`User successfully unfollowed: ${username} -> ${followingUsername}`)

    res.status(200).json({ message: 'Successfully unfollowed the user' })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    logger.error('Error unfollowing user:', err)
    res.status(500).json({ error: 'Server error', error: err.message })
  }
}

const changeUserName = async (req, res) => {
  const { userID } = req.params
  const { username, newUserName } = req.body
  try {
    if (!username || !newUserName || !userID) {
      logger.warn('Username or new user name not found')
      return res.status(400).json({ error: 'Username or new user name not found' })
    }

    const user = await User.findById(userID)

    if (!user) {
      logger.warn(`User with ID ${userID} is not found`)
      return res.status(400).json({ error: `User with username ${username} is not found`})
    }

    if (user.username !== username) {
      logger.warn(`Unauthorized person is trying to change ${user.username} username`)
      return res.status(400).json({ error: 'Please enter your correct username' })
    }

    const existingUserName = await User.findOne({ username: newUserName })
    if (existingUserName) {
      logger.warn('Username already taken', { newUserName })
      return res.status(400).json({ error: 'Username already taken' })
    }

    if (user.username === newUserName) {
      return res.status(400).json({ error: 'Your new username cant be your old username' })
    }

    await User.findOneAndUpdate({ _id: userID }, { username: newUserName }, { new: true })

    res.status(200).json({ msg: 'Username has been updated succesfully' })
  } catch (err) {
    logger.error('Error changing user username', err)
    res.status(500).json({ error: 'Error changing username, please try again later'})
  }
}

module.exports = {
  getUserData,
  uploadProfilePic,
  followUser,
  unfollowUser,
  changeUserName
}