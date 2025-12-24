import React, { useState, useEffect, useMemo } from 'react';
import faultService from '../services/faultService';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Spinner from './Spinner';

const AdminDashboard = () => {
  const [allFaults, setAllFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faultsRes = await faultService.getAllFaults();
        setAllFaults(faultsRes.data);
      } catch (error) {
        setMessage('Could not fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('new_fault', (newFault) => {
      // Add the new fault to the top of the list for immediate visibility
      setAllFaults(currentFaults => [newFault, ...currentFaults]);
    });

    socket.on('fault_updated', (updatedFault) => {
      // Find and replace the updated fault to reflect changes in status, assignment, etc.
      setAllFaults(currentFaults =>
        currentFaults.map(fault =>
          fault.id === updatedFault.id ? updatedFault : fault
        )
      );
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredFaults = useMemo(() => {
    return allFaults
      .filter(fault => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Pending') return fault.status === 'Submitted' || fault.status === 'In Progress';
        return fault.status === statusFilter;
      })
      .filter(fault => {
        const search = searchTerm.toLowerCase();
        return (
          String(fault.id).includes(search) ||
          fault.reporter_name.toLowerCase().includes(search) ||
          fault.description.toLowerCase().includes(search) ||
          fault.location.toLowerCase().includes(search)
        );
      });
  }, [allFaults, statusFilter, searchTerm]);

  const handleAutoAssign = async (faultId) => {
    try {
      await faultService.assignFault(faultId);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to auto-assign fault.');
    }
  };

  const summaryCounts = useMemo(() => ({
    total: allFaults.length,
    pending: allFaults.filter(f => f.status === 'Submitted' || f.status === 'In Progress').length,
    resolved: allFaults.filter(f => f.status === 'Resolved').length,
  }), [allFaults]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="summary-cards-container">
        <div className="summary-card">
          <h4>Total Faults</h4>
          <p>{summaryCounts.total}</p>
        </div>
        <div className="summary-card">
          <h4>Pending</h4>
          <p>{summaryCounts.pending}</p>
        </div>
        <div className="summary-card">
          <h4>Resolved</h4>
          <p>{summaryCounts.resolved}</p>
        </div>
      </div>

      <div className="filter-container">
        <input type="text" placeholder="Search by ID, reporter, location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending">All Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {message && <p>{message}</p>}
      <div className="table-container">
        <table className="fault-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reporter</th>
              <th>Hostel</th>
              <th>Location</th>
              <th>Description</th>
              <th>Image</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaults.map((fault) => (
              <tr key={fault.id}>
                <td><Link to={`/fault/${fault.id}`}>#{fault.id}</Link></td>
                <td>{fault.reporter_name}</td>
                <td>{fault.hostel_name}</td>
                <td>{fault.location}</td>
                <td>{fault.description}</td>
                <td>{fault.image_url && <a href={`http://localhost:5000${fault.image_url}`} target="_blank" rel="noopener noreferrer">View</a>}</td>
                <td>{fault.category}</td>
                <td><span className={`status status-${fault.status.toLowerCase().replace(' ', '-')}`}>{fault.status}</span></td>
                <td><span className={`priority priority-${fault.priority.toLowerCase()}`}>{fault.priority}</span></td>
                <td>
                  {fault.status === 'Submitted' && (
                    <button onClick={() => handleAutoAssign(fault.id)}>Auto-Assign</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;