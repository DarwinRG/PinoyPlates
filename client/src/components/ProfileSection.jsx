import './profile.css'
import { useUserData } from '../../hooks/useUserData'
import { useState } from 'react'
import api from '../../utils/api'

export const ProfileSection = ({ showProfileSection, setShowProfileSection }) => {
  const { user } = useUserData()
  const [ isUploading, setIsUploading ] = useState(false)
  const [ base64Image, setBase64Image ] = useState('')

  const handleSubmission = async (e) => {
    e.preventDefault()

    try {
      const response = await api.post(`user/upload-user-pic/${user.username}`, {
        base64Image: base64Image
      })

      if (response.status === 200) {
        alert('Profile picture changed succesfully. Refresh the page to see changes')
        setIsUploading(false)
      }
    } catch (err) {
      alert(err.response.data.error)
      console.error("Error uploading profile picture:", err)
    }
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


  return (
    <> 
      {!showProfileSection ? (
      <div
        className='user-icon'
        onClick={() => setShowProfileSection(true)}
      >
        <img className="user-icon"src={ user.profilePic ? user.profilePic : "/pfp.avif?url"} alt="user pfp" />
      </div>
      ) : (
      <div className="profile-section">
        <div className="user-details">
          <img
            src={ user?.profilePic || "/pfp.avif?url"}
            alt="user's profile picture"
            className="user-pic" 
          />
          {isUploading ? (
            <form className="upload-pic-form" onSubmit={handleSubmission}>
              <input
                type="file"
                accept=".jpeg, .jpg, .png"
                onChange={convertToBase64}
              />
              <div className="upload-btn-choices">
                <button type="submit">Upload</button>
                <button onClick={() => setIsUploading(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button
              className="change-pic-btn"
              onClick={() => setIsUploading(true)}
            >
              Change Profile Picture
            </button>
          )}
          <h2>{user.username}</h2>
        </div>
      </div>
      )}
    </>
 )
}