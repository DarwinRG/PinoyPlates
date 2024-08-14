// src/components/ForgotPassword.js

import { useState } from 'react'
import usePrivateApi from '../../../hooks/usePrivateApi'
import './forgot-password.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const privateAxios = usePrivateApi()

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      const response = await privateAxios.post('auth/forgot-password', { email })
      if (response.status === 200) {
        setMessage(response.data.msg)
        setIsSuccess(true)
      } else {
        setMessage('Error occurred. Please try again.')
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage('Error occurred. Please try again.')
      setIsSuccess(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword} className="forgot-password-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {message && (
        <div className={`message ${isSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
