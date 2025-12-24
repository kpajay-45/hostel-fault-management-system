import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import faultService from '../services/faultService';
import Spinner from '../components/Spinner';
import { io } from 'socket.io-client';
import styles from '../styles/FaultDetailsPage.module.css';

const FaultDetailsPage = () => {
  const { id } = useParams();
  const [fault, setFault] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const commentsEndRef = useRef(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faultRes = await faultService.getFaultById(id);
        const commentsRes = await faultService.getComments(id);
        setFault(faultRes.data);
        setComments(commentsRes.data);
      } catch (error) {
        setMessage('Failed to load fault details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('new_comment', (data) => {
      if (data.faultId === parseInt(id)) {
        setComments(currentComments => [...currentComments, data.comment]);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await faultService.addComment(id, newComment);
      setNewComment('');
    } catch (error) {
      alert('Failed to post comment.');
    }
  };

  if (loading) return <Spinner />;
  if (message) return <p>{message}</p>;
  if (!fault) return <p>Fault not found.</p>;

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.detailsCard}>
        <h2>Fault #{fault.id} Details</h2>
        <div className={styles.detailsGrid}>
          <p><strong>Reporter:</strong> {fault.reporter_name}</p>
          <p><strong>Hostel:</strong> {fault.hostel_name}</p>
          <p><strong>Location:</strong> {fault.location}</p>
          <p><strong>Floor:</strong> {fault.floor}</p>
          <p><strong>Category:</strong> {fault.category}</p>
          <p><strong>Priority:</strong> <span className={`priority priority-${fault.priority.toLowerCase()}`}>{fault.priority}</span></p>
          <p><strong>Status:</strong> <span className={`status status-${fault.status.toLowerCase().replace(' ', '-')}`}>{fault.status}</span></p>
          {fault.assigned_employee_name && <p><strong>Assigned To:</strong> {fault.assigned_employee_name}</p>}
          <p><strong>Reported:</strong> {new Date(fault.created_at).toLocaleString()}</p>
        </div>
        <p><strong>Description:</strong> {fault.description}</p>
        {fault.image_url && <p><strong>Image:</strong> <a href={`http://localhost:5000${fault.image_url}`} target="_blank" rel="noopener noreferrer">View Image</a></p>}
      </div>

      <div className={styles.commentsSection}>
        <h3>Comments & History</h3>
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <strong>{comment.author_name}</strong> ({comment.author_role})
                <span className={styles.commentDate}>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p>{comment.comment}</p>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or update..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
};

export default FaultDetailsPage;