import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../components/Seller/Sidebar";
import DataTable from "../../components/Seller/DataTable";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertCircle } from "react-icons/fi";
import { fetchCategories } from "../../store/slices/productsSlice";
import { fetchSellerProducts, deleteSellerProduct } from "../../store/slices/sellerProductsSlice";
import { loadUser } from "../../store/slices/authSlice";
import "../../assets/css/dashboard/dash.css";

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);
  const [notification, setNotification] = useState(null);

  // Get data from Redux store
  const { items: sellerProducts, loading, error } = useSelector(state => state.sellerProducts);
  const { categories } = useSelector(state => state.products);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Check for notification from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        message: location.state.message,
        type: location.state.messageType || 'success'
      });
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
      
      // Auto-dismiss notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Load user data if not already loaded
  useEffect(() => {
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Load seller products and categories from backend
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchSellerProducts());
      dispatch(fetchCategories());
    }
  }, [dispatch, user]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      setIsDeleting(productId);
      await dispatch(deleteSellerProduct(productId)).unwrap();
      
      // Show success notification
      setNotification({
        message: "Product deleted successfully!",
        type: "success"
      });
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      
      // Show error notification
      setNotification({
        message: typeof error === 'string' ? error : "Failed to delete product. Please try again.",
        type: "error"
      });
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = sellerProducts ? sellerProducts.filter(product => {
    // Handle cases where product name or title might be undefined
    const productName = product.name || product.title || '';
    const productDescription = product.description || '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                          (product.category && String(product.category) === String(selectedCategory)) ||
                          (product.category_id && String(product.category_id) === String(selectedCategory));
    return matchesSearch && matchesCategory;
  }) : [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading && sellerProducts.length === 0) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
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
          <h1 className="dashboard-header">Products</h1>
          <button
            onClick={() => navigate('/seller/products/add')}
            className="button button-primary mb-3"
          >
            <FiPlus className="icon" /> Add New Product
          </button>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'error' && <FiAlertCircle className="notification-icon" />}
            {notification.message}
            <button 
              className="close-notification" 
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>
        )}

        <div className="card filters-container">
          <div className="filter-group">
            <div className="search-input-wrapper ">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control category-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="card error-content">
            <p>{typeof error === 'object' ? 'Failed to load products. Please try again.' : error}</p>
            <button
              onClick={() => {
                dispatch(fetchSellerProducts());
                dispatch(fetchCategories());
              }}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        )}

        {!error && filteredProducts.length === 0 ? (
          <div className="card empty-state">
            <p>No products found matching your criteria</p>
            <button
              onClick={() => navigate('/seller/products/add')}
              className="button button-primary"
            >
              <FiPlus className="icon" /> Add Your First Product
            </button>
          </div>
        ) : (
          <div className="card data-table-container">
            <DataTable
              headers={[
                { key: 'name', label: 'Product' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
              ]}
              data={filteredProducts.map(product => {
                const category = categories.find(c => c.id === product.category || c.id === product.category_id);
                return {
                  ...product,
                  name: product.name || product.title || 'Unnamed Product',
                  category: category?.name || product.category_name || 'Uncategorized',
                  price: formatCurrency(product.price || 0),
                  status: (
                    <span className={`status-badge ${product.is_approved ? 'status-active' : 'status-inactive'}`}>
                      {product.is_approved ? 'Approved' : <span style={{ color: 'red' }}>Not Approved</span>}
                    </span>
                  ),
                  actions: (
                    <div className="actions-container d-flex flex-sm-column flex-md-row">
                      <button 
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="button button-secondary button-sm me-2 mb-sm-2 mb-md-0"
                        title="Edit product"
                      >
                        <FiEdit className="icon" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="button button-danger button-sm "
                        disabled={isDeleting === product.id}
                        title="Delete product"
                      >
                        {isDeleting === product.id ? (
                          'Deleting...'
                        ) : (
                          <>
                            <FiTrash2 className="icon" /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  )
                };
              })}
              sortable
              pagination
              itemsPerPage={10}
            />
          </div>
        )}
      </main>
      
      <style jsx="true">{`
        .notification {
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }
        
        .notification.success {
          background-color: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }
        
        .notification.error {
          background-color: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }
        
        .notification-icon {
          margin-right: 8px;
        }
        
        .close-notification {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
        }
        
        .close-notification:hover {
          opacity: 1;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}