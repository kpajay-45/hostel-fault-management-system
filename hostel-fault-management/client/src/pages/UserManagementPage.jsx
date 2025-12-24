import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import Spinner from '../components/Spinner';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      // Refresh the user list to show the change
      fetchUsers();
    } catch (error) {
      alert('Failed to update user role.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>User Management</h2>
      {message && <p>{message}</p>}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            <th>Roll/Room No.</th>
              <th>Role</th>
            <th>Total Assigned</th>
            <th>Resolved</th>
            <th>Pending</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              <td>{user.room_number || user.roll_number || 'N/A'}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                    <option value="student">Student</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              <td>{user.role === 'employee' ? user.total_assigned : 'N/A'}</td>
              <td>{user.role === 'employee' ? user.resolved_count : 'N/A'}</td>
              <td>{user.role === 'employee' ? user.pending_count : 'N/A'}</td>
                <td><button onClick={() => handleDelete(user.id)} style={{backgroundColor: '#dc3545'}}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;