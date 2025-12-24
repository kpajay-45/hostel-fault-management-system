import React, { useState, useEffect } from 'react';
import faultService from '../services/faultService';
import Spinner from '../components/Spinner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await faultService.getFaultStats();
        setStats(response.data);
      } catch (error) {
        setMessage('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;
  if (message) return <p>{message}</p>;

  const statusChartData = {
    labels: stats.statusCounts.map(s => s.status),
    datasets: [
      {
        label: '# of Faults',
        data: stats.statusCounts.map(s => s.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // In Progress
          'rgba(75, 192, 192, 0.6)', // Resolved
          'rgba(255, 99, 132, 0.6)',  // Submitted
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: stats.priorityCounts.map(p => p.priority),
    datasets: [
      {
        label: 'Faults by Priority',
        data: stats.priorityCounts.map(p => p.count),
        backgroundColor: [
            'rgba(255, 99, 132, 0.6)', // High
            'rgba(255, 206, 86, 0.6)', // Medium
            'rgba(75, 192, 192, 0.6)', // Low
        ],
      },
    ],
  };

  const categoryChartData = {
    labels: stats.categoryCounts.map(c => c.category),
    datasets: [
      {
        label: 'Faults by Category',
        data: stats.categoryCounts.map(c => c.count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>System Analytics</h2>
      <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        <div className="chart-card" style={{ flex: '1 1 400px', minWidth: '300px' }}>
          <h3>Faults by Category</h3>
          <Bar 
            data={categoryChartData} 
            options={{ indexAxis: 'y', responsive: true }} // 'y' for horizontal bar chart
          />
        </div>
        <div className="chart-card" style={{ flex: '1 1 300px', maxWidth: '400px', minWidth: '300px' }}>
          <h3>Faults by Status</h3>
          <Pie data={statusChartData} />
        </div>
        <div className="chart-card" style={{ flex: '1 1 100%' }}>
          <h3>Faults by Priority</h3>
          <Bar 
            data={priorityChartData} 
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;