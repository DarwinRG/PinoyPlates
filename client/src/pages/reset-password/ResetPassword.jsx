// src/components/ResetPassword.js

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../utils/api'
import './reset-password.css'

const ResetPassword = () => {
  const { resetToken } = useParams() // Get the token from the URL parameters
  const [ passwordData, setPasswordData ] = useState({})
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!resetToken) {
      setMessage('Invalid or missing reset token.')
      setIsSuccess(false)
    }
  }, [resetToken])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.newPasswordConfirmation) {
      setMessage('Passwords do not match.')
      setIsSuccess(false)
      return
    }
    try {
      const response = await api.put(`auth/reset-password/${resetToken}`, {
        newPassword: passwordData.newPassword,
        newPasswordConfirmation: passwordData.newPasswordConfirmation
      })
      if (response.status === 200) {
        setMessage('Password successfully reset. You can now log in.')
        setIsSuccess(true)
        setTimeout(() => navigate('/auth'), 2000) // Redirect to login page after a short delay
      } else {
        setMessage('Error occurred. Please try again.')
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage('Error occurred. Please try again.')
      setIsSuccess(false)
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


  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword} className="reset-password-form">
        <input
          type="password"
          placeholder="New Password"
          name='newPassword'
          onChange={handleFieldChange}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name='newPasswordConfirmation'
          onChange={handleFieldChange}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && (
        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default ResetPassword
