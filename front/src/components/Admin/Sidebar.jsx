import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUsers, 
  FaBox, 
  FaSignOutAlt,
  FaAngleLeft,
  FaBars,
  FaListAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import logo from '../../assets/images/navbar/logo.png'; // Update with your actual logo path

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/products', icon: <FaBox />, label: 'Products' },
    { path: '/admin/not-approved-products', icon: <FaExclamationTriangle />, label: 'Pending Approval' },
    { path: '/admin/categories', icon: <FaListAlt />, label: 'Categories' },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`main-sidebar sidebar-dark-primary elevation-4 ${collapsed ? 'sidebar-collapse' : ''}`}>
      {/* Brand Logo */}
      <Link to="/admin/products" className="brand-link">
        <img 
          src={logo} 
          alt="AdminLTE Logo" 
          className="brand-image img-circle elevation-3" 
          style={{ opacity: '.8' }} 
        />
        <span className="brand-text font-weight-light">Admin Panel</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            {menuItems.map((item, index) => (
              <li className="nav-item" key={index}>
                <Link to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
                  <i className="nav-icon">{item.icon}</i>
                  <p>{item.label}</p>
                </Link>
              </li>
            ))}
            
          </ul>
        </nav>
        
        {/* Sidebar Toggle Button */}
        <div className="sidebar-toggle-btn" onClick={onToggleCollapse}>
          <i>{collapsed ? <FaBars /> : <FaAngleLeft />}</i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
