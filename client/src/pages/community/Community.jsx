import React, { useState, useEffect, startTransition } from 'react'
import usePrivateApi from '../../../hooks/usePrivateApi'
import './community.css' // Make sure to create or update this CSS file for styling

const Community = () => {
  // Combine state into a single object
  const [dishData, setDishData] = useState({})
  const [posts, setPosts] = useState([])
  const privateAxios = usePrivateApi()
  const [ base64Image, setBase64Image ] = useState('')
  const userID = localStorage.getItem('userID')

  // Handle input changes for dish data
  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setDishData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const convertToBase64 = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        console.log(reader.result)
        setBase64Image(reader.result)
      }

      reader.onerror = (error) => {
        console.error("Error reading file:", error)
      }
    }
  }

  // Handle image file change separately
  const handleImageChange = (e) => {
    setDishData((prevData) => ({
      ...prevData,
      image: e.target.files[0]
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Implement form submission logic, e.g., send data to server
    console.log('Dish Data:', dishData)
    // You can use FormData to handle file uploads
    const formData = new FormData()
    formData.append('dishName', dishData.dishName)
    formData.append('ingredients', dishData.ingredients)
    if (base64Image) {
      formData.append('dishImage', base64Image)
    }
    try {
      console.log(userID)
      const response = await privateAxios.post(`/posts/create-post/${userID}`, formData)

      if (response.status === 201) {
        alert(response.data.message)
        startTransition(() => {
          setDishData({})
        })
      }
    } catch (error) {
      console.error('Error submitting recipe:', error)
    }
  }

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await privateAxios('/posts/global-posts', { params: { page: 1, limit: 10 } })
        console.log(response.data.globalPosts)
        setPosts(response.data.globalPosts)
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
    fetchPosts()
  }, [privateAxios])

  // Handle like button click
  const handleLike = (postId) => {
    // Implement like functionality
    console.log('Like post with ID:', postId)
  }

  // Handle comment button click
  const handleComment = (postId) => {
    // Implement comment functionality
    console.log('Comment on post with ID:', postId)
  }

  return (
    <div className="community-container">
      <h1>Share Your Recipe</h1>
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="dishName">Dish Name:</label>
          <input
            type="text"
            id="dishName"
            name="dishName"
            value={dishData.dishName}
            onChange={handleFieldChange}
            placeholder="Enter the name of the dish"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients:</label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={dishData.ingredients}
            onChange={handleFieldChange}
            placeholder="Enter the ingredients, separated by commas"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Dish Image:</label>
          <input
            type="file"
            accept=".jpeg, .jpg, .png"
            onChange={convertToBase64}
          />
        </div>
        <button type="submit">Submit Recipe</button>
      </form>

      <div className="posts-container">
        <h2>Community Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post">
              <div className="post-header">
                <img src={post.userProfilePic} alt={post.username} className="user-profile-pic" />
                <div className="post-user-info">
                  <h3>{post.username}</h3>
                  <p>{new Date(post.datePosted).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="post-content">
                <h4>Dish Name: {post.dishName}</h4>
                <p>Ingredients: {post.ingredients}</p>
                {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
              </div>
              <div className="post-actions">
                <button onClick={() => handleLike(post._id)} className="like-button">
                  ❤️ {post.hearts}
                </button>
                <button onClick={() => handleComment(post._id)} className="comment-button">
                  💬 Comment
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first to share a recipe!</p>
        )}
      </div>
    </div>
  )
}

export default Community
