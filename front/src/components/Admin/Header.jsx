import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767.98);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <nav className="main-header navbar navbar-expand">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" onClick={toggleSidebar} role="button" style={{ cursor: 'pointer' }}>
            <FaBars />
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/" className="nav-link">
            <FaHome className="mr-1" />
            Home
          </Link>
        </li>
      </ul>



      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
      
        {/* Logout */}
        <li className="nav-item">
          <button 
            className="btn nav-link p-2 me-1" 
            onClick={handleLogout}
            title="Logout"
            style={{ border: 'none', background: 'none' }}
          >
            <FaSignOutAlt />
            <span className={`ml-1 ${isMobile ? 'd-none' : 'd-inline-block'}`}>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
