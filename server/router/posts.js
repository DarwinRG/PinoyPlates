// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const Posts = require('../models/posts')
const User = require('../models/user')

router.post('/create-post/:userID', async (req, res) => {
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

    // Respond with the created post
    res.status(201).json({ message: 'Post created successfully, please wait as our moderator will review it first.' })
  } catch (err) {
    console.error('Error creating post:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router