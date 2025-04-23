import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Menu } from 'react-feather';
import '../../assets/css/dashboard/dash.css';

export default function Header({ onMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-button" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <Link to="/" className="brand-logo">
          <img src="/logo.png" alt="Store Logo" />
          <h1>Seller Dashboard</h1>
        </Link>
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
        
        <div className="notification-wrapper">
          <button 
            className="notification-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              {/* Notification items */}
            </div>
          )}
        </div>
        
        <div className="user-profile">
          {/* Profile content */}
        </div>
      </div>
    </header>
  );
}