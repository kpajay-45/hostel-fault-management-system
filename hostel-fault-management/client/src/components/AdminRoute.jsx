import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const data = JSON.parse(localStorage.getItem('user'));

  // If no user data or token, redirect to login
  if (!data || !data.token) {
    return <Navigate to="/login" />;
  }

  // If user is not an admin, redirect them to their own dashboard
  if (data.user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;