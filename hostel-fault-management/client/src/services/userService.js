import axios from 'axios';

const API_URL = '/api/users/';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? { Authorization: 'Bearer ' + user.token } : {};
};

const getEmployees = () => axios.get(API_URL + 'employees', { headers: getAuthHeader() });
const getAllUsers = () => axios.get(API_URL + 'all', { headers: getAuthHeader() });
const updateUserRole = (userId, role) => axios.put(API_URL + `${userId}/role`, { role }, { headers: getAuthHeader() });
const deleteUser = (userId) => axios.delete(API_URL + userId, { headers: getAuthHeader() });

const getMe = () => {
  return axios.get(API_URL + 'me', { headers: getAuthHeader() });
};

const updateProfile = (name, roll_number) => {
  return axios.put(API_URL + 'me', { name, roll_number }, { headers: getAuthHeader() });
};

const userService = {
  getEmployees,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getMe,
  updateProfile,
};

export default userService;