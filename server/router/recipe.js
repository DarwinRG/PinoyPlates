// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const { verifyToken } = require('../middleware/verifyToken')
const { getRecipeRecommendations } = require('../controller/recipeController')


router.post('/get-recommendations', verifyToken, (req, res) => 
  getRecipeRecommendations(req, res)
)

module.exports = router