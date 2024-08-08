import { useState } from 'react'

import { ProfileSection } from '../../components/ProfileSection'
import './Home.css'

const Home = () => {
  const [showProfileSection, setShowProfileSection] = useState(false)

  return (
    <>
      <ProfileSection 
        showProfileSection={showProfileSection}
        setShowProfileSection={setShowProfileSection}
      />
      <div className="home-container">
          <div className='home-contents'>
            <h1>
              Taste the Philippines: <br />
              Find Your Perfect Recipe.
            </h1>
            <form className="search-form">
              <input className="dish-input" type="text" placeholder="Enter a dish or ingredient" />
              <select className='select'>
                <option value="dish">Search for a Dish</option>
                <option value="ingredients">Search for Ingredients</option>
              </select>
            </form>
          </div>
        </div>
    </>
  )
}

export default Home
