import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';
import { FaTachometerAlt, FaUsersCog, FaChartPie, FaWrench, FaClipboardList } from 'react-icons/fa';
import hostelLogo from '../../assets/hostel-logo.png';

const Sidebar = ({ userRole, isCollapsed }) => {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <img src={hostelLogo} alt="Logo" className={styles.logo} />
        {!isCollapsed && <span className={styles.headerTitle}>HFMS</span>}
      </div>
      <ul className={styles.navList}>
        {userRole !== 'student' && (
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>
              <FaTachometerAlt className={styles.icon} />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
        )}

        {userRole === 'admin' && (
          <>
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                <FaUsersCog className={styles.icon} />
                {!isCollapsed && <span>User Management</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                <FaChartPie className={styles.icon} />
                {!isCollapsed && <span>Analytics</span>}
              </NavLink>
            </li>
          </>
        )}

        {userRole === 'student' && (
          <>
            <li>
              <NavLink to="/report-fault" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                <FaWrench className={styles.icon} />
                {!isCollapsed && <span>Report a Fault</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-faults" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                <FaClipboardList className={styles.icon} />
                {!isCollapsed && <span>My Faults</span>}
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;