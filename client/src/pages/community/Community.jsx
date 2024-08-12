import { useState, useEffect, startTransition } from 'react'
import usePrivateApi from '../../../hooks/usePrivateApi'
import './community.css'
import { useUserData } from '../../../hooks/useUserData'

const Community = () => {
  const [dishData, setDishData] = useState({})
  const [posts, setPosts] = useState([])
  const privateAxios = usePrivateApi()
  const [base64Image, setBase64Image] = useState('')
  const userID = localStorage.getItem('userID')
  const { user } = useUserData()

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setDishData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const convertToBase64 = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        setBase64Image(reader.result)
      }

      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }
    }
  }

  // Handle image file change separately
  const handleImageChange = (e) => {
    setDishData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('dishName', dishData.dishName)
    formData.append('ingredients', dishData.ingredients)
    if (base64Image) {
      formData.append('dishImage', base64Image)
    }
    try {
      const response = await privateAxios.post(`/posts/create-post/${userID}`, formData)

      if (response.status === 201) {
        alert(response.data.message);
        startTransition(() => {
          setDishData({})
          setBase64Image('')
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
        setPosts(response.data.globalPosts);
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

  const navigateToProfile = () => {
    // Implement navigation to the user's profile
    console.log('Navigate to profile')
  }

  return (
    <div className="community-container">
      <div className="user-details">
        <div className="user-section">
          <img src={user.profilePic} alt="user-pic" />
          <h2>{user.username}</h2>
          <div className="user-actions">
            <button onClick={() => console.log('Show Likes')}>Likes</button>
            <button onClick={() => console.log('Show Saved')}>Saved</button>
            <button onClick={() => console.log('Show Notifications')}>Notifications</button>
            <button onClick={navigateToProfile}>Go to Profile</button>
          </div>
        </div>
      </div>
      <div className="post-creation-and-viewing">
        <div className="post-creation">
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
        </div>
        <div className="post-viewing">
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
      <div className="recommendations-and-search">
        <div className="search">
          <input type="text" placeholder="Search for accounts..." />
        </div>
        <div className="recommendations">
          <h2>Follow Recommendations</h2>
          {/* Recommendations content */}
        </div>
      </div>
    </div>
  )
}

export default Community