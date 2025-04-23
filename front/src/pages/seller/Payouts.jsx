import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import { FiDollarSign, FiClock, FiCalendar, FiXCircle, FiEye } from "react-icons/fi";
import dashboardData from "../../assets/data/dashboardData.json";
import "../../assets/css/dashboard/dash.css";

export default function Payouts() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    totalPayouts: 0,
    pending: 0,
    nextPayout: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set data from JSON file
        setStats(dashboardData.payoutStats);
        setPayouts(dashboardData.recentPayouts);
        setLoading(false);
      } catch (err) {
        setError("Failed to load payout data");
        setLoading(false);
      }
    };

    fetchPayoutData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading payout history...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card error-content">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Payout History</h1>
          <button 
            className="button button-secondary"
            onClick={() => navigate('/seller/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="stats-grid">
          <div className="card dashboard-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Total Payouts</h3>
                <p className="card-value">{formatCurrency(stats.totalPayouts)}</p>
              </div>
              <div className="card-icon-container" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                <FiDollarSign className="card-icon" />
              </div>
            </div>
          </div>

          <div className="card dashboard-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Pending</h3>
                <p className="card-value">{formatCurrency(stats.pending)}</p>
              </div>
              <div className="card-icon-container" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <FiClock className="card-icon" />
              </div>
            </div>
          </div>

          <div className="card dashboard-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Next Payout</h3>
                <p className="card-value">{formatCurrency(stats.nextPayout)}</p>
              </div>
              <div className="card-icon-container" style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}>
                <FiCalendar className="card-icon" />
              </div>
            </div>
          </div>

          <div className="card dashboard-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Failed</h3>
                <p className="card-value">{formatCurrency(stats.failed)}</p>
              </div>
              <div className="card-icon-container" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                <FiXCircle className="card-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="card data-table-container">
          <div className="table-header-container">
            <div className="table-title-container">
              <h2 className="table-title">Recent Payouts</h2>
            </div>
            <button 
              className="button button-secondary"
              onClick={() => navigate('/seller/payouts/history')}
            >
              <FiEye className="icon" /> View All Payouts
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th className="text-right">Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="text-primary">{payout.id}</td>
                    <td className="text-right">{formatCurrency(payout.amount)}</td>
                    <td>{payout.date}</td>
                    <td>{payout.method}</td>
                    <td>
                      <span className={`status-badge ${
                        payout.status === "Completed" ? "status-completed" : 
                        payout.status === "Pending" ? "status-processing" :
                        "status-error"
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}