import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import api from "../../../utils/api"
  
export const Register = () => {
  const [ registrationData, setRegistrationData ] = useState({})
  const navigate = useNavigate()

  const handleRegistration = async () => {
    try {
      console.log("Registration data:", registrationData)
      
      const response = await api.post('auth/register',  { 
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        passwordConfirmation: registrationData.confirmPassword 
      })

      console.log('API fetching done', response);

      if (response.status === 201) {
        alert(response.data.msg)
        navigate(`/verify-email/${registrationData.email}`)
      }
    } catch (err) {
      console.error('Error:', err)
      if (err.response && err.response.data) {
        alert(err.response.data.error)
      } else {
        alert('An error occurred. Please try again.')
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
  
    setRegistrationData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // handleSubmission()
    }
  }

  return (
    <>
      <div className="login-form">
        <h1>Register</h1>
        <form>
          <label>Username:</label>
          <input
            className="username-input"
            type='text'
            name='username'
            placeholder='Username'
            onChange={handleFieldChange}
          />
          <label>Email:</label>
          <input
            className="email-input"
            type='text'
            name='email'
            placeholder='yourname@gmail.com'
            onChange={handleFieldChange}
          />
          <label>Password:</label>
          <input
            className="password-input"
            type='password'
            name='password'
            placeholder='Password'
            onChange={handleFieldChange}
          />
          <label>Confirm Password:</label>
          <input
            className="password-input"
            type='password'
            name='confirmPassword'
            placeholder='Confirm Password'
            onChange={handleFieldChange}
          />
        </form>
      </div>
      <a>Forgot password?</a>
      <button className="login-btn" onClick={handleRegistration}>Register</button>
    </>
  )
}