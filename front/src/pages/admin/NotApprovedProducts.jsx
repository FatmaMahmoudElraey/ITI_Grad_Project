import React, { useState, useEffect } from 'react';
import { FaCheck, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import DataTable from '../../components/Admin/DataTable';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';
import Swal from 'sweetalert2';

const NotApprovedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Using cookie-based auth; axios will send cookies automatically (withCredentials=true)

  useEffect(() => {
    // Fetch not approved products and categories from the database
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch all available categories
        let availableCategories = [];
        try {
          const categoriesResponse = await axios.get(ENDPOINTS.CATEGORIES);
          availableCategories = categoriesResponse.data;
          setAllCategories(availableCategories);
        } catch (error) {
          availableCategories = [];
        }
        
        // Then fetch products
        const productsResponse = await axios.get(ENDPOINTS.PRODUCTS);
        
        // Ensure we have an array to work with
        const productsData = Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : productsResponse.data.results || [];
        
        // Filter only not approved products
        const notApprovedProducts = productsData.filter(product => !product.is_approved);
        
        // Enhance products with category information
        const enhancedProducts = notApprovedProducts.map(product => {
          // If the product has a category_name but we have the full category object,
          // add the category ID to the product
          if (product.category_name && !product.category) {
            const matchingCategory = availableCategories.find(
              cat => cat.name === product.category_name
            );
            if (matchingCategory) {
              return {
                ...product,
                category: matchingCategory.id
              };
            }
          }
          return product;
        });
        
        setProducts(enhancedProducts);
        
        // Extract unique categories from products for filtering
        const uniqueCategories = [...new Set(enhancedProducts.map(product => 
          product.category_name || 'Uncategorized'
        ))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        setProducts([]);
        setCategories([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Handle product edit
  const handleEditProduct = (product) => {
    setCurrentProduct({
      ...product,
      category: product.category || ''
    });
    setShowEditModal(true);
  };

  // Handle product delete
  const handleDeleteProduct = async (product) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${product.title}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${ENDPOINTS.PRODUCTS}${product.id}/`);
        setProducts(products.filter(p => p.id !== product.id));
        
        Swal.fire({
          title: 'Deleted!',
          text: `${product.title} has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete product. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  // Handle product approval
  const handleApproveProduct = async (product) => {
    try {
      const updatedProduct = { ...product, is_approved: true };
      
      await axios.patch(`${ENDPOINTS.PRODUCTS}${product.id}/`, 
        { is_approved: true }
      );
      
      // Update local state
      setProducts(products.filter(p => p.id !== product.id));
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Approved!',
        text: `${product.title} has been approved successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to approve product. Please try again.',
        icon: 'error'
      });
    }
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || product.category_name === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Define columns for DataTable
  const columns = [
    {
      header: 'Product',
      accessor: 'title',
      render: (item) => (
        <div className="d-flex align-items-center">
          {item.photo_url && (
            <img 
              src={item.photo_url} 
              alt={item.title} 
              className="mr-2" 
              style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
            />
          )}
          <div>
            <div className="font-weight-bold">{item.title}</div>
            <div className="small text-muted">{item.category_name || 'Uncategorized'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Seller',
      accessor: 'seller_name',
      render: (item) => <span>{item.seller_name || 'Unknown'}</span>
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (item) => <span>{formatCurrency(item.price)}</span>
    },
    {
      header: 'Date Added',
      accessor: 'created_at',
      render: (item) => <span>{new Date(item.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (item) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-success" 
            onClick={() => handleApproveProduct(item)}
            title="Approve"
          >
            <FaCheck />
          </button>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => handleEditProduct(item)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => handleDeleteProduct(item)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Not Approved Products</h1>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title">Products Pending Approval</h3>
                
                <div className="d-flex">
                  {/* Search Box */}
                  <div className="input-group input-group-sm mr-2" style={{ width: '200px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search products..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button className="btn btn-default">
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="input-group input-group-sm" style={{ width: '200px' }}>
                      <select 
                        className="form-control" 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                      <div className="input-group-append">
                        <button className="btn btn-default">
                          <FaFilter />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              <DataTable 
                columns={columns} 
                data={filteredProducts} 
                loading={loading}
                emptyMessage="No products pending approval"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Edit Product Modal - Similar to the one in Products.jsx but simplified */}
      {showEditModal && currentProduct && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentProduct(null);
                    setFormErrors({});
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <strong>Note:</strong> This is a simplified view. To make detailed edits, please use the main Products page.
                </div>
                <div className="form-group">
                  <label>Product Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentProduct.title} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formatCurrency(currentProduct.price)} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentProduct.category_name || 'Uncategorized'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Seller</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={currentProduct.seller_name || 'Unknown'} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={currentProduct.description || ''} 
                    disabled
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentProduct(null);
                  }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => {
                    handleApproveProduct(currentProduct);
                    setShowEditModal(false);
                    setCurrentProduct(null);
                  }}
                >
                  Approve Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotApprovedProducts;
