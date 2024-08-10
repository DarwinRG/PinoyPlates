const Posts = require('../models/posts')
const User = require('../models/user')
const logger = require('../logger/logger')
const mongoose = require('mongoose')

const createPost = async (req, res) => {
  const { dishName, ingredients, dishImage } = req.body
  const { userID } = req.params

  try {
    if (!dishName || !ingredients) {
      return res.status(400).json({ error: 'Dish name and Ingredients are required' })
    }

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const user = await User.findById(userID)

    if (!user) {
      return res.status(400).json({ error: 'User is not found' })
    }

    newPost = new Posts({
      dishName,
      ingredients,
      dishImage: dishImage || '', // Default to an empty string if no image provided
      postOwner: userID,
      createdAt: new Date(),
    })

    // Save the post to the database
    await newPost.save()

    logger.info('Post created succesfully by:', userID)

    // Respond with the created post
    res.status(201).json({ message: 'Post created successfully, please wait as our moderator will review it first.' })
  } catch (err) {
    logger.error('Error creating post:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const fetchPendingPosts = async (req, res) => {
  try {
    const pendingPosts = await Posts.find({ status: 'pending' }) // Fetch all posts with status 'pending'

    // Check if there are any pending post
    if (!pendingPosts.length) {
      return res.status(404).json({ message: 'No pending posts found' })
    }

    // Send the pending posts as the response
    res.status(200).json({ pendingPosts })
  } catch (err) {
    logger.error('Error fetching pending posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const likePost = async (req, res) => {
  const { userID, postID } = req.params

  if (!userID || !postID) {
    return res.status(400).json({ error: 'User and post ID are required' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Fetch the user and post within the transaction session
    const user = await User.findById(userID).session(session)
    const post = await Posts.findById(postID).session(session)

    if (!user || !post) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ error: 'User or Post not found' })
    }

    if (user.likes.includes(postID)) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ error: 'You already liked this post' })
    }

    // Update user and post likes
    user.likes.push(post._id)
    post.hearts.push(user._id)

    await Promise.all([
      user.save({ session }),
      post.save({ session }),
    ])

    await session.commitTransaction()
    session.endSession()

    logger.info(`User ${user._id} has liked post ${post._id} succesfully`)

    res.status(200).json({ message: 'Post liked successfully' })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    logger.error('Error liking post:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const unlikePost = async (req, res) => {
  const { userID, postID } = req.params

  if (!userID || !postID) {
    return res.status(400).json({ error: 'User and post ID are required' })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Fetch the user and post within the transaction session
    const user = await User.findById(userID).session(session)
    const post = await Posts.findById(postID).session(session)

    if (!user || !post) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ error: 'User or Post not found' })
    }

    // Check if the user has liked the post
    if (!user.likes.includes(postID)) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ error: 'You have not liked this post' })
    }

    // Remove the like from user and post
    user.likes.pull(postID)
    post.hearts.pull(userID)

    await Promise.all([
      user.save({ session }),
      post.save({ session }),
    ])

    await session.commitTransaction()
    session.endSession()

    logger.info(`User ${user._id} has unliked post ${post._id} succesfully`)

    res.status(200).json({ message: 'Post unliked successfully' })
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    logger.error('Error unliking post:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const getGlobalPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query // Default to page 1 and limit 10 if not provided

  try {
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }

    // Get the current date and the date 24 hours ago
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch the most hearted posts in the past 24 hours with pagination
    const globalPosts = await Posts.aggregate([
      { $match: { datePosted: { $gte: past24Hours } } },
      { $sort: { hearts: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber }
    ])

    // Fetch the total count of posts to calculate the total number of pages
    const totalPosts = await Posts.countDocuments({ datePosted: { $gte: past24Hours } })

    res.status(200).json({
      globalPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNumber),
      currentPage: pageNumber
    })
  } catch (err) {
    logger.error('Error fetching global posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const getFollowingPosts = async (req, res) => {
  const { userID } = req.params
  const { page = 1, limit = 10 } = req.query // Default to page 1 and limit 10 if not provided

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }

    // Find the user and populate their following list
    const user = await User.findById(userID).populate('following')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get the IDs of users that the user is following
    const followingIDs = user.following.map(follow => follow._id)

    // Fetch posts from the users that the current user is following with pagination
    const followingPosts = await Posts.find({ postOwner: { $in: followingIDs } })
      .sort({ datePosted: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Fetch the total count of posts to calculate the total number of pages
    const totalPosts = await Posts.countDocuments({ postOwner: { $in: followingIDs } })

    if (followingPosts.length === 0) {
      return res.status(404).json({ message: 'No posts found from following users' })
    }

    res.status(200).json({
      followingPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNumber),
      currentPage: pageNumber
    })
  } catch (err) {
    logger.error('Error fetching following posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  createPost,
  fetchPendingPosts,
  likePost,
  unlikePost,
  getGlobalPosts,
  getFollowingPosts
} 