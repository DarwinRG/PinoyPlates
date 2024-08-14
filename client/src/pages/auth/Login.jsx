import { useState } from 'react';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

export const Login = () => {
  const [loginData, setLoginData] = useState({});
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await api.post('auth/login', { email: loginData.email, password: loginData.password }, { withCredentials: true });

      if (response.status === 200) {
        const { userID, userRole, accessToken } = response.data;
        setAuth({ accessToken });

        localStorage.setItem('userID', userID);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('username', response.data.username);
        alert(response.data.msg);
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'An error occurred.');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form className="flip-card__form">
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
      <button className="flip-card__btn" type="button" onClick={handleLogin}>Log In</button>
      <a href="/forgot-password" className="forgot-password">Forgot password?</a>
    </form>
  );
};
