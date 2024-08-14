import { useState } from 'react'
import { Login } from './Login'
import { Register } from './Register'
import './auth.css'

const Authentication = () => {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <div className="wrapper">
      <div className="switch">
        <div
          className={`switch-status ${isRegistering ? 'active' : ''}`}
          onClick={() => setIsRegistering(false)}
        >
          Log In
        </div>
        <div
          className={`switch-status ${isRegistering ? '' : 'active'}`}
          onClick={() => setIsRegistering(true)}
        >
          Sign Up
        </div>
        <div className={`slider ${isRegistering ? 'right' : ''}`}></div>
      </div>
      <div className="flip-card__inner" style={{ transform: isRegistering ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div className="flip-card__front">
          <div className="title">Log In</div>
          <Login />
        </div>
        <div className="flip-card__back">
          <div className="title">Sign Up</div>
          <Register />
        </div>
      </div>
    </div>
  )
}

export default Authentication
