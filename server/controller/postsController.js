const Posts = require('../models/posts')
const User = require('../models/user')
const logger = require('../logger/logger')
const mongoose = require('mongoose')
const sharp = require('sharp')

const createPost = async (req, res) => {
  const { dishName, ingredients, dishImage } = req.body
  const { userID } = req.params

  try {

    if (!dishName || !ingredients) {
      return res.status(400).json({ error: 'Dish name and Ingredients are required' })
    }

    let resizedImageBase64 = ''

    if (dishImage) {
      // Allowed image formats
      const allowedFormats = ['jpeg', 'jpg', 'png']
      // Detect the image format from base64 string
      const detectedFormat = dishImage.match(/^data:image\/(\w+);base64,/)
      const imageFormat = detectedFormat ? detectedFormat[1] : null

      // Check if image format is supported
      if (!imageFormat || !allowedFormats.includes(imageFormat.toLowerCase())) {
        logger.warn('Unsupported image format received:', imageFormat)
        return res.status(400).json({ error: 'Unsupported image format. Please upload a JPEG, JPG, or PNG image.' })
      }

      // Convert base64 image to buffer
      const imageBuffer = Buffer.from(dishImage.split(',')[1], 'base64')

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
      resizedImageBase64 = `data:image/${imageFormat};base64,${resizedImage.toString('base64')}`
    }

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const user = await User.findById(userID)

    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    const newPost = new Posts({
      dishName,
      ingredients,
      dishImage: resizedImageBase64, // Either resized image or an empty string
      postOwner: userID,
      createdAt: new Date(),
    })

    // Save the post to the database
    await newPost.save()

    logger.info('Post created successfully by:', userID)

    // Respond with the created post
    res.status(201).json({ message: 'Post created successfully, please wait as our moderator will review it first.' })
  } catch (err) {
    logger.error('Error creating post:', err)
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
      { $match: { status: 'accepted', datePosted: { $gte: past24Hours } } },
      { $sort: { hearts: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      // Lookup user details from Users collection
      {
        $lookup: {
          from: 'users', // The name of the collection for user data
          localField: 'postOwner', // The field in the Posts collection
          foreignField: '_id', // The field in the Users collection
          as: 'userDetails' // The alias for the joined data
        }
      },
      // Unwind the userDetails array to get a single object for each post
      { $unwind: '$userDetails' },
      // Project the desired fields
      {
        $project: {
          _id: 1,
          dishName: 1,
          ingredients: 1,
          dishImage: 1,
          hearts: 1,
          datePosted: 1,
          'userDetails.username': 1,
          'userDetails.profilePic': 1,
          username: '$userDetails.username',
          profilePic: '$userDetails.profilePic'
        }
      }
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
    const followingPosts = await Posts.aggregate([
      { $match: { postOwner: { $in: followingIDs } } },
      { $sort: { datePosted: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      // Lookup user details from Users collection
      {
        $lookup: {
          from: 'users', // The name of the collection for user data
          localField: 'postOwner', // The field in the Posts collection
          foreignField: '_id', // The field in the Users collection
          as: 'userDetails' // The alias for the joined data
        }
      },
      // Unwind the userDetails array to get a single object for each post
      { $unwind: '$userDetails' },
      // Project the desired fields
      {
        $project: {
          _id: 1,
          dishName: 1,
          ingredients: 1,
          dishImage: 1,
          hearts: 1,
          datePosted: 1,
          status: 1, // Include status
          'userDetails.username': 1,
          'userDetails.profilePic': 1,
          username: '$userDetails.username',
          profilePic: '$userDetails.profilePic'
        }
      }
    ])

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

const getCommunityPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query // Default to page 1 and limit 10 if not provided

  try {
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }

    // Get the current date and the date 7 days ago for community posts
    const now = new Date();
    const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch community posts with random sampling
    const communityPosts = await Posts.aggregate([
      { $match: { status: 'accepted', datePosted: { $gte: past7Days } } },
      { $sample: { size: limitNumber } }, // Randomly sample the posts
      // Lookup user details from Users collection
      {
        $lookup: {
          from: 'users', // The name of the collection for user data
          localField: 'postOwner', // The field in the Posts collection
          foreignField: '_id', // The field in the Users collection
          as: 'userDetails' // The alias for the joined data
        }
      },
      // Unwind the userDetails array to get a single object for each post
      { $unwind: '$userDetails' },
      // Project the desired fields
      {
        $project: {
          _id: 1,
          dishName: 1,
          ingredients: 1,
          dishImage: 1,
          hearts: 1,
          datePosted: 1,
          'userDetails.username': 1,
          'userDetails.profilePic': 1,
          username: '$userDetails.username',
          profilePic: '$userDetails.profilePic'
        }
      }
    ])

    // Fetch the total count of posts to calculate the total number of pages
    const totalPosts = await Posts.countDocuments({ datePosted: { $gte: past7Days } })

    res.status(200).json({
      communityPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNumber),
      currentPage: pageNumber
    })
  } catch (err) {
    logger.error('Error fetching community posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const fetchPendingPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query // Default to page 1 and limit 10 if not provided

  try {
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }

    // Fetch pending posts with pagination
    const pendingPosts = await Posts.find({ status: 'pending' })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first

    // Fetch the total count of pending posts to calculate the total number of pages
    const totalPosts = await Posts.countDocuments({ status: 'pending' })

    if (pendingPosts.length === 0) {
      return res.status(404).json({ message: 'No pending posts found' })
    }

    res.status(200).json({
      pendingPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNumber),
      currentPage: pageNumber
    })
  } catch (err) {
    logger.error('Error fetching pending posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const acceptPendingPost = async (req, res) => {
  const { postID } = req.params

  try {
    if (!postID) {
      return res.status(400).json({ error: 'Post ID is required'})
    }

    const post = await Posts.findById(postID)

    if (!post) {
      return res.status(400).json({ error: 'Post is not found'})
    }

    await Posts.findOneAndUpdate({ _id: postID}, { status : 'accepted' }, { new: true})

    res.status(200).json({ msg: 'Post has been accepted succesfully' })
  } catch(err) {
    logger.error('Error accepting pending posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

const rejectPendingPost = async (req, res) => {
  const { postID } = req.params

  try {
    if (!postID) {
      return res.status(400).json({ error: 'Post ID is required'})
    }

    const post = await Posts.findById(postID)

    if (!post) {
      return res.status(400).json({ error: 'Post is not found'})
    }

    await Posts.findOneAndUpdate({ _id: postID}, { status : 'rejected' }, { new: true})

    res.status(200).json({ msg: 'Post has been rejected succesfully' })
  } catch(err) {
    logger.error('Error accepting pending posts:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  createPost,
  likePost,
  unlikePost,
  getGlobalPosts,
  getFollowingPosts,
  getCommunityPosts,
  fetchPendingPosts,
  acceptPendingPost,
  rejectPendingPost
} 