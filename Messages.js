import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiMessageSquare, FiSend, FiUser, FiMail, FiPhone, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/admin/messages');
      const data = response.data.data || response.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyText({ ...replyText, [id]: text });
  };

  const handleReplySubmit = async (id) => {
    if (!replyText[id]) return toast.warn('Please type a reply');

    try {
      await api.put(`/admin/messages/${id}/reply`, { message: replyText[id] });
      toast.success('Reply sent successfully');
      setReplyText({ ...replyText, [id]: '' });
      fetchMessages();
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('Failed to send reply');
    }
  };

  if (loading) return <div className="loading">Loading messages...</div>;

  return (
    <div className="messages-content">
      <div className="page-header">
        <h1>Customer Support Messages</h1>
        <p>Manage and respond to customer inquiries</p>
      </div>

      <div className="messages-grid">
        {messages.map(msg => (
          <div key={msg._id} className={`message-card ${msg.status?.toLowerCase()}`}>
            <div className="message-header">
              <div className="customer-meta">
                <div className="customer-avatar">
                  {msg.name?.charAt(0).toUpperCase()}
                </div>
                <div className="customer-details">
                  <h3>{msg.name}</h3>
                  <div className="meta-row">
                    <FiMail className="meta-icon" />
                    <span>{msg.email}</span>
                  </div>
                  <div className="meta-row">
                    <FiPhone className="meta-icon" />
                    <span>{msg.phone}</span>
                  </div>
                </div>
              </div>
              <div className="message-status">
                <span className={`status-badge ${msg.status?.toLowerCase()}`}>
                  {msg.status === 'Resolved' ? <FiCheckCircle /> : <FiClock />}
                  {msg.status}
                </span>
                <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="message-body">
              <div className="message-subject">Subject: {msg.subject}</div>
              <p className="message-text">{msg.message}</p>
            </div>

            <div className="message-footer">
              {msg.status === 'Resolved' ? (
                <div className="admin-reply">
                  <div className="reply-header">Admin Reply:</div>
                  <p className="reply-text">{msg.adminReply?.message}</p>
                  <span className="reply-date">Replied on {new Date(msg.adminReply?.repliedAt).toLocaleString()}</span>
                </div>
              ) : (
                <div className="reply-input-group">
                  <textarea 
                    placeholder="Type your reply here..." 
                    value={replyText[msg._id] || ''}
                    onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                  ></textarea>
                  <button onClick={() => handleReplySubmit(msg._id)} className="send-reply-btn">
                    <FiSend />
                    <span>Send Reply</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="empty-state">
            <FiMessageSquare className="empty-icon" />
            <p>No customer messages found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
