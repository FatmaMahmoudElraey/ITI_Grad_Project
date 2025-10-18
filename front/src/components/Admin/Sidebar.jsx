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

const Sidebar = ({ collapsed, open, isMobile, onClose }) => {
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

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const getSidebarClasses = () => {
    let classes = 'main-sidebar sidebar-dark-primary elevation-4';
    
    if (isMobile) {
      classes += open ? ' sidebar-open' : '';
    } else {
      classes += collapsed ? ' sidebar-collapse' : '';
    }
    
    return classes;
  };

  return (
    <aside className={getSidebarClasses()}>
      {/* Brand Logo */}
      <Link to="/admin/products" className="brand-link" onClick={handleLinkClick}>
        <img 
          src={logo} 
          alt="AdminLTE Logo" 
          className="brand-image img-circle elevation-3" 
          style={{ opacity: '.8' }} 
        />
        <span className="brand-text fw-bold text-light">Admin Panel</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column justify-content-center" data-widget="treeview" role="menu" data-accordion="false">
            {menuItems.map((item, index) => (
              <li className="nav-item" key={index}>
                <Link 
                  to={item.path} 
                  className={`nav-link flex-row justify-content-start align-items-center  mb-1${isActive(item.path) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <i className="nav-icon">{item.icon}</i>
                  <p className='m-0'>{item.label}</p>
                </Link>
              </li>
            ))}
            
          </ul>
        </nav>
        
      </div>
    </aside>
  );
};

export default Sidebar;
