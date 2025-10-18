import React, { useState, useEffect } from 'react';
import { FaEye, FaFilter, FaDownload } from 'react-icons/fa';
import DataTable from '../../components/Admin/DataTable';
import axios from 'axios';
import { BASE_URL, ENDPOINTS } from '../../api/constants';
import Swal from 'sweetalert2';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState(null);

  // Helper function to get auth header
  // Using cookie-based auth; axios will send cookies automatically (withCredentials=true)

  useEffect(() => {
    // Fetch all orders from the database for admin dashboard
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to fetch orders directly from Django admin API
        try {
          // This approach uses Django admin API directly
          const response = await axios.get(ENDPOINTS.ADMIN_ORDERS);
          
          // Ensure we have an array to work with
          const ordersData = Array.isArray(response.data) 
            ? response.data 
            : response.data.results || [];
          
          setOrders(ordersData);
          setLoading(false);
          return; // Exit if successful
        } catch (adminError) {
          // Continue to fallback approach
        }
        
        // Fallback: Try to fetch all orders using regular API
        // This will only work if the user has admin permissions
        const response = await axios.get(ENDPOINTS.ADMIN_ORDERS);
        
        // Ensure we have an array to work with
        const ordersData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || [];
        
        // If we need to fetch order details for each order
        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const detailsResponse = await axios.get(`${ENDPOINTS.ADMIN_ORDERS}/${order.id}/`);
              return detailsResponse.data;
            } catch (error) {
              return order; // Return the original order if details fetch fails
            }
          })
        );
        
        setOrders(ordersWithDetails);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch orders. Make sure you have admin permissions.');
        setOrders([]);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Get status text and badge class
  const getStatusInfo = (status) => {
    switch (status) {
      case 'C':
        return { text: 'Completed', badgeClass: 'badge-success' };
      case 'P':
        return { text: 'Pending', badgeClass: 'badge-warning' };
      case 'X':
        return { text: 'Canceled', badgeClass: 'badge-danger' };
      default:
        return { text: 'Unknown', badgeClass: 'badge-secondary' };
    }
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setShowOrderDetails(true);
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${ENDPOINTS.ADMIN_ORDERS}/${orderId}/`, {
        payment_status: newStatus
      });
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, payment_status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, payment_status: newStatus });
      }
    } catch (error) {
      Swal.fire({
                title: 'Error',
                text: 'Failed to change order status. Please try again.',
                icon: 'error'
              });
    }
  };

  // Get customer name from order
  const getCustomerName = (order) => {
    if (!order || !order.user) return 'Unknown';
    
    if (order.user.name) return order.user.name;
    if (order.user.first_name && order.user.last_name) 
      return `${order.user.first_name} ${order.user.last_name}`;
    if (order.user.email) return order.user.email;
    
    return 'Unknown';
  };

  // Get order total
  const getOrderTotal = (order) => {
    // First try to use the total field from the API
    if (order.total !== undefined && order.total !== null) {
      return order.total;
    }
    
    // Fallback: Calculate from items using product price
    // Each product can only be purchased once, so quantity is always 1
    if (!order.items || order.items.length === 0) return 0;
    
    return order.items.reduce((total, item) => {
      // Use product price directly
      if (item.product && item.product.price) {
        return total + parseFloat(item.product.price);
      }
      // Fallback to item price if product price is not available
      return total + parseFloat(item.price || 0);
    }, 0);
  };

  // Filter orders by status
  const filteredOrders = filterStatus 
    ? orders.filter(order => order.payment_status === filterStatus)
    : orders;

  // Table columns
  const columns = [
    { field: 'id', header: 'Order ID', sortable: true },
    { 
      field: 'user', 
      header: 'Customer', 
      sortable: true,
      render: (item) => getCustomerName(item)
    },
    { 
      field: 'created_at', 
      header: 'Date', 
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    { 
      field: 'payment_status', 
      header: 'Status', 
      sortable: true,
      render: (item) => {
        const { text, badgeClass } = getStatusInfo(item.payment_status);
        return <span className={`badge ${badgeClass}`}>{text}</span>;
      }
    },
    { 
      field: 'total', 
      header: 'Total', 
      sortable: true,
      render: (item) => formatCurrency(getOrderTotal(item))
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-info" 
            onClick={() => handleViewOrder(item)}
            title="View Details"
          >
            <FaEye />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Loading orders...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                  <p>Please make sure you are logged in as an admin user.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Orders Management</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Orders</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-8">
              <button className="btn btn-success">
                <FaDownload className="mr-1" /> Export Orders
              </button>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <select 
                  className="form-control" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="P">Pending</option>
                  <option value="C">Completed</option>
                  <option value="X">Canceled</option>
                </select>
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary" type="button">
                    <FaFilter />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Orders ({orders.length})</h3>
                </div>
                <div className="card-body table-responsive p-0">
                  {orders.length > 0 ? (
                    <DataTable 
                      columns={columns} 
                      data={filteredOrders} 
                      itemsPerPage={10}
                      sortable={true}
                    />
                  ) : (
                    <div className="alert alert-info m-3">
                      No orders found. Orders created in Django admin may not appear here due to API restrictions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Details Modal */}
      {showOrderDetails && currentOrder && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Order #{currentOrder.id} Details</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setShowOrderDetails(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Customer:</strong> {getCustomerName(currentOrder)}</p>
                    <p><strong>Email:</strong> {currentOrder.user ? currentOrder.user.email : 'Unknown'}</p>
                    <p><strong>Date:</strong> {new Date(currentOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Status:</strong> 
                      <select 
                        className="ml-2 form-control-sm"
                        value={currentOrder.payment_status}
                        onChange={(e) => handleStatusChange(currentOrder.id, e.target.value)}
                      >
                        <option value="P">Pending</option>
                        <option value="C">Completed</option>
                        <option value="X">Canceled</option>
                      </select>
                    </p>
                    <p><strong>Total:</strong> {formatCurrency(getOrderTotal(currentOrder))}</p>
                  </div>
                </div>
                
                <h5 className="mt-4">Order Items</h5>
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.items && currentOrder.items.length > 0 ? (
                      currentOrder.items.map((item, index) => {
                        // Get the product price (either from product object or item price)
                        const productPrice = item.product && item.product.price 
                          ? parseFloat(item.product.price) 
                          : parseFloat(item.price || 0);
                          
                        return (
                          <tr key={index}>
                            <td>{item.product ? item.product.title : 'Unknown Product'}</td>
                            <td>{formatCurrency(productPrice)}</td>
                            <td>1</td> {/* Always display 1 as quantity */}
                            <td>{formatCurrency(productPrice)}</td> {/* Total is same as price */}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">No items found for this order</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-right">Total:</th>
                      <th>{formatCurrency(getOrderTotal(currentOrder))}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-default" 
                  onClick={() => setShowOrderDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
