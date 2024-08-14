import { useState, useEffect } from 'react'
import { useUserData } from '../../../../hooks/useUserData'
import './Likes.css'

export const Likes = () => {
  const { user } = useUserData()
  const [likedPosts, setLikedPosts] = useState([])

  useEffect(() => {
    if (user && user.likes) {
      setLikedPosts(user.likes)
    }
  }, [user])

  return (
    <div className="likes-container">
      <div className="likes-header">
        <h2>Liked Posts</h2>
      </div>
      <div className="likes-list">
        {likedPosts.length > 0 ? (
          likedPosts.map(post => (
            <div key={post._id} className="liked-post">
              <img src={post.dishImage || '/default-image.png'} alt={post.dishName} className="liked-post-image" />
              <div className="liked-post-info">
                <h3>{post.dishName}</h3>
                <p>{post.ingredients}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No liked posts.</p>
        )}
      </div>
    </div>
  )
}
