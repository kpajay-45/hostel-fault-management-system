import React, { useState, useEffect } from 'react';
import faultService from '../services/faultService';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Spinner from '../components/Spinner';

const MyFaultsPage = () => {
  const [myFaults, setMyFaults] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaults = async () => {
      try {
        const response = await faultService.getMyFaults();
        setMyFaults(response.data);
      } catch (error) {
        setMessage('Could not fetch faults.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaults();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const myId = currentUser?.user?.id;

    socket.on('fault_updated', (updatedFault) => {
      if (!myId) return;

      // We only care about updates to our own faults
      if (updatedFault.user_id === myId) {
        setMyFaults(currentFaults =>
          currentFaults.map(fault =>
            fault.id === updatedFault.id ? updatedFault : fault
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>My Reported Faults</h2>
      {message && <p>{message}</p>}
      {loading ? <Spinner /> : (
        myFaults.length > 0 ? (myFaults.map((fault) => (
          <div key={fault.id} className={`fault-card priority-${fault.priority ? fault.priority.toLowerCase() : 'low'}`} >
            <p><strong>Hostel:</strong> {fault.hostel_name} - <strong>Floor:</strong> {fault.floor}</p>
            <p><strong>Location:</strong> {fault.location}</p>
            <p><strong>Description:</strong> {fault.description}</p>
            {fault.image_url && <p><strong>Image:</strong> <a href={`http://localhost:5000${fault.image_url}`} target="_blank" rel="noopener noreferrer">View Image</a></p>}
            <p><strong>Category:</strong> {fault.category}</p>
            <p><strong>Status:</strong> <span className={`status status-${fault.status.toLowerCase().replace(' ', '-')}`}>{fault.status}</span></p>
            <p><strong>Priority:</strong> <span className={`priority priority-${fault.priority.toLowerCase()}`}>{fault.priority}</span></p>
            <p><strong>Reported:</strong> {new Date(fault.created_at).toLocaleString()}</p>
            <Link to={`/fault/${fault.id}`} className="button-link" style={{ marginTop: '1rem', display: 'inline-block' }}>View Details & Comments</Link>
          </div>
        )))
        : <p>You have not reported any faults yet.</p>
      )}
    </div>
  );
};

export default MyFaultsPage;