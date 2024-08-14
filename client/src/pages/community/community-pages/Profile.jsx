import { useState } from 'react';
import { useUserData } from '../../../../hooks/useUserData';
import './Profile.css';

export const Profile = () => {
  const { user } = useUserData();
  const [visibleComments, setVisibleComments] = useState({});

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  const toggleComments = (postId) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.profilePic} alt={`${user.username}'s profile`} className="profile-avatar" />
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-date-joined">Joined: {new Date(user.joinedDate).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-title">Following:</span>
          <span className="stat-value">{user.following ? user.following.length : 0}</span>
        </div>
        <div className="profile-stat">
          <span className="stat-title">Followers:</span>
          <span className="stat-value">{user.followers ? user.followers.length : 0}</span>
        </div>
        <div className="profile-stat">
          <span className="stat-title">Posts:</span>
          <span className="stat-value">{user.posts ? user.posts.length : 0}</span>
        </div>
      </div>
      <div className="profile-posts">
        {user.posts && user.posts.length > 0 ? (
          user.posts.map(post => (
            <div key={post._id} className="profile-post">
              <div className="post-header">
                <span className="post-title">{post.dishName}</span>
                <span className="post-date">{new Date(post.datePosted).toLocaleDateString()}</span>
              </div>
              <p className="post-ingredients">{post.ingredients}</p>
              {post.dishImage && <img src={post.dishImage} alt={post.dishName} className="post-image" />}
              <div className="post-footer">
                <span className="post-likes">{post.hearts ? post.hearts.length : 0} ❤️</span>
                <button onClick={() => toggleComments(post._id)} className="comments-toggle-button">
                  {visibleComments[post._id] ? 'Hide Comments' : 'Show Comments'}
                </button>
                {visibleComments[post._id] && (
                  <div className="comments-list">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map(comment => (
                        <div key={comment._id} className="comment">
                          <img 
                            src={comment.user.profilePic} 
                            alt={`${comment.user.username}'s pic`} 
                            className="comment-profile-pic" 
                          />
                          <div className="comment-text">
                            <strong>{comment.user.username}</strong>: {comment.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No comments yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-posts">No posts available.</p>
        )}
      </div>
    </div>
  )
}
