const logger = require('../logger/logger')
const axios = require('axios')

const getRecipeRecommendations = async (req, res) => {
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
}

module.exports = {
  getRecipeRecommendations
}