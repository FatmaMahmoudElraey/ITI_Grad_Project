import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from '../Footer';

// Import AdminLTE styles (make sure these are properly imported in your main index.js or App.js)
// If you're using a CDN, these imports won't be necessary
import '../../styles/admin.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767.98);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Load AdminLTE scripts
    const loadAdminLTEScripts = async () => {
      // Check if jQuery is already loaded
      if (!window.jQuery) {
        const jquery = document.createElement('script');
        jquery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jquery.async = true;
        document.body.appendChild(jquery);
      }

      // Check if Bootstrap is already loaded
      if (!window.bootstrap) {
        const bootstrap = document.createElement('script');
        bootstrap.src = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js';
        bootstrap.async = true;
        document.body.appendChild(bootstrap);
      }

      // Load AdminLTE
      const adminLTE = document.createElement('script');
      adminLTE.src = 'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js';
      adminLTE.async = true;
      document.body.appendChild(adminLTE);
    };

    loadAdminLTEScripts();

    // Add AdminLTE CSS
    const adminLTECSS = document.createElement('link');
    adminLTECSS.rel = 'stylesheet';
    adminLTECSS.href = 'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css';
    document.head.appendChild(adminLTECSS);

    // Add Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Cleanup function to remove scripts and styles when component unmounts
    return () => {
      window.removeEventListener('resize', checkMobile);
      const scripts = document.querySelectorAll('script[src*="adminlte"], script[src*="bootstrap"], script[src*="jquery"]');
      scripts.forEach(script => script.remove());
      
      const styles = document.querySelectorAll('link[href*="adminlte"], link[href*="font-awesome"]');
      styles.forEach(style => style.remove());
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="wrapper">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        open={sidebarOpen}
        isMobile={isMobile}
        onToggleCollapse={toggleSidebar}
        onClose={closeSidebar}
      />

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* Content Wrapper */}
      <div className={`content-wrapper ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        {/* Content Header */}
        <div className="content-header">
          <div className="container-fluid">
            {/* This will be filled by each page */}
          </div>
        </div>

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer collapsed={sidebarCollapsed && !isMobile} />
    </div>
  );
};

export default AdminLayout;
