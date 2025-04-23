import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import sellerNavigation from '../../config/sellerNavigation';
import '../../assets/css/dashboard/dash.css';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const location = useLocation();

  const toggleItemExpand = (path) => {
    setExpandedItems(prev =>
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Seller Panel</h2>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-toggle"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
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
                  onClick={() => item.subItems && toggleItemExpand(item.path)}
                >
                  <i className={`${item.iconClass} nav-icon`}></i>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </NavLink>

                {item.subItems && !isCollapsed && expandedItems.includes(item.path) && (
                  <ul className="submenu">
                    {item.subItems.map(subItem => (
                      <li key={subItem.path}>
                        <NavLink
                          to={subItem.path}
                          className={({ isActive }) => 
                            `submenu-link ${isActive ? 'active' : ''}`
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-profile">
        {/* Optional: Add profile section here */}
      </div>
    </div>
  );
}
