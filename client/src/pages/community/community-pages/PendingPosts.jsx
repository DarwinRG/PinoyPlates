import { useState, useEffect} from 'react'
import usePrivateApi from '../../../../hooks/usePrivateApi'

export const PendingPosts = () => {
  const [pendingPosts, setPendingPosts] = useState({})
  const privateAxios = usePrivateApi()

  useEffect(() => {
    fetchPendingPosts()
  }, [])

  const fetchPendingPosts = async () => {
    try {
      const response = await privateAxios.get('posts/pending-posts', { params: { page: 1, limit: 10 } }, { withCredentials: true })

      console.log(response.data)
      if (response.status === 200)
      setPendingPosts(response.data.pendingPosts)
    } catch (err) {
      alert(err.response.error)
    }
  }

  const approvePendingPost = async (postID) => {
    try {
      const response = await privateAxios.put(`posts/accept-post/${postID}`, { withCredentials: true })

      if (response.status === 200) {
        alert(response.data.msg)
        setPendingPosts(prevPosts => prevPosts.filter(post => post._id !== postID))
      }
    } catch (err) {
      alert(err.response.data.error)
    }
  }

  const rejectPendingPost = async (postID) => {
    try {
      const response = await privateAxios.put(`posts/reject-post/${postID}`, { withCredentials: true })

      if (response.status === 200) {
        alert(response.data.msg)
        setPendingPosts(prevPosts => prevPosts.filter(post => post._id !== postID))
      }
    } catch (err) {
      alert(err.response.data.error)
    }
  }

  return (
    <div className="pending-posts-view">
      <h2>Pending Posts</h2>
      {Object.keys(pendingPosts).length > 0 ? (
        Object.keys(pendingPosts).map(postId => {
          const post = pendingPosts[postId];
          return (
            <div key={post._id} className="pending-post">
              <div className="pending-post-header">
                <img src={post.postOwner.profilePic} alt={post.postOwner.username} className="pending-post-user-profile-pic" />
                <div className="pending-post-user-info">
                  <h3>{post.postOwner.username}</h3>
                  <p>{new Date(post.datePosted).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="pending-post-content">
                <h4>Dish Name: {post.dishName}</h4>
                <p>Ingredients: {post.ingredients}</p>
                {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="pending-post-image" />}
              </div>
              <div className="pending-post-actions">
                <button className="approve-button" onClick={() => approvePendingPost(post._id)}>Approve</button>
                <button className="reject-button" onClick={() => rejectPendingPost(post._id)}>Reject</button>
              </div>
            </div>
          )
        })
      ) : (
        <p>No pending posts at the moment.</p>
      )}
    </div>
  )
}

