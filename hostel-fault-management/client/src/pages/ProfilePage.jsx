import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import Spinner from '../components/Spinner';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', roll_number: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMe();
        setProfile(res.data);
      } catch (error) {
        setMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await userService.updateProfile(profile.name, profile.roll_number);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className={styles.profileContainer}>
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Name</label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input type="email" name="email" value={profile.email} disabled />
        </div>
        <div className={styles.inputGroup}>
          <label>Roll Number</label>
          <input type="text" name="roll_number" value={profile.roll_number || ''} onChange={handleChange} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default ProfilePage;