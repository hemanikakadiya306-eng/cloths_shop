import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiBox, FiUsers, FiShoppingCart, FiClock, FiTrendingUp } from 'react-icons/fi';
import DashboardCharts from '../components/DashboardCharts';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Socket.io for real-time updates (disabled for now)
    // const socket = io('/'); // Use root because of proxy

    // socket.on('new-order', (order) => {
    //   toast.info('New Order Received!');
    //   fetchStats();
    // });

    // socket.on('new-contact', (message) => {
    //   toast.info('New Customer Message!');
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      const data = response.data.data || response.data;
      setStats({
        totalProducts: data.totalProducts || 0,
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0
      });
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Check if authentication error
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        return;
      }
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time statistics of your store</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <FiBox />
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Registered Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">
            <FiShoppingCart />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>₹{stats.totalRevenue?.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="charts-container">
          <DashboardCharts stats={stats} />
        </div>
        
        <div className="recent-orders-card">
          <h2>Recent Orders</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.substring(0, 8)}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>₹{order.finalAmount}</td>
                    <td>
                      <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
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

export default Dashboard;
