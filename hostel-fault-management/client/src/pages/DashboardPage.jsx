import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import Spinner from '../components/Spinner';

const DashboardPage = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'student') {
      navigate('/report-fault', { replace: true });
    }
  }, [user, navigate]);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        // This will be shown for students before redirecting, or if role is undefined
        return <Spinner />;
    }
  };

  return <div>{renderDashboard()}</div>;
};

export default DashboardPage;