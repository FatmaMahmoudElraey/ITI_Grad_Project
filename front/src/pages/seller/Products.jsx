import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import DataTable from "../../components/Seller/DataTable";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import initialData from "../../assets/data/dashboardData.json";
import "../../assets/css/dashboard/dash.css";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);

  // Load products from localStorage or initial JSON
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Check if we have products in localStorage
        const savedProducts = localStorage.getItem('sellerProducts');
        
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        } else {
          // Use initial data if nothing in localStorage
          setProducts(initialData.popularProducts || []);
          localStorage.setItem('sellerProducts', JSON.stringify(initialData.popularProducts || []));
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load products");
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('sellerProducts', JSON.stringify(products));
    }
  }, [products]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      setIsDeleting(productId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Function to add a new product
  const handleAddProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: `prod-${Date.now()}`, // Generate unique ID
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    };
    
    setProducts(prev => [...prev, productWithId]);
    navigate('/seller/products');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
              {initialData.categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
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
                { key: 'stock', label: 'Stock' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
              ]}
              data={filteredProducts.map(product => {
                const category = initialData.categories.find(c => c.value === product.category);
                return {
                  ...product,
                  category: category?.label || product.category,
                  price: formatCurrency(product.price),
                  stock: (
                    <span className={product.stock > 0 ? "text-success" : "text-danger"}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  ),
                  status: (
                    <span className={`status-badge ${
                      product.stock > 0 ? 'status-active' : 'status-inactive'
                    }`}>
                      {product.stock > 0 ? 'Active' : 'Inactive'}
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