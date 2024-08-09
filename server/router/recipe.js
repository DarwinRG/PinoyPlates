// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const axios = require('axios')
const { verifyToken } = require('../middleware/verifyToken')
const logger = require('../logger/logger')

router.post('/get-recommendations', verifyToken, async (req, res) => {
  const userIngredients = req.body.ingredients

  try {
    console.log(userIngredients)
      // Send request to Flask service
      const response = await axios.post('http://localhost:5001/recommend', {
          ingredients: userIngredients
      })

      // Return the recommendations to the frontend
      res.json(response.data)
  } catch (err) {
      logger.error('Error getting recommendations:', err.message)
      res.status(500).send('Error getting recommendations');
  }
})

module.exports = router