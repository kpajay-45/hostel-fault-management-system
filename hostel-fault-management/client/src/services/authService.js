import axios from 'axios';

const API_URL = '/api/auth/';

const register = (name, email, password, room_number) => {
  return axios.post(API_URL + 'register', { name, email, password, room_number });
};

const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

const logout = () => {
  localStorage.removeItem('user');
};

const googleLogin = async (credential) => {
  const response = await axios.post(API_URL + 'google', { credential });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

const forgotPassword = (email) => {
  return axios.post(API_URL + 'forgot-password', { email });
};

const resetPassword = (token, password) => {
  return axios.put(API_URL + `reset-password/${token}`, { password });
};

const authService = {
  register, login, logout, googleLogin, forgotPassword, resetPassword
};

export default authService;