import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiUsers, FiMail, FiPhone, FiSearch, FiCheckCircle, FiCalendar, FiShoppingBag, FiUser, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm)
    );
  });

  if (loading) return (
    <div className="loading" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      fontSize: '1.2rem',
      color: '#535665'
    }}>
      <div>Loading users...</div>
    </div>
  );

  return (
    <div className="users-content">
      <div className="page-header" style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
          <FiUsers style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          User Management
        </h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: '0.9' }}>
          View and manage registered customers - {users.length} total users
        </p>
      </div>

      <div className="filters-section" style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <div className="search-container" style={{ position: 'relative', maxWidth: '500px' }}>
          <FiSearch className="search-icon" style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#95a5a6',
            fontSize: '1.1rem'
          }} />
          <input 
            type="text" 
            placeholder="Search users by name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
          />
        </div>
      </div>

      <div className="users-grid" style={{ 
        display: 'grid', 
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
      }}>
        {filteredUsers.map(user => (
          <div key={user._id} className="user-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* User Header */}
            <div className="user-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="user-avatar" style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.4rem',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: '600', color: '#2d3436' }}>
                    <FiUser style={{ marginRight: '0.5rem', fontSize: '1rem', color: '#667eea' }} />
                    {user.name}
                  </h3>
                  <div className="user-status" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <span className="status-badge" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      background: '#e8f5e9',
                      color: '#4caf50',
                      fontWeight: '600'
                    }}>
                      <FiCheckCircle style={{ fontSize: '0.8rem' }} />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Contact Info */}
            <div className="user-contact" style={{ 
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div className="contact-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <FiMail style={{ color: '#667eea', fontSize: '1rem' }} />
                <span style={{ color: '#495057', fontSize: '0.9rem' }}>{user.email}</span>
              </div>
              <div className="contact-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <FiPhone style={{ color: '#667eea', fontSize: '1rem' }} />
                <span style={{ color: '#495057', fontSize: '0.9rem' }}>
                  {user.phone || 'No phone number'}
                </span>
              </div>
            </div>

            {/* User Stats */}
            <div className="user-stats" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="stat-item" style={{
                textAlign: 'center',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <FiShoppingBag style={{ 
                  color: '#667eea', 
                  fontSize: '1.2rem', 
                  marginBottom: '0.25rem' 
                }} />
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2d3436' }}>
                  {user.ordersCount || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#636e72' }}>Orders</div>
              </div>
              <div className="stat-item" style={{
                textAlign: 'center',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <FiCalendar style={{ 
                  color: '#667eea', 
                  fontSize: '1.2rem', 
                  marginBottom: '0.25rem' 
                }} />
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3436' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#636e72' }}>Joined</div>
              </div>
            </div>

            {/* User Activity */}
            <div className="user-activity" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0',
              borderTop: '1px solid #f0f0f0'
            }}>
              <FiActivity style={{ color: '#667eea', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.8rem', color: '#636e72' }}>
                Last active: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="no-users-card" style={{ 
            gridColumn: '1/-1', 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '2px dashed #ddd'
          }}>
            <FiUsers style={{ 
              fontSize: '4rem', 
              color: '#ddd', 
              marginBottom: '1.5rem' 
            }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#636e72', fontSize: '1.5rem' }}>
              No Users Found
            </h3>
            <p style={{ margin: 0, color: '#95a5a6', fontSize: '1rem' }}>
              {searchTerm ? 'No users found matching your search criteria.' : 'No registered users found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
