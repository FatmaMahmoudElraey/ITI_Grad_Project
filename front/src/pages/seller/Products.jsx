import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../components/Seller/Sidebar";
import DataTable from "../../components/Seller/DataTable";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import { fetchCategories } from "../../store/slices/productsSlice";
import { fetchSellerProducts, deleteSellerProduct } from "../../store/slices/sellerProductsSlice";
import { loadUser } from "../../store/slices/authSlice";
import "../../assets/css/dashboard/dash.css";

export default function Products() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);

  // Get data from Redux store
  const { items: sellerProducts, loading, error } = useSelector(state => state.sellerProducts);
  const { categories } = useSelector(state => state.products);
  const { isAuthenticated, user } = useSelector(state => state.auth);

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

  // No need to filter products as fetchSellerProducts already returns only the seller's products

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setIsDeleting(productId);
      await dispatch(deleteSellerProduct(productId)).unwrap();
    } catch (error) {
      console.error("Failed to delete product:", error);
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
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

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
            <p>Loading products...</p>
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
            <p>{typeof error === 'object' ? 'Failed to load products. Please try again.' : error}</p>
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
          <h1 className="dashboard-header">Products</h1>
          <button
            onClick={() => navigate('/seller/products/add')}
            className="button button-primary"
          >
            <FiPlus className="icon" /> Add New Product
          </button>
        </div>

        <div className="card filters-container">
          <div className="filter-group">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
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

        {filteredProducts.length === 0 ? (
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
                const category = categories.find(c => c.id === product.category);
                return {
                  ...product,
                  name: product.name || product.title || 'Unnamed Product',
                  category: category?.name || product.category_name || 'Uncategorized',
                  price: formatCurrency(product.price || 0),
                  status: (
                    <span className={`status-badge ${
                      product.is_approved === true ? 'status-active' : 'status-inactive'
                    }`}>
                      {product.is_approved === true ? 'Approved' : <span style={{ color: 'red' }}>Not Approved</span>}
                    </span>
                  ),
                  actions: (
                    <div className="actions-container">
                      <button 
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="button button-secondary button-sm"
                      >
                        <FiEdit className="icon" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="button button-danger button-sm"
                        disabled={isDeleting === product.id}
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
    </div>
  );
}