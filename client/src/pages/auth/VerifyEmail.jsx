import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../utils/api'
import './verify-email.css'

const VerifyEmail = () => {
  const [ verificationCode, setVerificationCode ] = useState({})
  const navigate = useNavigate()
  const { email } = useParams()

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    try {
      formattedValue = JSON.parse(value)
    } catch (error) {
      // Ignore parsing errors
    }
  
    setVerificationCode((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }))
  }

  const handleSubmission = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('auth/verify-email', { email, verificationCode: verificationCode.verificationCode  })

      console.log(response)
      if (response.status === 200) {
        alert(response.data.msg)
        navigate('/auth')
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

  return (
    <div className="verify-email-container">
      <h2>Enter your verification code</h2>
      <form>
        <input
          type="text"
          name="verificationCode"
          onChange={handleFieldChange}
          placeholder="Verification Code"
          required
        />
        <button type="button" onClick={handleSubmission}>Verify</button>
      </form>
    </div>
  )
}

export default VerifyEmail
