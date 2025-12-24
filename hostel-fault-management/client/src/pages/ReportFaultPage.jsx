import React, { useState } from 'react';
import faultService from '../services/faultService';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ReportFaultPage.module.css';

const ReportFaultPage = () => {
  const [formData, setFormData] = useState({
    hostel_name: '',
    floor: '',
    location: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { hostel_name, floor, location, description } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onFileChange = (e) => setImage(e.target.files[0]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await faultService.createFault({ ...formData, image });
      setMessage('Fault submitted successfully! Redirecting...');
      setTimeout(() => navigate('/my-faults'), 2000);
    } catch (error) {
      setMessage((error.response?.data?.message) || 'An error occurred.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Report a New Fault</h2>
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="hostel_name">Hostel Name</label>
            <input id="hostel_name" type="text" name="hostel_name" value={hostel_name} onChange={onChange} placeholder="e.g., Emerald Hostel" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="floor">Floor</label>
            <input id="floor" type="text" name="floor" value={floor} onChange={onChange} placeholder="e.g., 2nd Floor" required />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="location">Specific Location / Room Number</label>
          <input id="location" type="text" name="location" value={location} onChange={onChange} placeholder="e.g., Room 204, near staircase" required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="description">Description of Issue</label>
          <textarea id="description" name="description" value={description} onChange={onChange} placeholder="Describe the issue in detail..." required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="image">Upload Image (Optional)</label>
          <input id="image" type="file" name="image" onChange={onFileChange} accept="image/*" />
        </div>
        <button type="submit">Submit Report</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default ReportFaultPage;