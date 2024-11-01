import { useState, useEffect } from 'react'
import usePrivateApi from '../../../hooks/usePrivateApi'
import { useUserData } from '../../../hooks/useUserData'
import { PostCreationAndViewing } from './community-pages/PostCreationAndViewing'
import { PendingPosts } from './community-pages/PendingPosts'
import { Profile } from './community-pages/Profile'
import { Notifications } from './community-pages/Notifications'
import { Likes } from './community-pages/Likes'
import './community.css'
import { useNavigate, useParams } from 'react-router-dom'

const Community = () => {
  const { view } = useParams()
  const [currentView, setCurrentView] = useState(view)
  const [searchedUser, setSearchedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isChangingUsername, setIsChangingUsername] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [oldUsername, setOldUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [passwordData, setPasswordData] = useState({})
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [posts, setPosts] = useState([]) // Define posts state here
  const userID = localStorage.getItem('userID')
  const userRole = localStorage.getItem('userRole')
  const { user } = useUserData()
  const privateAxios = usePrivateApi()
  const navigate = useNavigate()

  const handleButtonClick = (view) => {
    setCurrentView(view)
    navigate(`/community/${view}`)
    setIsChangingUsername(false)
    setIsChangingPassword(false)
  }

  useEffect(() => {
    if (user && user.likes) {
      setLikedPosts(new Set(user.likes.map(post => post._id)))
    }
  }, [user])

  useEffect(() => {
    if (searchedUser) {
      if (user && searchedUser) {
        setIsFollowing(user.following && user.following.includes(searchedUser._id))
      }
      if (searchedUser.posts) {
        setPosts(searchedUser.posts)
      }
    }
  }, [searchedUser, user])

  useEffect(() => {
    if (searchedUser && searchedUser.posts) {
      setPosts(searchedUser.posts)
    }
  }, [searchedUser])

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        const response = await privateAxios.get(`user/get-user-data/${searchQuery}`)
        setSearchedUser(response.data.currentUser)
        setCurrentView('searchedUserProfile')
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }

  const handleUsernameChange = async (e) => {
    e.preventDefault()
    try {
      const response = await privateAxios.put(`user/change-username/${userID}`, { username: oldUsername, newUserName: newUsername })
      if (response.status === 200) {
        alert(response.data.msg)
        setUser(prevUser => ({ ...prevUser, username: newUsername }))
        setOldUsername('')
        setNewUsername('')
      }
      setIsChangingUsername(false)
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error)
      }
    }
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.newPasswordConfirmation) {
      alert("New password and confirmation do not match!")
      return
    }
    try {
      const response = await privateAxios.put(`auth/change-password/${userID}`, { 
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword, 
        newPasswordConfirmation: passwordData.newPasswordConfirmation
      })
      if (response.status === 200) {
        alert(response.data.msg)
      }
      setIsChangingPassword(false)
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error)
      }
    }
  }

  const handleLike = async (postID) => {
    try {
      const response = await privateAxios.post(`posts/like-post/${userID}/${postID}`)
      if (response.status === 200) {
        // Update posts with the new hearts count
        const updatedPosts = posts.map(post =>
          post._id === postID
            ? { ...post, hearts: response.data.hearts }
            : post
        )
        setPosts(updatedPosts)
        // Update the liked state
        setLikedPosts(prev => new Set(prev.add(postID)))
        
      }
    } catch (error) {
      console.error('Error liking post:', error)
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
        // Update the liked state
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postID)
          return newSet
        })

      }
    } catch (error) {
      console.error('Error unliking post:', error)
    }
  }  

  const handleLoggingOut = async () => {
    try {
      const response = await privateAxios.delete(`auth/logout/${userID}`)

      if (response.status === 200) {
        localStorage.clear()
        navigate('/auth')
      }
    } catch (err) {
      alert('Error logging out')
    }
  }

  const followUser = async () => {
    try {
      const response = await privateAxios.post(`user/follow/${user.username}/${searchedUser.username}`)
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
      const response = await privateAxios.post(`user/unfollow/${user.username}/${searchedUser.username}`)
      if (response.status === 200) {
        alert(response.data.message)
        setIsFollowing(false)
      }
    } catch (err) {
      alert(err.response.error)
    }
  }

  const handleComment = () => {
    alert('Comment feature is under development')
  }

  return (
    <div className="community-container">
      <div className="user-details">
        <div className="user-section">
          <img src={user.profilePic} alt="user-pic" />
          <h2>{user.username}</h2>
          <div className='follow-count'>
            <h3>Following: {user.following ? user.following.length : 0}</h3>
            <h3>Followers: {user.followers ? user.followers.length : 0}</h3>
          </div>
          <div className="user-actions">
            <button onClick={() => handleButtonClick('create&view')}>Community</button>
            <button onClick={() => handleButtonClick('likes')}>Likes</button>
            <button onClick={() => handleButtonClick('notifications')}>Notifications</button>
            <button onClick={() => handleButtonClick('profile')}>Go to Profile</button>
            {userRole === 'Moderator' && <button onClick={() => handleButtonClick('pendingPosts')}>Pending Posts</button>}
            <button onClick={() => setIsChangingUsername(!isChangingUsername)}>
              {isChangingUsername ? 'Cancel' : 'Change Username'}
            </button>
            <button onClick={() => setIsChangingPassword(!isChangingPassword)}>
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
            <button onClick={handleLoggingOut}>Log Out</button>
            <button onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
      <div className='content-viewing'>
        {currentView === 'create&view' && <PostCreationAndViewing />}
        {currentView === 'pendingPosts' && <PendingPosts />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'notifications' && <Notifications />}
        {currentView === 'likes' && <Likes />}
        {currentView === 'searchedUserProfile' && searchedUser && (
          <div className="searched-user-profile">
            <div className="profile-header">
              <img src={searchedUser.profilePic} alt={`${searchedUser.username}-pic`} className="profile-image" />
              <div className="profile-info">
                <h2>{searchedUser.username}</h2>
                <p>Joined: {new Date(searchedUser.joinedDate).toLocaleDateString()}</p>
                <div className="profile-stats">
                  <div>
                    <div className="stat-value">{searchedUser.following ? searchedUser.following.length : 0}</div>
                    <div className="stat-title">Following</div>
                  </div>
                  <div>
                    <div className="stat-value">{searchedUser.followers ? searchedUser.followers.length : 0}</div>
                    <div className="stat-title">Followers</div>
                  </div>
                  <div>
                    <div className="stat-value">{searchedUser.posts ? searchedUser.posts.length : 0}</div>
                    <div className="stat-title">Posts</div>
                  </div>
                </div>
                  { isFollowing ? (
                    <button className="follow-button unfollow" onClick={unfollowUser}>Unfollow</button>
                  ) : (
                    <button className="follow-button follow" onClick={followUser}>Follow</button>
                  )}
              </div>
            </div>
            <div className="posts-section">
              <h3>Posts</h3>
              <ul>
                {posts.map(post => (
                  <li key={post._id}>
                    <div className="post-header">
                      <span className="dish-name">{post.dishName}</span>
                      <span className="post-date">{new Date(post.datePosted).toLocaleDateString()}</span>
                    </div>
                    <div className="post-content">{post.ingredients}</div>
                    {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
                    <div className="post-footer">
                    <button onClick={() => likedPosts.has(post._id) ? handleUnlike(post._id) : handleLike(post._id)} className="like-button">
                          ❤️ {post.hearts ? post.hearts.length : 0}
                        </button>
                      <span onClick={handleComment} className="comments">{post.comments ? post.comments.length : 0} 💬</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {isChangingUsername && (
          <div className="popup-overlay" onClick={() => setIsChangingUsername(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Username</h2>
              <form className="username-change-form" onSubmit={handleUsernameChange}>
                <input
                  type="text"
                  placeholder="Current username"
                  value={oldUsername}
                  onChange={(e) => setOldUsername(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
                <button type="submit">Update Username</button>
              </form>
            </div>
          </div>
        )}
        {isChangingPassword && (
          <div className="popup-overlay" onClick={() => setIsChangingPassword(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h2>Change Password</h2>
              <form className="password-change-form" onSubmit={handlePasswordChange}>
                <input
                  type="password"
                  placeholder="Current password"
                  name='currentPassword'
                  onChange={handleFieldChange}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  name='newPassword'
                  onChange={handleFieldChange}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  name='newPasswordConfirmation'
                  onChange={handleFieldChange}
                  required
                />
                <button type="submit">Change Password</button>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className="recommendations-and-search">
        <div className="search">
          <input
            type="text"
            placeholder="Search for accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
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