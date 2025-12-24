import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Navbar.module.css';
import { FaUserCircle, FaSignOutAlt, FaBars, FaUserEdit } from 'react-icons/fa';

const Navbar = ({ user, onLogout, toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <button className={styles.sidebarToggle} onClick={toggleSidebar}><FaBars /></button>
        <div className={styles.navbarTitle}>Dashboard</div>
      </div>
      <div className={styles.profileContainer} onClick={() => setDropdownOpen(!dropdownOpen)}>
        <FaUserCircle className={styles.profileIcon} />
        {dropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <Link to="/profile" className={styles.dropdownItem}>
              <FaUserEdit className={styles.icon} />
              <span>My Profile</span>
            </Link>
            <button onClick={onLogout} className={styles.dropdownItem}>
              <FaSignOutAlt className={styles.icon} /> 
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;