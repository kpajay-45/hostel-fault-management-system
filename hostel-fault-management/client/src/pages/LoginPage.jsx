import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import styles from '../styles/LoginPage.module.css';
import hostelLogo from '../assets/hostel-logo.png';

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await authService.login(email, password);
      onLoginSuccess(response.data);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage('');
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      onLoginSuccess(response.data);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        'Google login failed. Please try again.';
      setMessage(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setMessage('Google Login was unsuccessful. Please try again later.');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.imagePanel}>
          <img src={hostelLogo} alt="Hostel Logo" />
        </div>
        <div className={styles.formPanel}>
          <h2>Login</h2>
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="Enter your email" name="email" value={email} onChange={onChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Enter your password" name="password" value={password} onChange={onChange} required />
            </div>
            <button type="submit" className={styles.submitButton}>Login</button>
          </form>
          {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
          
          <div className={styles.divider}>OR</div>

          <div className={styles.googleButtonContainer}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;