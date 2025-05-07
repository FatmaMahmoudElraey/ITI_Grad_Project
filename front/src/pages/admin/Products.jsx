import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import DataTable from '../../components/Admin/DataTable';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    file: null,
    preview_video: null,
    photo: null,
    live_demo_url: '',
    is_in_subscription: true,
    is_approved: true,
    is_featured: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // Fetch products and categories from the database
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch all available categories
        let availableCategories = [];
        try {
          const categoriesResponse = await axios.get('http://localhost:8000/api/categories/');
          availableCategories = categoriesResponse.data;
          setAllCategories(availableCategories);
        } catch (error) {
          console.error('Error fetching categories:', error);
          availableCategories = [];
        }
        
        // Then fetch products
        const productsResponse = await axios.get('http://localhost:8000/api/products/');
        
        // Enhance products with category information
        const enhancedProducts = productsResponse.data.map(product => {
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
        console.error('Error fetching products:', error);
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
    if (window.confirm(`Are you sure you want to delete ${product.title}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/products/${product.id}/`, {
          headers: getAuthHeader()
        });
        setProducts(products.filter(p => p.id !== product.id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Handle product approval toggle
  const handleApprovalToggle = async (product) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/products/${product.id}/toggle_approved/`, 
        {},
        {
          headers: getAuthHeader()
        }
      );
      
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, is_approved: response.data.is_approved } : p
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating product approval status:', error);
      alert('Failed to update product approval status. Please try again.');
    }
  };

  // Handle featured toggle
  const handleFeaturedToggle = async (product) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/products/${product.id}/toggle_featured/`, 
        {},
        {
          headers: getAuthHeader()
        }
      );
      
      // Update the product in the local state with the response data
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, is_featured: response.data.is_featured } : p
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating product featured status:', error);
      alert('Failed to update product featured status. Please try again.');
    }
  };

  // Handle input change for new product form
  const handleNewProductChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setNewProduct({
        ...newProduct,
        [name]: files[0]
      });
    } else if (type === 'checkbox') {
      setNewProduct({
        ...newProduct,
        [name]: checked
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle input change for edit product form
  const handleEditProductChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setCurrentProduct({
        ...currentProduct,
        [name]: files[0],
        fileChanged: name === 'file',
        previewVideoChanged: name === 'preview_video',
        photoChanged: name === 'photo'
      });
    } else if (type === 'checkbox') {
      setCurrentProduct({
        ...currentProduct,
        [name]: checked
      });
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Remove an existing image from the product
  const handleRemoveExistingImage = async (imageId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/products/${currentProduct.id}/remove_image/`,
        {
          params: { image_id: imageId },
          headers: getAuthHeader()
        }
      );
      
      // Update the current product by removing the deleted image
      setCurrentProduct({
        ...currentProduct,
        images: currentProduct.images.filter(img => img.id !== imageId)
      });
      
      // Also update the product in the products list
      const updatedProducts = products.map(p => {
        if (p.id === currentProduct.id) {
          return {
            ...p,
            images: p.images.filter(img => img.id !== imageId)
          };
        }
        return p;
      });
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image. Please try again.');
    }
  };

  // Validate product form
  const validateProductForm = (product) => {
    const errors = {};
    
    if (!product.title || product.title.trim() === '') {
      errors.title = 'Title is required';
    }
    
    if (!product.description || product.description.trim() === '') {
      errors.description = 'Description is required';
    }
    
    if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!product.category) {
      errors.category = 'Category is required';
    }
    
    if (!product.file) {
      errors.file = 'Product file is required';
    }
    
    return errors;
  };

  // Handle add product form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateProductForm(newProduct);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      
      // For category, we need to send the ID
      if (newProduct.category) {
        formData.append('category', newProduct.category);
      }
      
      if (newProduct.file) {
        formData.append('file', newProduct.file);
      }
      
      if (newProduct.preview_video) {
        formData.append('preview_video', newProduct.preview_video);
      }
      
      if (newProduct.photo) {
        formData.append('photo', newProduct.photo);
      }
      
      formData.append('live_demo_url', newProduct.live_demo_url || '');
      formData.append('is_in_subscription', newProduct.is_in_subscription);
      formData.append('is_approved', newProduct.is_approved);
      formData.append('is_featured', newProduct.is_featured);
      
      const response = await axios.post('http://localhost:8000/api/products/', formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Find the category name for the newly created product
      let categoryName = 'Uncategorized';
      if (newProduct.category) {
        const category = allCategories.find(cat => cat.id === parseInt(newProduct.category));
        if (category) {
          categoryName = category.name;
        }
      }
      
      // Add the new product to the list with the correct category name
      const newProductWithCategory = {
        ...response.data,
        category_name: categoryName
      };
      
      setProducts([...products, newProductWithCategory]);
      
      // Reset form and close modal
      setNewProduct({
        title: '',
        description: '',
        price: '',
        category: '',
        file: null,
        preview_video: null,
        photo: null,
        live_demo_url: '',
        is_in_subscription: true,
        is_approved: true,
        is_featured: false
      });
      setFormErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to add product. Please try again.');
      }
    }
  };

  // Handle edit product form submission
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateProductForm(currentProduct);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', currentProduct.title);
      formData.append('description', currentProduct.description);
      formData.append('price', currentProduct.price);
      
      // For category, we need to send the ID
      if (currentProduct.category) {
        formData.append('category', currentProduct.category);
      }
      
      // Only append file if it was changed
      if (currentProduct.fileChanged && currentProduct.file) {
        formData.append('file', currentProduct.file);
      }
      
      // Only append preview video if it was changed
      if (currentProduct.previewVideoChanged && currentProduct.preview_video) {
        formData.append('preview_video', currentProduct.preview_video);
      }
      
      // Add photo if it was changed
      if (currentProduct.photoChanged && currentProduct.photo) {
        formData.append('photo', currentProduct.photo);
      }
      
      formData.append('live_demo_url', currentProduct.live_demo_url || '');
      formData.append('is_in_subscription', currentProduct.is_in_subscription);
      formData.append('is_approved', currentProduct.is_approved);
      formData.append('is_featured', currentProduct.is_featured);
      
      // Send request to update product
      const response = await axios.patch(
        `http://localhost:8000/api/products/${currentProduct.id}/`, 
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update product in state
      const updatedProducts = products.map(p => 
        p.id === currentProduct.id ? response.data : p
      );
      setProducts(updatedProducts);
      
      // Close modal
      setShowEditModal(false);
      setCurrentProduct(null);
      setFormErrors({});
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to update product. Please try again.');
      }
    }
  };

  // Filter products by category and search term
  const filteredProducts = products.filter(product => {
    // First apply category filter if selected
    if (filterCategory && product.category_name !== filterCategory) {
      return false;
    }
    
    // Then apply search filter if there's a search term
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Table columns
  const columns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'title', header: 'Product', sortable: true },
    { 
      field: 'category_name', 
      header: 'Category', 
      sortable: true,
      render: (item) => item.category_name || 'Uncategorized'
    },
    { 
      field: 'price', 
      header: 'Price', 
      sortable: true,
      render: (item) => formatCurrency(item.price)
    },
    { 
      field: 'seller', 
      header: 'Seller', 
      sortable: true,
      render: (item) => item.seller ? item.seller.name : 'Unknown'
    },
    { 
      field: 'is_approved', 
      header: 'Approved', 
      sortable: true,
      render: (item) => (
        <div className="custom-control custom-switch">
          <input 
            type="checkbox" 
            className="custom-control-input" 
            id={`approval-switch-${item.id}`}
            checked={item.is_approved}
            onChange={() => handleApprovalToggle(item)}
          />
          <label className="custom-control-label" htmlFor={`approval-switch-${item.id}`}></label>
        </div>
      )
    },
    { 
      field: 'is_featured', 
      header: 'Featured', 
      sortable: true,
      render: (item) => (
        <div className="custom-control custom-switch">
          <input 
            type="checkbox" 
            className="custom-control-input" 
            id={`featured-switch-${item.id}`}
            checked={item.is_featured}
            onChange={() => handleFeaturedToggle(item)}
          />
          <label className="custom-control-label" htmlFor={`featured-switch-${item.id}`}></label>
        </div>
      )
    },
    { 
      field: 'created_at', 
      header: 'Created At', 
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-info mr-1" 
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
                  <p className="mt-2">Loading products...</p>
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
              <h1 className="m-0">Products Management</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Products</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-md-4">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="mr-1" /> Add New Product
              </button>
            </div>
            <div className="col-md-4">
              <div className="input-group">
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
                  <button className="btn btn-outline-secondary" type="button">
                    <FaFilter />
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <button type="button" className="btn btn-outline-secondary">
                    <FaSearch />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Products</h3>
                </div>
                <div className="card-body table-responsive p-0">
                  <DataTable 
                    columns={columns} 
                    data={filteredProducts} 
                    itemsPerPage={10}
                    sortable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New Product</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowAddModal(false);
                    setFormErrors({});
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={newProduct.title}
                      onChange={handleNewProductChange}
                      required
                    />
                    {formErrors.title && (
                      <div className="invalid-feedback">{formErrors.title}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea 
                      className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      rows="3"
                      value={newProduct.description}
                      onChange={handleNewProductChange}
                      required
                    ></textarea>
                    {formErrors.description && (
                      <div className="invalid-feedback">{formErrors.description}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        value={newProduct.price}
                        onChange={handleNewProductChange}
                        required
                      />
                      {formErrors.price && (
                        <div className="invalid-feedback">{formErrors.price}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select 
                      className={`form-control ${formErrors.category ? 'is-invalid' : ''}`}
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleNewProductChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {allCategories.map((category, index) => (
                        <option key={index} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <div className="invalid-feedback">{formErrors.category}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="file">Product File *</label>
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className={`custom-file-input ${formErrors.file ? 'is-invalid' : ''}`}
                          id="file"
                          name="file"
                          onChange={handleNewProductChange}
                          required
                        />
                        <label className="custom-file-label" htmlFor="file">
                          {newProduct.file ? newProduct.file.name : 'Choose file'}
                        </label>
                      </div>
                    </div>
                    {formErrors.file && (
                      <div className="invalid-feedback">{formErrors.file}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="photo">Product Photo</label>
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className="custom-file-input"
                          id="photo"
                          name="photo"
                          onChange={handleNewProductChange}
                        />
                        <label className="custom-file-label" htmlFor="photo">
                          {newProduct.photo ? newProduct.photo.name : 'Choose photo'}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="preview_video">Preview Video (Optional)</label>
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className="custom-file-input"
                          id="preview_video"
                          name="preview_video"
                          onChange={handleNewProductChange}
                          accept="video/*"
                        />
                        <label className="custom-file-label" htmlFor="preview_video">
                          {newProduct.preview_video ? newProduct.preview_video.name : 'Choose video file'}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="live_demo_url">Live Demo URL (Optional)</label>
                    <input 
                      type="url" 
                      className="form-control"
                      id="live_demo_url"
                      name="live_demo_url"
                      value={newProduct.live_demo_url}
                      onChange={handleNewProductChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="is_in_subscription"
                        name="is_in_subscription"
                        checked={newProduct.is_in_subscription}
                        onChange={handleNewProductChange}
                      />
                      <label className="custom-control-label" htmlFor="is_in_subscription">Include in Subscription</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="is_approved"
                        name="is_approved"
                        checked={newProduct.is_approved}
                        onChange={handleNewProductChange}
                      />
                      <label className="custom-control-label" htmlFor="is_approved">Approved</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="is_featured"
                        name="is_featured"
                        checked={newProduct.is_featured}
                        onChange={handleNewProductChange}
                      />
                      <label className="custom-control-label" htmlFor="is_featured">Featured</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => {
                      setShowAddModal(false);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Add Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && currentProduct && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Product: {currentProduct.title}</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentProduct(null);
                    setFormErrors({});
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="form-group">
                    <label htmlFor="edit-title">Title *</label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                      id="edit-title"
                      name="title"
                      value={currentProduct.title}
                      onChange={handleEditProductChange}
                      required
                    />
                    {formErrors.title && (
                      <div className="invalid-feedback">{formErrors.title}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-description">Description *</label>
                    <textarea 
                      className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                      id="edit-description"
                      name="description"
                      rows="3"
                      value={currentProduct.description}
                      onChange={handleEditProductChange}
                      required
                    ></textarea>
                    {formErrors.description && (
                      <div className="invalid-feedback">{formErrors.description}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-price">Price *</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                        id="edit-price"
                        name="price"
                        value={currentProduct.price}
                        onChange={handleEditProductChange}
                        required
                      />
                      {formErrors.price && (
                        <div className="invalid-feedback">{formErrors.price}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-category">Category *</label>
                    <select 
                      className={`form-control ${formErrors.category ? 'is-invalid' : ''}`}
                      id="edit-category"
                      name="category"
                      value={currentProduct.category}
                      onChange={handleEditProductChange}
                    >
                      <option value="">Select Category</option>
                      {allCategories.map((category, index) => (
                        <option key={index} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <div className="invalid-feedback">{formErrors.category}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-file">Product File</label>
                    {currentProduct.file_url && (
                      <div className="mb-2">
                        <a href={currentProduct.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                          View Current File
                        </a>
                      </div>
                    )}
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className="custom-file-input"
                          id="edit-file"
                          name="file"
                          onChange={handleEditProductChange}
                        />
                        <label className="custom-file-label" htmlFor="edit-file">
                          {currentProduct.file && currentProduct.fileChanged 
                            ? currentProduct.file.name 
                            : 'Choose new file'}
                        </label>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Leave empty to keep the current file
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-preview_video">Preview Video (Optional)</label>
                    {currentProduct.preview_video_url && (
                      <div className="mb-2">
                        <a href={currentProduct.preview_video_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                          View Current Preview
                        </a>
                      </div>
                    )}
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className="custom-file-input"
                          id="edit-preview_video"
                          name="preview_video"
                          onChange={handleEditProductChange}
                          accept="video/*"
                        />
                        <label className="custom-file-label" htmlFor="edit-preview_video">
                          {currentProduct.preview_video && currentProduct.previewVideoChanged 
                            ? currentProduct.preview_video.name 
                            : 'Choose new video file'}
                        </label>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Leave empty to keep the current preview video
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-live_demo_url">Live Demo URL (Optional)</label>
                    <input 
                      type="url" 
                      className="form-control"
                      id="edit-live_demo_url"
                      name="live_demo_url"
                      value={currentProduct.live_demo_url || ''}
                      onChange={handleEditProductChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="edit-is_in_subscription"
                        name="is_in_subscription"
                        checked={currentProduct.is_in_subscription}
                        onChange={handleEditProductChange}
                      />
                      <label className="custom-control-label" htmlFor="edit-is_in_subscription">Include in Subscription</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="edit-is_approved"
                        name="is_approved"
                        checked={currentProduct.is_approved}
                        onChange={handleEditProductChange}
                      />
                      <label className="custom-control-label" htmlFor="edit-is_approved">Approved</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="edit-is_featured"
                        name="is_featured"
                        checked={currentProduct.is_featured}
                        onChange={handleEditProductChange}
                      />
                      <label className="custom-control-label" htmlFor="edit-is_featured">Featured</label>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-photo">Product Photo</label>
                    {currentProduct.photo_url && (
                      <div className="mb-2">
                        <a href={currentProduct.photo_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                          View Current Photo
                        </a>
                      </div>
                    )}
                    <div className="input-group">
                      <div className="custom-file">
                        <input 
                          type="file" 
                          className="custom-file-input"
                          id="edit-photo"
                          name="photo"
                          onChange={handleEditProductChange}
                        />
                        <label className="custom-file-label" htmlFor="edit-photo">
                          {currentProduct.photo ? currentProduct.photo.name : 'Choose new photo'}
                        </label>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Leave empty to keep the current photo
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentProduct(null);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Update Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
