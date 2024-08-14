import { useUserData } from '../../../../hooks/useUserData'
import './Notifications.css'

export const Notifications = () => {
  const { user } = useUserData()

  if (!user) {
    return <div className="notifications-loading">Loading...</div>
  }

  // Sort notifications by createdAt date in descending order
  const sortedNotifications = (user.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
      </div>
      <div className="notifications-list">
        {sortedNotifications.length > 0 ? (
          sortedNotifications.map(notification => (
            <div key={notification._id} className={`notification ${notification.isRead ? '' : 'unread'}`}>
              <div className="notification-icon">
                {notification.userId && notification.userId.profilePic && (
                  <img src={notification.userId.profilePic} alt={`${notification.userId.username}'s profile`} className="notification-profile-pic" />
                )}
              </div>
              <div className="notification-message">
                <p>{notification.message}</p>
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications available.</p>
        )}
      </div>
    </div>
  )
}
