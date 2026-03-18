import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiGift, FiCalendar, FiTrendingDown } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 0,
    minPurchaseAmount: 0,
    expiryDate: '',
    usageLimit: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/admin/coupons');
      const data = response.data.data || response.data;
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountAmount || !newCoupon.expiryDate) {
      return toast.warn('Please fill required fields');
    }

    try {
      await api.post('/admin/coupons', newCoupon);
      toast.success('Coupon created successfully');
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountAmount: 0,
        minPurchaseAmount: 0,
        expiryDate: '',
        usageLimit: 100,
      });
      fetchCoupons();
    } catch (error) {
      console.error('Add coupon error:', error);
      toast.error(error.response?.data?.message || 'Failed to add coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  if (loading) return <div className="loading">Loading coupons...</div>;

  return (
    <div className="coupons-content">
      <div className="page-header">
        <h1>Coupon Management</h1>
        <p>Manage promotional codes</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="form-card">
          <h2>Create New Coupon</h2>
          <form onSubmit={handleAddCoupon}>
            <div className="form-group">
              <label>Coupon Code</label>
              <input 
                type="text" 
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME10"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  value={newCoupon.discountAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Min Purchase (₹)</label>
              <input 
                type="number" 
                value={newCoupon.minPurchaseAmount}
                onChange={(e) => setNewCoupon({ ...newCoupon, minPurchaseAmount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input 
                type="date" 
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
              />
            </div>
            <button type="submit" className="add-btn" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
              <FiPlus />
              <span>Create Coupon</span>
            </button>
          </form>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Purchase</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#ff3f6c' }}>
                        <FiGift /> {coupon.code}
                      </div>
                    </td>
                    <td>
                      {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                    </td>
                    <td>₹{coupon.minPurchaseAmount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <FiCalendar /> {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${new Date(coupon.expiryDate) > new Date() ? 'accepted' : 'cancelled'}`}>
                        {new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(coupon._id)} className="delete-btn">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
