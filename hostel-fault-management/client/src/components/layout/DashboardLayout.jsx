import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from '../../styles/DashboardLayout.module.css';

const DashboardLayout = ({ user, onLogout }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return null; // Or a loading spinner, while user data is being fetched
  }

  return (
    <div className={styles.layout}>
      <Sidebar userRole={user.role} isCollapsed={isSidebarCollapsed} />
      <div className={`${styles.main} ${isSidebarCollapsed ? styles.mainCollapsed : ''}`}>
        <Navbar user={user} onLogout={onLogout} toggleSidebar={toggleSidebar} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;