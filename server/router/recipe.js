// Import necessary modules and packages
const express = require('express') // Importing Express framework
const router = express.Router() // Creating a router object to handle routes
const axios = require('axios')

router.post('/get-recommendations', async (req, res) => {
  const userIngredients = req.body.ingredients

  try {
    console.log(userIngredients)
      // Send request to Flask service
      const response = await axios.post('http://localhost:5001/recommend', {
          ingredients: userIngredients
      })

      // Return the recommendations to the frontend
      res.json(response.data)
  } catch (error) {
      res.status(500).send('Error getting recommendations');
  }
})

module.exports = router