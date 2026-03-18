import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiStar, FiTrash2, FiMessageCircle, FiCheckCircle, FiXCircle, FiUser, FiPackage, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/admin/reviews');
      const data = response.data.data || response.data;
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      toast.success('Review status updated');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar 
        key={i} 
        style={{ 
          color: i < rating ? '#ffb400' : '#ddd', 
          fontSize: '1.2rem',
          marginRight: '2px'
        }} 
      />
    ));
  };

  if (loading) return (
    <div className="loading" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      fontSize: '1.2rem',
      color: '#535665'
    }}>
      <div>Loading reviews...</div>
    </div>
  );

  return (
    <div className="reviews-content">
      <div className="page-header" style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #ff3f6c 0%, #ff6b9d 100%)',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(255, 63, 108, 0.3)'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
          <FiMessageCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Review Management
        </h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: '0.9' }}>
          Manage customer product reviews and feedback
        </p>
      </div>

      <div className="reviews-grid" style={{ 
        display: 'grid', 
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
      }}>
        {reviews.map(review => (
          <div key={review._id} className="review-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <div className="review-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div className="customer-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="customer-avatar" style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff3f6c 0%, #ff6b9d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 8px rgba(255, 63, 108, 0.3)'
                }}>
                  {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="customer-details">
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '600', color: '#2d3436' }}>
                    <FiUser style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#ff3f6c' }} />
                    {review.userId?.name || 'Unknown User'}
                  </h3>
                  <div className="product-info" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#636e72'
                  }}>
                    <FiPackage />
                    <span>{review.productId?.name || 'Unknown Product'}</span>
                  </div>
                </div>
              </div>
              <div className="review-status" style={{ textAlign: 'right' }}>
                <span className={`status-badge ${review.status?.toLowerCase()}`} style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                  ...(review.status === 'Approved' && {
                    background: '#e8f5e9',
                    color: '#4caf50'
                  }),
                  ...(review.status === 'Pending' && {
                    background: '#fff3e0',
                    color: '#ff9800'
                  }),
                  ...(review.status === 'Rejected' && {
                    background: '#ffebee',
                    color: '#f44336'
                  })
                }}>
                  {review.status}
                </span>
                <div className="review-date" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  color: '#95a5a6'
                }}>
                  <FiCalendar />
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="review-rating" style={{ 
              marginBottom: '1rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#2d3436' }}>Rating:</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderStars(review.rating)}
                  <span style={{ 
                    marginLeft: '0.5rem', 
                    fontWeight: '700', 
                    color: '#ffb400',
                    fontSize: '1.1rem'
                  }}>
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Review Comment */}
            <div className="review-comment" style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #ff3f6c'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                lineHeight: '1.6',
                color: '#2d3436',
                fontStyle: 'italic'
              }}>
                "{review.comment}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="review-actions" style={{ 
              display: 'flex', 
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => handleStatusChange(review._id, 'Approved')}
                className="btn btn-approve" 
                style={{ 
                  background: review.status === 'Approved' ? '#e8f5e9' : '#4caf50',
                  color: review.status === 'Approved' ? '#4caf50' : 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: review.status === 'Approved' ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  opacity: review.status === 'Approved' ? 0.6 : 1
                }}
                disabled={review.status === 'Approved'}
              >
                <FiCheckCircle /> {review.status === 'Approved' ? 'Approved' : 'Approve'}
              </button>
              <button 
                onClick={() => handleStatusChange(review._id, 'Rejected')}
                className="btn btn-reject" 
                style={{ 
                  background: review.status === 'Rejected' ? '#ffebee' : '#f44336',
                  color: review.status === 'Rejected' ? '#f44336' : 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: review.status === 'Rejected' ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  opacity: review.status === 'Rejected' ? 0.6 : 1
                }}
                disabled={review.status === 'Rejected'}
              >
                <FiXCircle /> {review.status === 'Rejected' ? 'Rejected' : 'Reject'}
              </button>
              <button 
                onClick={() => handleDelete(review._id)}
                className="btn btn-delete" 
                style={{ 
                  marginLeft: 'auto',
                  background: 'white',
                  border: '2px solid #ff3f6c',
                  color: '#ff3f6c',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="no-reviews-card" style={{ 
            gridColumn: '1/-1', 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '2px dashed #ddd'
          }}>
            <FiMessageCircle style={{ 
              fontSize: '4rem', 
              color: '#ddd', 
              marginBottom: '1.5rem' 
            }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#636e72', fontSize: '1.5rem' }}>
              No Reviews Found
            </h3>
            <p style={{ margin: 0, color: '#95a5a6', fontSize: '1rem' }}>
              There are no customer reviews to display at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
