import React from 'react';

const DashboardCard = ({ title, value, icon, color, footerText, footerIcon }) => {
  return (
    <div className="col-lg-3 col-6">
      <div className="small-box bg-${color}">
        <div className="inner">
          <h3>{value}</h3>
          <p>{title}</p>
        </div>
        <div className="icon">
          <i className="ion">{icon}</i>
        </div>
        <a href="#" className="small-box-footer">
          {footerText} {footerIcon && <i className="fas fa-arrow-circle-right">{footerIcon}</i>}
        </a>
      </div>
    </div>
  );
};

export default DashboardCard;
