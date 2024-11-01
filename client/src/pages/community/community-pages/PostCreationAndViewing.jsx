import { useState, useEffect } from 'react'
import usePrivateApi from '../../../../hooks/usePrivateApi'
import './PostCreationAndViewing.css'
import '../community.css'
import { useUserData } from '../../../../hooks/useUserData'

export const PostCreationAndViewing = () => {
  const [dishData, setDishData] = useState({})
  const [posts, setPosts] = useState([])
  const [base64Image, setBase64Image] = useState('')
  const [viewType, setViewType] = useState('community')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const userID = localStorage.getItem('userID')
  const privateAxios = usePrivateApi()
  const { user } = useUserData()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint = viewType === 'community' ? `posts/community-posts?page=${currentPage}&limit=10` : `posts/following-posts/${userID}?page=${currentPage}&limit=10`
        const response = await privateAxios(endpoint)
        if (response.data && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts)
          setTotalPages(response.data.totalPages)
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      }
    }
    fetchPosts();
  }, [viewType, currentPage, privateAxios, userID])

  useEffect(() => {
    if (user && user.likes) {
      setLikedPosts(new Set(user.likes.map(post => post._id)))
    }
  }, [user])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('dishName', dishData.dishName)
    formData.append('ingredients', dishData.ingredients)
    if (base64Image) {
      formData.append('dishImage', base64Image)
    }
    try {
      const response = await privateAxios.post(`/posts/create-post/${userID}`, formData)
      if (response.status === 201) {
        alert(response.data.message)
        setDishData({})
        setBase64Image('')
        setViewType('community')
        setCurrentPage(1) // Reset to the first page after submission
      }
    } catch (error) {
      console.error('Error submitting recipe:', error)
    }
  }

  const toggleView = (type) => {
    setViewType(type);
    setCurrentPage(1); // Reset to the first page when changing view
  }

  const handleUsernameClick = async (username) => {
    try {
      const response = await privateAxios.get(`user/get-user-data/${username}`)
      setSelectedUser(response.data.currentUser)
      setUserPosts(response.data.currentUser.posts || [])
      setIsFollowing(response.data.currentUser.followers.includes(userID))
      setViewType('profile')
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const closeProfile = () => {
    setSelectedUser(null)
    setViewType('community')
  }

  const handleLike = async (postID) => {
    try {
      const response = await privateAxios.post(`posts/like-post/${userID}/${postID}`)
      if (response.status === 200) {
        const updatedPosts = posts.map(post =>
          post._id === postID
            ? { ...post, hearts: response.data.hearts }
            : post
        )
        setPosts(updatedPosts);
        setLikedPosts(prev => new Set(prev.add(postID)))

        if (viewType === 'profile' && selectedUser) {
          const updatedUserPosts = userPosts.map(post =>
            post._id === postID
              ? { ...post, hearts: response.data.hearts }
              : post
          )
          setUserPosts(updatedUserPosts)
        }
      }
    } catch (error) {
      alert('Error liking post:', error)
    }
  }

  const handleUnlike = async (postID) => {
    try {
      const response = await privateAxios.delete(`posts/unlike-post/${userID}/${postID}`)
      if (response.status === 200) {
        const updatedPosts = posts.map(post =>
          post._id === postID
            ? { ...post, hearts: response.data.hearts }
            : post
        )
        setPosts(updatedPosts)
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postID)
          return newSet
        })

        if (viewType === 'profile' && selectedUser) {
          const updatedUserPosts = userPosts.map(post =>
            post._id === postID
              ? { ...post, hearts: response.data.hearts }
              : post
          )
          setUserPosts(updatedUserPosts)
        }
      }
    } catch (error) {
      console.error('Error unliking post:', error.response.data.error)
    }
  }

  const handleComment = async () => {
    alert('Comment feature is under development.')
  }

  const followUser = async () => {
    try {
      const response = await privateAxios.post(`user/follow/${user.username}/${selectedUser.username}`)
      if (response.status === 200) {
        alert(response.data.message)
        setIsFollowing(true)
      }
    } catch (err) {
      alert(err.response.data.error)
    }
  }

  const unfollowUser = async () => {
    try {
      const response = await privateAxios.post(`user/unfollow/${user.username}/${selectedUser.username}`)
      if (response.status === 200) {
        alert(response.data.message)
        setIsFollowing(false)
      }
    } catch (err) {
      alert(err.response.error)
    }
  }

  const loadMorePosts = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1)
    }
  }

  return (
    <div className="post-creation-and-viewing">
      {viewType === 'profile' ? (
        <div className="user-profile-view">
          <button onClick={closeProfile} className="close-button">Back to Posts</button>
          {selectedUser && (
            <>
              <div className="profile-header">
                <img src={selectedUser.profilePic} alt={selectedUser.username} className="profile-avatar" />
                <div className="profile-info">
                  <h2 className="profile-username">{selectedUser.username}</h2>
                  <p className="profile-date-joined">Joined: {new Date(selectedUser.joinedDate).toLocaleDateString()}</p>
                  <div className="profile-stats">
                    <span>Posts: {selectedUser.posts.length}</span>
                    <span>Followers: {selectedUser.followers.length}</span>
                    <span>Following: {selectedUser.following.length}</span>
                  </div>
                  {isFollowing ? (
                    <button className="follow-button unfollow" onClick={unfollowUser}>Unfollow</button>
                  ) : (
                    <button className="follow-button follow" onClick={followUser}>Follow</button>
                  )}
                </div>
              </div>
              <h3 className="user-posts-title">{selectedUser.username}'s posts</h3>
              <div className="user-posts">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className="post">
                      <div className="post-header">
                        <img src={selectedUser.profilePic} alt={selectedUser.username} className="user-profile-pic" />
                        <div className="post-user-info">
                          <h3>{selectedUser.username}</h3>
                          <p>{new Date(post.datePosted).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="post-content">
                        <h4>Dish Name: {post.dishName}</h4>
                        <p>Ingredients: {post.ingredients}</p>
                        {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
                      </div>
                      <div className="post-actions">
                        <button onClick={() => likedPosts.has(post._id) ? handleUnlike(post._id) : handleLike(post._id)} className="like-button">
                          ❤️ {post.hearts ? post.hearts.length : 0}
                        </button>
                        <button onClick={handleComment} className="comment-button">
                          💬 Comment
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No posts available.</p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="post-creation-and-viewing">
          <div className="post-creation">
            <h1 className='share-recipe'>Share Your Recipe</h1>
            <form onSubmit={handleSubmit} className="recipe-form">
              <div className="form-group">
                <label htmlFor="dishName">Dish Name:</label>
                <input
                  className='dish-input'
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
                  className='ingredients-text'
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
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div> 
          <div className="view-toggle">
            <button onClick={() => toggleView('community')} className={`view-button ${viewType === 'community' ? 'active' : ''}`}>
              Community Posts
            </button>
            <button onClick={() => toggleView('following')} className={`view-button ${viewType === 'following' ? 'active' : ''}`}>
              Following Posts
            </button>
          </div>
          <div className="posts">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="post">
                  <div className="post-header">
                    <img src={post.profilePic} alt={post.username} className="user-profile-pic" />
                    <div className="post-user-info">
                      <h3 onClick={() => handleUsernameClick(post.username)}>{post.username}</h3>
                      <p>{new Date(post.datePosted).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="post-content">
                    <p>Dish Name: <span className="bold-text">{post.dishName}</span></p>
                    <p>Ingredients: <span className="bold-text">{post.ingredients}</span></p>
                    {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
                  </div>
                  <div className="post-actions">
                    <button onClick={() => likedPosts.has(post._id) ? handleUnlike(post._id) : handleLike(post._id)} className="like-button">
                      ❤️ {post.hearts ? post.hearts.length : 0}
                    </button>
                    <button onClick={handleComment} className="comment-button">
                      💬 Comment
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No posts available.</p>
            )}
            {currentPage < totalPages && (
              <button onClick={loadMorePosts} className="load-more-button">
                Load More
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
