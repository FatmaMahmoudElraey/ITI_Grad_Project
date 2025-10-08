import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaList } from 'react-icons/fa';
import DataTable from '../../components/Admin/DataTable';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get auth header
  // Using cookie-based auth; axios will send cookies automatically (withCredentials=true)

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const categoriesResponse = await axios.get('http://localhost:8000/api/categories/');
        
        // Fetch all products to count products per category
        const productsResponse = await axios.get('http://localhost:8000/api/products/');
        setProducts(productsResponse.data);
        
        // Count products for each category
        const categoriesWithCount = categoriesResponse.data.map(category => {
          const productCount = productsResponse.data.filter(
            product => product.category === category.id || 
                      (product.category_name && product.category_name === category.name)
          ).length;
          
          return {
            ...category,
            product_count: productCount
          };
        });
        
        setCategories(categoriesWithCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch products for a specific category
  const fetchCategoryProducts = async (categoryId, categoryName) => {
    try {
      setLoading(true);
      
      // First try by ID
      let filteredProducts = products.filter(product => 
        product.category === categoryId || 
        (product.category_name && product.category_name === categoryName)
      );
      
      // If no products found locally, try fetching from API
      if (filteredProducts.length === 0) {
        try {
          const response = await axios.get(`http://localhost:8000/api/products/?category=${categoryId}`);
          filteredProducts = response.data;
        } catch (error) {
          console.error(`Error fetching products for category ${categoryId}:`, error);
        }
      }
      
      setCategoryProducts(filteredProducts);
      setLoading(false);
    } catch (error) {
      console.error(`Error processing products for category ${categoryId}:`, error);
      setCategoryProducts([]);
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchCategoryProducts(category.id, category.name);
  };

  // Handle category edit
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setShowEditModal(true);
  };

  // Handle category delete
  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/categories/${category.id}/`, {
          headers: getAuthHeader()
        });
        setCategories(categories.filter(c => c.id !== category.id));
        if (selectedCategory && selectedCategory.id === category.id) {
          setSelectedCategory(null);
          setCategoryProducts([]);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Handle input change for new category form
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  // Handle input change for edit category form
  const handleEditCategoryChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  // Validate category form
  const validateCategoryForm = (category) => {
    const errors = {};
    
    if (!category.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    return errors;
  };

  // Handle add category form submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateCategoryForm(newCategory);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/api/categories/', newCategory, {
        headers: getAuthHeader()
      });
      
      // Add the new category to the list
      const newCategoryWithCount = {
        ...response.data,
        product_count: 0
      };
      
      setCategories([...categories, newCategoryWithCount]);
      
      // Reset form and close modal
      setNewCategory({
        name: ''
      });
      setFormErrors({});
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to add category. Please try again.');
      }
    }
  };

  // Handle edit category form submission
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateCategoryForm(currentCategory);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Only send the name field to the API
      const categoryData = {
        name: currentCategory.name
      };
      
      await axios.put(`http://localhost:8000/api/categories/${currentCategory.id}/`, categoryData, {
        headers: getAuthHeader()
      });
      
      // Update the category in the list
      const updatedCategories = categories.map(category => 
        category.id === currentCategory.id ? { ...category, name: currentCategory.name } : category
      );
      
      setCategories(updatedCategories);
      
      // Reset form and close modal
      setCurrentCategory(null);
      setFormErrors({});
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        alert('Failed to update category. Please try again.');
      }
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Category table columns
  const categoryColumns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { 
      field: 'product_count', 
      header: 'Products', 
      sortable: true,
      render: (item) => item.product_count || '0'
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="btn-group">
          <button 
            className="btn btn-sm btn-primary mr-1" 
            onClick={() => handleCategorySelect(item)}
            title="View Products"
          >
            <FaList />
          </button>
          <button 
            className="btn btn-sm btn-info mr-1" 
            onClick={() => handleEditCategory(item)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => handleDeleteCategory(item)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  // Product table columns
  const productColumns = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'title', header: 'Product', sortable: true },
    { 
      field: 'price', 
      header: 'Price', 
      sortable: true,
      render: (item) => formatCurrency(item.price)
    },
    { 
      field: 'is_approved', 
      header: 'Approved', 
      sortable: true,
      render: (item) => item.is_approved ? 'Yes' : 'No'
    },
    { 
      field: 'is_featured', 
      header: 'Featured', 
      sortable: true,
      render: (item) => item.is_featured ? 'Yes' : 'No'
    },
    { 
      field: 'created_at', 
      header: 'Created At', 
      sortable: true,
      render: (item) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  if (loading && !selectedCategory) {
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
                  <p className="mt-2">Loading categories...</p>
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
              <h1 className="m-0">Categories Management</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Categories</li>
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
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="mr-1" /> Add New Category
              </button>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary" type="button">
                    <FaSearch />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Categories Section */}
            <div className={selectedCategory ? "col-md-6" : "col-md-12"}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">All Categories</h3>
                </div>
                <div className="card-body table-responsive p-0">
                  {categories.length > 0 ? (
                    <DataTable 
                      columns={categoryColumns} 
                      data={categories} 
                      itemsPerPage={10}
                      sortable={true}
                    />
                  ) : (
                    <div className="alert alert-info m-3">
                      No categories found. Add a new category to get started.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Section (shown when a category is selected) */}
            {selectedCategory && (
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Products in {selectedCategory.name}</h3>
                    <div className="card-tools">
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setSelectedCategory(null);
                          setCategoryProducts([]);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="card-body table-responsive p-0">
                    {loading ? (
                      <div className="text-center p-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2">Loading products...</p>
                      </div>
                    ) : categoryProducts.length > 0 ? (
                      <DataTable 
                        columns={productColumns} 
                        data={categoryProducts} 
                        itemsPerPage={10}
                        sortable={true}
                      />
                    ) : (
                      <div className="alert alert-info m-3">
                        No products found in this category.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add New Category</h4>
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
              <form onSubmit={handleAddCategory}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Category Name *</label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={newCategory.name}
                      onChange={handleNewCategoryChange}
                      required
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
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
                  <button type="submit" className="btn btn-primary">Add Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Category Modal */}
      {showEditModal && currentCategory && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Category: {currentCategory.name}</h4>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentCategory(null);
                    setFormErrors({});
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdateCategory}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="edit-name">Category Name *</label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      id="edit-name"
                      name="name"
                      value={currentCategory.name}
                      onChange={handleEditCategoryChange}
                      required
                    />
                    {formErrors.name && (
                      <div className="invalid-feedback">{formErrors.name}</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentCategory(null);
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Update Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
