import { useState, useEffect } from 'react'
import api from '../../../utils/api'
import { ProfileSection } from '../../components/ProfileSection'
import './Home.css'
import RecipeRecommendations from './Recommendation'
import { useNavigate } from 'react-router-dom'
import usePrivateApi from '../../../hooks/usePrivateApi'

const Home = () => {
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [ingredients, setIngredients] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [navigateToCommunity, setNavigateToCommunity] = useState(false)
  const privateAxios = usePrivateApi()
  const navigate = useNavigate()

  const fetchRecommendations = async () => {
    try {
      if (ingredients.length === 0) {
        return alert('Please input an ingredient')
      }

      const response = await privateAxios.post('recipe/get-recommendations', {
        ingredients: ingredients
      })
      const data = response.data
      setRecommendations(data)
    } catch (err) {
      alert(err.response.data.error)
      console.error('Error fetching recommendations:', err)
    }
  }

  const handleSearch = () => {
    fetchRecommendations()
  }

  useEffect(() => {
    if (navigateToCommunity) {
      navigate('/community')
    }
  }, [navigateToCommunity, navigate])

  return (
    <>
      <ProfileSection 
        showProfileSection={showProfileSection}
        setShowProfileSection={setShowProfileSection}
      />
      <div className={`home-container ${showProfileSection ? 'blurred' : ''}`}>
        <div className='home-contents'>
          <h1>
            Taste the Philippines: <br />
            Find Your Perfect Recipe.
          </h1>
          <form className="search-form" onSubmit={(e) => { e.preventDefault(), handleSearch() }}>
            <input
              className="dish-input"
              type="text"
              placeholder="Enter a dish or ingredient"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <select className='select'>
              <option value="dish">Search for a Dish</option>
              <option value="ingredients">Search for Ingredients</option>
            </select>
            <button type="submit" className='search-btn'>Search</button>
          </form>
          <button className='community' onClick={() => setNavigateToCommunity(true)}>Engage with the Community Now!</button>
        </div>
      </div>
      <RecipeRecommendations recommendations={recommendations} />
    </>
  )
}

export default Home