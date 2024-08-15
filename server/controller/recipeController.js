const logger = require('../logger/logger')
const axios = require('axios')
const dotenv = require('dotenv').config()

const getRecipeRecommendations = async (req, res) => {
  const userIngredients = req.body.ingredients

  try {
    if (userIngredients.length === 0 || !userIngredients.trim()) {
      return res.status(400).json({ error: 'Ingredients list is empty or contains only blank spaces.' })
    }
    console.log(userIngredients)
      // Send request to Flask service
      const response = await axios.post(process.env.FLASK_URL, {
          ingredients: userIngredients
      })

      // Return the recommendations to the frontend
      res.json(response.data)
  } catch (err) {
      logger.error('Error getting recommendations:', err)
      res.status(500).send('Error getting recommendations')
  }
}

module.exports = {
  getRecipeRecommendations
}