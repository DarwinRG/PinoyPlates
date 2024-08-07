import { useState } from 'react'
import { Login } from './Login'
import { Register } from './Register'
import './auth.css'

const Authentication = () => {
  const [ isRegistering, setIsRegistering ] = useState(false)

  const toggleIsRegistering = () => {
    setIsRegistering((prev) => !prev)
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        { !isRegistering ? <Login /> : <Register /> }
        <button className="login-btn" onClick={toggleIsRegistering}>
          { !isRegistering ? 'Create an account' : 'Go back to Login' }
        </button>
      </div>
      <div className="auth-bg">
        <img className="auth-image" src="auth-bg.jpg" alt="auth-image"/>
      </div>
    </div>
  )
}

export default Authentication