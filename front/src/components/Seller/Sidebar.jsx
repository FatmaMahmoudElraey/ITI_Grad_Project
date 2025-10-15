import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import sellerNavigation from '../../config/sellerNavigation';
import '../../assets/css/dashboard/dash.css';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const location = useLocation();


  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={` sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header text-center">
        <h2 className='pt-3'>Seller Panel</h2>
      </div>
      
      <hr className="sidebar-divider" />
      
      <nav className="sidebar-nav">
        <ul>
          {sellerNavigation.map((item) => (
            <li key={item.path}>
              <div className="nav-item-container">
                <NavLink
                  to={item.path}
                  className={isActive(item) ? 'nav-link active' : 'nav-link'}
                >
                  <i className={`${item.iconClass} nav-icon ps-2`}></i>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label ms-2">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
