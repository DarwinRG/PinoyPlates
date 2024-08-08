import React, { useState, useEffect } from 'react'
import './community.css' // Make sure to create or update this CSS file for styling

const Community = () => {
  const [dishName, setDishName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [image, setImage] = useState(null)
  const [posts, setPosts] = useState([])

  // Handle input changes
  const handleDishNameChange = (e) => setDishName(e.target.value)
  const handleIngredientsChange = (e) => setIngredients(e.target.value)
  const handleImageChange = (e) => setImage(e.target.files[0])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dish Name:', dishName)
    console.log('Ingredients:', ingredients)
    console.log('Image:', image)
    // Handle form submission, e.g., send data to a server
  };

  // Fetch posts on component mount
  useEffect(() => {
    // Replace with your API call to fetch posts
    const fetchPosts = async () => {
      // Example fetch call, replace with actual API endpoint
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data);
    }

    fetchPosts()
  }, [])

  return (
    <div className="community-container">
      <h1>Share Your Recipe</h1>
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="dishName">Dish Name:</label>
          <input
            type="text"
            id="dishName"
            value={dishName}
            onChange={handleDishNameChange}
            placeholder="Enter the name of the dish"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients:</label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={handleIngredientsChange}
            placeholder="Enter the ingredients, separated by commas"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Dish Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit">Submit Recipe</button>
      </form>
      
      <div className="posts-container">
        <h2>Community Posts</h2>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className="post">
              <h3>{post.dishName}</h3>
              <p>{post.ingredients}</p>
              {post.image && <img src={post.image} alt={post.dishName} className="post-image" />}
              {/* You can add more details or styling as needed */}
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first to share a recipe!</p>
        )}
      </div>
    </div>
  )
}

export default Community;
