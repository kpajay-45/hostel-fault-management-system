import './styles/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import authService from './services/authService';

// Pages & Components
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import ReportFaultPage from './pages/ReportFaultPage.jsx';
import FaultDetailsPage from './pages/FaultDetailsPage.jsx';
import MyFaultsPage from './pages/MyFaultsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check local storage for a user session when the app loads
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  // Avoid rendering anything until the user state is determined
  if (currentUser === undefined) {
    return null; // Or a full-page loader
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "18891710930-1iv673gd8khn3tkn1q3msu3rh0lniccr.apps.googleusercontent.com"}>
      <Router>
        <Routes>
          {/* Public routes that don't use the dashboard layout */}
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />

          {/* Protected routes that use the dashboard layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout user={currentUser?.user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            {/* Child routes of the layout */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage user={currentUser?.user} />} />
            <Route path="my-faults" element={<MyFaultsPage />} />
            <Route path="report-fault" element={<ReportFaultPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="fault/:id" element={<FaultDetailsPage />} />
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <AdminRoute>
                  <AnalyticsPage />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
