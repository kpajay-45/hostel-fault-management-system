import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import styles from '../styles/ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await authService.forgotPassword(email);
      setMessage('Please check your email for a reset password link.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.container}>
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Send Reset Link
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;