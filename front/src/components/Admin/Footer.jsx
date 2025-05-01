import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="float-right d-none d-sm-block">
        <b>Version</b> 1.0.0
      </div>
      <strong>
        Copyright &copy; {currentYear}{' '}
        <a href="/">Webify</a>.
      </strong>{' '}
      All rights reserved.
    </footer>
  );
};

export default Footer;
