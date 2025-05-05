import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, ArrowDown } from 'react-feather';
import { Loader } from 'react-feather';

export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend,
  color = 'rgb(102, 15, 241)',
  loading = false
}) {
  const isPositive = trend?.value >= 0;
  
  return (
    <div className={`card dashboard-card ${loading ? 'loading' : ''}`}>
      <div className="card-header">
        {loading && (
          <div className="card-loading-overlay">
            <Loader size={20} className="spinner" />
          </div>
        )}
        <div>
          <h4 className='card-title'>{title}</h4>
          <h2 className='card-value'>{value}</h2>
        </div>
        <div className='card-icon-container'>
        {icon && (
          <div className="card-icon" style={{ backgroundColor: `${color}10`, color }}>
            {icon}
          </div>
          
        )}
        </div>
      </div>
      
      {trend && (
        <div className={`card-trend ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span>
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  trend: PropTypes.shape({
    value: PropTypes.number,
    direction: PropTypes.string,
    label: PropTypes.string
  }),
  color: PropTypes.string,
  loading: PropTypes.bool
};