import React from 'react'
import './not-found.css'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404 - Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to="/" className="back-to-home-link">Go back to Home</Link>
      </div>
    </div>
  )
}

export default NotFound
