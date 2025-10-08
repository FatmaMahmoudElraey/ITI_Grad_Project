import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaEnvelope, 
  FaSearch, 
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
  FaBars,
  FaHome
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { clearAuthState } from '../../store/slices/authSlice';
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Call server logout so it clears cookies & blacklists refresh token
    axios.post('/api/auth/jwt/logout/').catch(() => {});

    // Clear client auth state (do not clear entire localStorage to preserve cart/checkout data)
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    // Update Redux state
    dispatch(clearAuthState());

    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" onClick={toggleSidebar} role="button">
            <FaBars />
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        
      </ul>

      

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <button 
            className="btn btn-link nav-link" 
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
            <span className="d-none d-sm-inline-block ml-1">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
