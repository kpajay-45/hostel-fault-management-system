import React, { useState } from 'react';
import authService from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    room_number: '',
  });
  const [message, setMessage] = useState('');

  const { name, email, password, room_number } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await authService.register(name, email, password, room_number);
      setMessage(response.data.message);
    } catch (error) {
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(errorMessage);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required />
        </div>
        <div>
          <input type="email" placeholder="Email" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
        </div>
        <div>
          <input type="text" placeholder="Room Number (Optional)" name="room_number" value={room_number} onChange={onChange} />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;