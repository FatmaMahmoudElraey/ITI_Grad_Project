import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiEye, FiFilter } from 'react-icons/fi';
import { fetchSellerOrders, updateOrderStatus } from '../../store/slices/sellerOrdersSlice';
import DataTable from '../../components/Seller/DataTable';
import Sidebar from "../../components/Seller/Sidebar";
import { loadUser } from "../../store/slices/authSlice";
import "../../assets/css/dashboard/dash.css";

export default function Orders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);

  // Get data from Redux store
  const { items: orders, loading, error } = useSelector(state => state.sellerOrders);
  const { user } = useSelector(state => state.auth);

  // Load user data if not already loaded
  useEffect(() => {
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Load seller orders from backend
  useEffect(() => {
    if (user && user.id) {
      console.log('Dispatching fetchSellerOrders for user:', user.id);
      dispatch(fetchSellerOrders());
    }
  }, [dispatch, user]);
  
  // Debug log orders
  useEffect(() => {
    console.log('Current orders in component:', orders);
    // Log the data type and structure
    console.log('Orders type:', typeof orders);
    console.log('Is orders an array?', Array.isArray(orders));
    if (Array.isArray(orders)) {
      console.log('Orders length:', orders.length);
      if (orders.length > 0) {
        console.log('First order sample:', JSON.stringify(orders[0], null, 2));
      }
    }
  }, [orders]);

  // Make sure orders is an array before filtering
  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => 
        statusFilter === "all" || 
        (order.payment_status === statusFilter.charAt(0).toUpperCase())
      )
    : [];
    
  console.log('Filtered orders by status:', filteredOrders);
  console.log('Filtered orders length:', filteredOrders.length);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(orderId);
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
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
            className="btn btn-secondary mb-3"
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
              <option value="P">Processing</option>
              <option value="S">Shipped</option>
              <option value="C">Completed</option>
            </select>
          </div>
        </div>

        <div className="card data-table-container">
          {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
            <DataTable
              headers={[
                { key: 'id', label: 'Order ID', style: { width: '80px' } },
                { key: 'customer', label: 'Customer', style: { width: '120px' } },
                { key: 'items', label: 'Order Items', style: { width: '250px' } },
                { key: 'date', label: 'Date', style: { width: '100px' } },
                { key: 'total', label: 'Total Price', style: { width: '100px' } },
                { key: 'status', label: 'Status', style: { width: '100px' } }
              ]}
              data={filteredOrders.map(order => ({
                id: order.id,
                customer: order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}` : 'Unknown',
                items: (
                  <div className="order-items-container">
                    {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                      <ul className="order-items-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {order.items.map((item, idx) => (
                          <li key={item.id || `item-${idx}`} style={{ marginBottom: '5px' }}>
                            <strong>{item.product?.name || 'Product'}</strong> x {item.quantity || 1}
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(item.product?.price || 0)} each
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: '#999' }}>No items found</span>
                    )}
                  </div>
                ),
                date: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown',
                total: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(order.total || 0),
                status: (
                  <span className={`status-badge ${
                    (order.payment_status === 'C') ? 'status-completed' :
                    (order.payment_status === 'S') ? 'status-shipped' : 'status-processing'
                  }`}>
                    {order.payment_status === 'C' ? 'Completed' :
                     order.payment_status === 'S' ? 'Shipped' : 'Processing'}
                  </span>
                )
              }))}
              sortable
              pagination
              itemsPerPage={10}
            />
          ) : (
            <div className="empty-data-message">
              <p>No orders found. {loading ? 'Loading...' : error ? 'Error loading orders.' : 'You have no orders yet.'}</p>
              {console.log('No orders to display in UI')}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}