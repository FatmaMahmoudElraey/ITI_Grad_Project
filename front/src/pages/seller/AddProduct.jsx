import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Seller/Sidebar';
import { FiUpload, FiX } from 'react-icons/fi';
import { FaTag, FaFileAlt, FaVideo, FaImage, FaLink, FaDollarSign, FaSave } from 'react-icons/fa';
import axios from 'axios';
import '../../assets/css/dashboard/dash.css';
import { BASE_URL } from '../../api/constants';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: [],
    file: null,
    preview_video: null,
    photo: null,
    live_demo_url: ''
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Fetch categories and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`);
        setAllCategories(categoriesResponse.data);
        
        const tagsResponse = await axios.get(`${BASE_URL}/api/tags/`);
        setAllTags(tagsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Using cookie-based auth; axios will send cookies automatically (withCredentials=true)

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.file) {
      newErrors.file = 'Product file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // If it's a photo, create a preview
      if (name === 'photo' && files[0]) {
        setImagePreviews([URL.createObjectURL(files[0])]);
      }
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      tags: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      
      // For category, we need to send the ID
      if (formData.category) {
        formDataObj.append('category', formData.category);
      }
      
      // Add tags
      formData.tags.forEach(tagId => {
        formDataObj.append('tags', tagId);
      });
      
      if (formData.file) {
        formDataObj.append('file', formData.file);
      }
      
      if (formData.preview_video) {
        formDataObj.append('preview_video', formData.preview_video);
      }
      
      if (formData.photo) {
        formDataObj.append('photo', formData.photo);
      }
      
      if (formData.live_demo_url) {
        formDataObj.append('live_demo_url', formData.live_demo_url);
      }
      
      const response = await axios.post(`${BASE_URL}/api/products/`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/seller/products', { 
        state: { 
          message: 'Product added successfully!',
          messageType: 'success'
        } 
      });
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({
          submit: 'Failed to add product. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Add New Product</h1>
        </div>
        
        <div className="form-card fancy-card">
          {errors.submit && (
            <div className="alert error">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="product-form p-4" style={{boxShadow:"0 10px 30px rgba(0, 0, 0, 0.2)", maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden', width: '100%', maxWidth: '1200px', margin: '20px auto'}}>
            <div className="scrollable-form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="product-title">
                    <FaTag className="form-icon" /> Title *
                  </label>
                  <input
                    id="product-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`fancy-input ${errors.title ? 'invalid' : ''}`}
                    placeholder="Enter product title"
                    required
                  />
                  {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-category">
                    <FaTag className="form-icon" /> Category *
                  </label>
                  <select
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`fancy-select ${errors.category ? 'invalid' : ''}`}
                    required
                  >
                    <option value="">Select a category</option>
                    {allCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="product-price">
                    <FaDollarSign className="form-icon" /> Price ($) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`fancy-input ${errors.price ? 'invalid' : ''}`}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-tags">
                    <FaTag className="form-icon" /> Tags
                  </label>
                  <select
                    id="product-tags"
                    name="tags"
                    multiple
                    value={formData.tags}
                    onChange={handleTagChange}
                    className="fancy-select tag-select"
                  >
                    {allTags.map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <small className="form-text">Hold Ctrl (or Cmd) to select multiple tags</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="product-description">
                    <FaFileAlt className="form-icon" /> Description *
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`fancy-textarea ${errors.description ? 'invalid' : ''}`}
                    rows={4}
                    maxLength={500}
                    placeholder="Product description"
                    required
                  />
                  <div className="char-count">{formData.description.length}/500</div>
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-file">
                    <FaFileAlt className="form-icon" /> Product File *
                  </label>
                  <div className="fancy-file-input">
                    <input
                      id="product-file"
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className={errors.file ? 'invalid' : ''}
                      required
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.file ? formData.file.name : 'Choose file'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  {errors.file && <span className="error-message">{errors.file}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-photo">
                    <FaImage className="form-icon" /> Product Photo
                  </label>
                  <div className="fancy-file-input">
                    <input
                      id="product-photo"
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.photo ? formData.photo.name : 'Choose photo'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="image-preview">
                      <img src={imagePreviews[0]} alt="Product preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-preview-video">
                    <FaVideo className="form-icon" /> Preview Video (Optional)
                  </label>
                  <div className="fancy-file-input">
                    <input
                      id="product-preview-video"
                      type="file"
                      name="preview_video"
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.preview_video ? formData.preview_video.name : 'Choose video'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-live-demo">
                    <FaLink className="form-icon" /> Live Demo URL (Optional)
                  </label>
                  <input
                    id="product-live-demo"
                    type="url"
                    name="live_demo_url"
                    value={formData.live_demo_url}
                    onChange={handleChange}
                    className="fancy-input"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/seller/products')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  <><FaSave className="button-icon" /> Add Product</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <style jsx="true">{`
        .fancy-card {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border: none;
          overflow: hidden;
          background: #fff;
          transition: all 0.3s ease;
        }
        
        .fancy-card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .scrollable-form-container {
          max-height: 70vh;
          overflow-y: auto;
          padding: 0 20px;
          margin-bottom: 15px;
          scrollbar-width: thin;
          scrollbar-color: #4a6cf7 #f1f1f1;
        }
        
        .scrollable-form-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollable-form-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .scrollable-form-container::-webkit-scrollbar-thumb {
          background: #4a6cf7;
          border-radius: 10px;
        }
        
        .scrollable-form-container::-webkit-scrollbar-thumb:hover {
          background: #3a5bd9;
        }
        
        .form-icon {
          margin-right: 8px;
          color: #4a6cf7;
        }
        
        .form-group {
          margin-bottom: 24px;
          position: relative;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 0.95rem;
        }
        
        .fancy-input, .fancy-select, .fancy-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .fancy-input:focus, .fancy-select:focus, .fancy-textarea:focus {
          border-color: #4a6cf7;
          box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
          outline: none;
        }
        
        .fancy-input.invalid, .fancy-select.invalid, .fancy-textarea.invalid {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
        }
        
        .fancy-file-input {
          position: relative;
        }
        
        .fancy-file-input input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          z-index: 2;
        }
        
        .file-input-display {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .file-name {
          flex: 1;
          padding: 12px 16px;
          background: #f9f9f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-right: 1px solid #ddd;
        }
        
        .browse-btn {
          padding: 12px 20px;
          background: #4a6cf7;
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .browse-btn:hover {
          background: #3a5bd9;
        }
        
        .tag-select {
          min-height: 120px;
        }
        
        .char-count {
          position: absolute;
          right: 10px;
          bottom: 5px;
          font-size: 0.8rem;
          color: #777;
        }
        
        .image-preview {
          margin-top: 15px;
          text-align: center;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
        }
        
        .form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }
        
        .primary-button, .secondary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .primary-button {
          background: #4a6cf7;
          color: white;
          border: none;
          box-shadow: 0 4px 6px rgba(74, 108, 247, 0.2);
        }
        
        .primary-button:hover {
          background: #3a5bd9;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(74, 108, 247, 0.3);
        }
        
        .secondary-button {
          background: white;
          color: #555;
          border: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .secondary-button:hover {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .button-icon {
          margin-right: 8px;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 5px;
          display: block;
          font-weight: 500;
        }
        
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}