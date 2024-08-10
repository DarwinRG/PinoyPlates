// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const { checkRole, ROLES } = require('../middleware/roleChecker')
const {
  createPost,
  fetchPendingPosts,
  likePost,
  unlikePost,
  getGlobalPosts,
  getFollowingPosts
} = require('../controller/postsController')

router.post('/create-post/:userID', (req, res) => (createPost(req, res)))

router.get('/pending-posts', (req, res) => (fetchPendingPosts(req, res)))

// Route for liking user post
router.post('/like-post/:userID/:postID', (req, res) => (likePost(req, res)))

// Route for unliking a user post
router.delete('/unlike-post/:userID/:postID', (req, res) => (unlikePost(req, res)))

router.get('/global-posts', (req, res) => (getGlobalPosts(req, res)))

router.get('/following-posts/:userID', (req, res) => (getFollowingPosts(req, res)))

module.exports = router