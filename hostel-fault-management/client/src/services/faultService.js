import axios from 'axios';

const API_URL = '/api/faults/';

// Helper function to get the auth token from localStorage
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const createFault = (faultData) => {
  const formData = new FormData();
  formData.append('hostel_name', faultData.hostel_name);
  formData.append('floor', faultData.floor);
  formData.append('location', faultData.location);
  formData.append('description', faultData.description);
  if (faultData.image) {
    formData.append('image', faultData.image);
  }

  // When sending FormData, axios sets the correct multipart header automatically
  return axios.post(API_URL, formData, { headers: getAuthHeader() });
};

const getMyFaults = () => {
  return axios.get(API_URL + 'my-faults', { headers: getAuthHeader() });
};

const getAllFaults = () => {
  return axios.get(API_URL + 'all', { headers: getAuthHeader() });
};

const getAssignedFaults = () => {
  return axios.get(API_URL + 'assigned', { headers: getAuthHeader() });
};

const assignFault = (faultId) => {
  return axios.put(API_URL + `${faultId}/assign`, {}, { headers: getAuthHeader() });
};

const updateFaultStatus = (faultId, status) => {
  return axios.put(API_URL + `${faultId}/status`, { status }, { headers: getAuthHeader() });
};

const getFaultStats = () => {
  return axios.get(API_URL + 'stats', { headers: getAuthHeader() });
};

const getFaultById = (faultId) => {
  return axios.get(API_URL + faultId, { headers: getAuthHeader() });
};

const getComments = (faultId) => {
  return axios.get(API_URL + `${faultId}/comments`, { headers: getAuthHeader() });
};

const addComment = (faultId, comment) => {
  return axios.post(API_URL + `${faultId}/comments`, { comment }, { headers: getAuthHeader() });
};

const faultService = {
  createFault,
  getMyFaults,
  getAllFaults,
  getAssignedFaults,
  assignFault,
  updateFaultStatus,
  getFaultStats,
  getFaultById,
  getComments,
  addComment,
};

export default faultService;