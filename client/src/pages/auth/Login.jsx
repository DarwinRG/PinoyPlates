import { useState } from "react"
import api from "../../../utils/api"
import { useNavigate } from 'react-router-dom'

export const Login = () => {
  const [ loginData, setLoginData ] = useState({})
  const navigate = useNavigate()

  const handleLogin = async() => {
    try {
      const response = await api.post('auth/login', { email: loginData.email, password: loginData.password})

      if (response.status === 200) {
        alert(response.data.msg)
        navigate('/')
      }
    } catch(err) {
      if (err.response && err.response.data.error === 'Please verify your email first') {
        alert(err.response.data.error)
        navigate(`/verify/${formDatas.email}`)
      } else {
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
  
    setLoginData((prevData) => ({
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
        <h1>Login</h1>
        <form>
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
            onKeyPress={handleKeyPress} // event listener :) 
          />
        </form>
      </div>
      <a>Forgot password?</a>
      <button className="login-btn" onClick={handleLogin}>Login</button>
    </>
  )
}