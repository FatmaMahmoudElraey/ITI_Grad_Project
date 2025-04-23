// src/pages/Seller/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import ProductForm from "../../components/Seller/ProductForm";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
    imageUrl: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - in real app this would come from API
        const mockProduct = {
          id: productId,
          name: "Premium WordPress Theme",
          description: "A modern, responsive WordPress theme with multiple layout options and custom widgets.",
          price: "59.99",
          category: "themes",
          stock: "25",
          imageUrl: "https://via.placeholder.com/300"
        };
        
        setProductData(mockProduct);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setErrors({ fetch: "Failed to load product data." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProductData((prevData) => ({
        ...prevData,
        image: file,
        imageUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const validationErrors = {};
    if (!productData.name.trim()) validationErrors.name = "Product name is required";
    if (!productData.description.trim()) validationErrors.description = "Description is required";
    if (!productData.price || isNaN(productData.price) || productData.price <= 0) {
      validationErrors.price = "Price must be a positive number";
    }
    if (!productData.category) validationErrors.category = "Category is required";
    if (!productData.stock || isNaN(productData.stock) || productData.stock < 0) {
      validationErrors.stock = "Stock must be a non-negative number";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real app, you would handle image upload if changed
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('stock', productData.stock);
      if (productData.image) {
        formData.append('image', productData.image);
      }

      // Simulate API call
      console.log("Updating product:", productData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect after successful update
      navigate("/seller/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      setErrors({ submit: "Failed to update product. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div>  <div className="loading-spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", backgroundColor: "#f9f9f9" }}>
        <h1 style={{ color: "rgb(102, 15, 241)" }}>Edit Product</h1>
        <ProductForm 
          productData={productData}
          errors={errors}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Update Product"
        />
      </main>
    </div>
  );
}