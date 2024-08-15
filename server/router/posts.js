// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const { checkRole, ROLES } = require('../middleware/roleChecker')
const { verifyToken } = require('../middleware/verifyToken')
const {
  createPost,
  fetchPendingPosts,
  likePost,
  unlikePost,
  getGlobalPosts,
  getFollowingPosts,
  getCommunityPosts,
  acceptPendingPost,
  rejectPendingPost
} = require('../controller/postsController')

router.post('/create-post/:userID', (req, res) => (createPost(req, res)))

router.get('/pending-posts', verifyToken, checkRole([ROLES.MODERATOR]), (req, res) => (fetchPendingPosts(req, res)))

// Route for liking user post
router.post('/like-post/:userID/:postID', verifyToken, (req, res) => (likePost(req, res)))

// Route for unliking a user post
router.delete('/unlike-post/:userID/:postID', verifyToken, (req, res) => (unlikePost(req, res)))

router.get('/global-posts', (req, res) => (getGlobalPosts(req, res)))

router.get('/community-posts', verifyToken, (req, res) => (getCommunityPosts(req, res)))

router.get('/following-posts/:userID', verifyToken, (req, res) => (getFollowingPosts(req, res)))

router.put('/accept-post/:postID', verifyToken, checkRole([ROLES.MODERATOR]), (req, res) => (acceptPendingPost(req, res)))

router.put('/reject-post/:postID', verifyToken, checkRole([ROLES.MODERATOR]), (req, res) => (rejectPendingPost(req, res)))

module.exports = router