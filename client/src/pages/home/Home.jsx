import { useState, useEffect, useRef } from 'react'
import { ProfileSection } from '../../components/ProfileSection/ProfileSection'
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

  // Create a ref for the RecipeRecommendations section
  const recommendationsRef = useRef(null)

  const fetchRecommendations = async () => {
    try {
      if (ingredients.length === 0) {
        return alert('Please input an ingredient')
      }

      const response = await privateAxios.post('recipe/get-recommendations', {
        ingredients: ingredients
      })
      const data = response.data

      console.log(data)
      setRecommendations(data)

      if (response.data.message) {
        return alert(response.data.message)
      }

      // Ensure scrolling happens after state is updated
      setTimeout(() => {
        if (recommendationsRef.current) {
          recommendationsRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100) // Delay to ensure recommendations are rendered
    } catch (err) {
      alert(err.response.data.error)
      console.error('Error fetching recommendations:', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRecommendations()
  }

  useEffect(() => {
    if (navigateToCommunity) {
      navigate('/community/create&view')
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
          <form className="search-form" onSubmit={handleSearch}>
            <input
              className="dish-input"
              type="text"
              placeholder="Enter at least 4 ingredients for better results"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <select className='select'>
              <option value="dish">Search for a Dish</option>
            </select>
            <button type="submit" className='search-btn'>Search</button>
          </form>
          <button className='community' onClick={() => setNavigateToCommunity(true)}>Engage with the Community Now!</button>
        </div>
      </div>
      <div ref={recommendationsRef}>
        <RecipeRecommendations recommendations={recommendations} />
      </div>
    </>
  )
}

export default Home
