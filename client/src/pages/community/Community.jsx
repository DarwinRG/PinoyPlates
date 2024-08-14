import { useState } from 'react'
import usePrivateApi from '../../../hooks/usePrivateApi'
import { useUserData } from '../../../hooks/useUserData'
import { PostCreationAndViewing } from './community-pages/PostCreationAndViewing'
import { PendingPosts } from './community-pages/PendingPosts'
import { Profile } from './community-pages/Profile'
import { Notifications } from './community-pages/Notifications'
import { Likes } from './community-pages/Likes'
import './community.css'

const Community = () => {
  const [currentView, setCurrentView] = useState('create/view')
  const [searchedUser, setSearchedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isChangingUsername, setIsChangingUsername] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false) // State for password change popup
  const [oldUsername, setOldUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [passwordData, setPasswordData] = useState({})
  const userID = localStorage.getItem('userID')
  const userRole = localStorage.getItem('userRole')
  const { user, setUser } = useUserData() // Added setUser to update user data
  const privateAxios = usePrivateApi()

  const handleButtonClick = (view) => {
    setCurrentView(view)
    setIsChangingUsername(false)
    setIsChangingPassword(false) // Hide form when changing view
  }

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        const response = await privateAxios.get(`user/get-user-data/${searchQuery}`)
        setSearchedUser(response.data.currentUser)
        setCurrentView('searchedUserProfile')
        const following = user.following || []
        setIsFollowing(following.some(follow => follow._id === response.data.currentUser._id))
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await privateAxios.post(`user/unfollow/${searchedUser._id}`)
        setIsFollowing(false)
      } else {
        await privateAxios.post(`user/follow/${searchedUser._id}`)
        setIsFollowing(true)
      }
      const response = await privateAxios.get(`user/get-user-data/${user._id}`)
      setUser(response.data)
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
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
            <button onClick={() => handleButtonClick('create/view')}>Community</button>
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
          </div>
        </div>
      </div>
      <div className='content-viewing'>
        {currentView === 'create/view' && <PostCreationAndViewing />}
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
                <button className="follow-button" onClick={handleFollow}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </div>
            <div className="posts-section">
              <h3>Posts</h3>
              <ul>
                {searchedUser.posts.map(post => (
                  <li key={post._id}>
                    <div className="post-header">
                      <span className="dish-name">{post.dishName}</span>
                      <span className="post-date">{new Date(post.datePosted).toLocaleDateString()}</span>
                    </div>
                    <div className="post-content">{post.ingredients}</div>
                    {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
                    <div className="post-footer">
                      <span className="likes">{post.likes ? post.likes.length : 0} ❤️</span>
                      <span className="comments">{post.comments ? post.comments.length : 0} 💬</span>
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
