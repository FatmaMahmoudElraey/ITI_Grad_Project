import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import DataTable from "../../components/Seller/DataTable";
import { FiEye, FiFilter } from "react-icons/fi";
import "../../assets/css/dashboard/dash.css";
import dashboardData from "../../assets/data/dashboardData.json";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setOrders(dashboardData.recentOrders.map(order => ({
          ...order,
          amount: parseFloat(order.amount.replace(/[^0-9.]/g, ''))
        })));
        setLoading(false);
      } catch (err) {
        setError("Failed to load orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(orderId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
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
          <h1 className="dashboard-header">Orders</h1>
          <button 
            className="button button-secondary"
            onClick={() => navigate('/seller/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="card filters-container">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control status-select"
              disabled={loading}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="card data-table-container">
          <DataTable
            headers={[
              { key: 'id', label: 'Order ID' },
              { key: 'customer', label: 'Customer' },
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' }
            ]}
            data={filteredOrders.map(order => ({
              ...order,
              amount: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(order.amount),
              status: (
                <span className={`status-badge ${
                  order.status.toLowerCase() === 'completed' ? 'status-completed' :
                  order.status.toLowerCase() === 'shipped' ? 'status-shipped' : 'status-processing'
                }`}>
                  {order.status}
                </span>
              ),
              actions: (
                <div className="actions-container">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="form-control status-select"
                    disabled={isUpdatingStatus === order.id}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                    className="button button-secondary button-sm"
                  >
                    <FiEye className="icon" /> View
                  </button>
                </div>
              )
            }))}
            sortable
            pagination
            itemsPerPage={10}
          />
        </div>
      </main>
    </div>
  );
}