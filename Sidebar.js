import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiBox, 
  FiShoppingCart, 
  FiMessageSquare, 
  FiLogOut, 
  FiShoppingBag,
  FiTag,
  FiGift,
  FiStar,
  FiUsers
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <FiShoppingBag />
          <span>ClothShop Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiHome className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiBox className="nav-icon" />
          <span>Products</span>
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiTag className="nav-icon" />
          <span>Categories</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiShoppingCart className="nav-icon" />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/coupons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiGift className="nav-icon" />
          <span>Coupons</span>
        </NavLink>
        <NavLink to="/reviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiStar className="nav-icon" />
          <span>Reviews</span>
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiUsers className="nav-icon" />
          <span>Users</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiMessageSquare className="nav-icon" />
          <span>Messages</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
