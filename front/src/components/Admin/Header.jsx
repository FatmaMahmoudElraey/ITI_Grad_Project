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

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
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

      {/* Search form */}
      <form className="form-inline ml-3" onSubmit={handleSearch}>
        <div className="input-group input-group-sm">
          <input 
            className="form-control form-control-navbar" 
            type="search" 
            placeholder="Search products..." 
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="input-group-append">
            <button className="btn btn-navbar" type="submit">
              <FaSearch />
            </button>
          </div>
        </div>
      </form>
    </nav>
  );
};

export default Header;
