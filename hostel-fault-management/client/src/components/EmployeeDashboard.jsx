import React, { useState, useEffect } from 'react';
import faultService from '../services/faultService';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Spinner from './Spinner';

const EmployeeDashboard = () => {
  const [assignedFaults, setAssignedFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchAssignedFaults = async () => {
    try {
      const res = await faultService.getAssignedFaults();
      setAssignedFaults(res.data);
    } catch (error) {
      setMessage('Could not fetch assigned faults.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedFaults();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myId = currentUser?.user?.id;

    socket.on('fault_updated', (updatedFault) => {
      if (!myId) return;

      setAssignedFaults(currentFaults => {
        const faultExists = currentFaults.some(f => f.id === updatedFault.id);

        // If the fault is now assigned to me
        if (updatedFault.assigned_to_id === myId) {
          return faultExists
            ? currentFaults.map(f => f.id === updatedFault.id ? updatedFault : f) // Update existing
            : [updatedFault, ...currentFaults]; // Add new assignment
        } else {
          // If it's not assigned to me, remove it from my list
          return currentFaults.filter(f => f.id !== updatedFault.id);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusUpdate = async (faultId, newStatus) => {
    try {
      await faultService.updateFaultStatus(faultId, newStatus);
      // No need to manually refetch, the 'fault_updated' socket event will handle the UI update.
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h3>My Assigned Tasks</h3>
      {message && <p>{message}</p>}
      {assignedFaults.length > 0 ? (assignedFaults.map((fault) => (
        <div key={fault.id} className={`fault-card priority-${fault.priority ? fault.priority.toLowerCase() : 'low'}`} >
          <p><strong>Reporter:</strong> {fault.reporter_name} ({fault.reporter_room})</p>
          <p><strong>Hostel:</strong> {fault.hostel_name} - <strong>Floor:</strong> {fault.floor}</p>
          <p><strong>Location:</strong> {fault.location}</p>
          <p><strong>Description:</strong> {fault.description}</p>
          <p><strong>Category:</strong> {fault.category}</p>
          {fault.image_url && <p><strong>Image:</strong> <a href={`http://localhost:5000${fault.image_url}`} target="_blank" rel="noopener noreferrer">View Image</a></p>}
          <p><strong>Status:</strong> <span className={`status status-${fault.status.toLowerCase().replace(' ', '-')}`}>{fault.status}</span></p>
          <p><strong>Priority:</strong> <span className={`priority priority-${fault.priority.toLowerCase()}`}>{fault.priority}</span></p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <Link to={`/fault/${fault.id}`} className="button-link">View Details & Comments</Link>
            {fault.status === 'In Progress' && <button onClick={() => handleStatusUpdate(fault.id, 'Resolved')}>Mark as Resolved</button>}
          </div>
        </div>
      ))) : <p>You have no tasks assigned to you.</p>}
    </div>
  );
};

export default EmployeeDashboard;