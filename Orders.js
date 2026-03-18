import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiEye, FiTrash2, FiSearch, FiFilter, FiCheckCircle, FiTruck, FiClock, FiXCircle, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      const data = response.data.orders || response.data.data || response.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order record?')) {
      try {
        await api.delete(`/admin/orders/${id}`);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <FiClock className="status-icon pending" />;
      case 'Accepted': return <FiCheckCircle className="status-icon accepted" />;
      case 'Out for Delivery': return <FiTruck className="status-icon delivery" />;
      case 'Completed': return <FiCheckCircle className="status-icon completed" />;
      case 'Cancelled': return <FiXCircle className="status-icon cancelled" />;
      default: return <FiClock className="status-icon" />;
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-content">
      <div className="page-header">
        <h1>Order Management</h1>
        <p>View and manage customer orders</p>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FiFilter className="filter-icon" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.substring(0, 8)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{order.user?.name || 'Guest'}</span>
                      <span className="customer-email">{order.user?.email || ''}</span>
                    </div>
                  </td>
                  <td>₹{order.finalAmount}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(order.orderStatus)}
                      <select 
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-select ${order.orderStatus?.toLowerCase().replace(/ /g, '-')}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        onClick={() => handleDelete(order._id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <FiShoppingCart className="empty-icon" />
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
