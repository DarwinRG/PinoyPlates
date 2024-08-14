import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

export const Register = () => {
  const [registrationData, setRegistrationData] = useState({});
  const navigate = useNavigate();

  const handleRegistration = async () => {
    try {
      const response = await api.post('auth/register', {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        passwordConfirmation: registrationData.confirmPassword
      });

      if (response.status === 201) {
        alert(response.data.msg);
        navigate(`/verify-email/${registrationData.email}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred.');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form className="flip-card__form">
      <input
        className="flip-card__input"
        type='text'
        name='username'
        placeholder='Name'
        onChange={handleFieldChange}
      />
      <input
        className="flip-card__input"
        type='email'
        name='email'
        placeholder='Email'
        onChange={handleFieldChange}
      />
      <input
        className="flip-card__input"
        type='password'
        name='password'
        placeholder='Password'
        onChange={handleFieldChange}
      />
      <input
        className="flip-card__input"
        type='password'
        name='confirmPassword'
        placeholder='Confirm Password'
        onChange={handleFieldChange}
      />
      <button className="flip-card__btn" type="button" onClick={handleRegistration}>Register</button>
    </form>
  );
};
