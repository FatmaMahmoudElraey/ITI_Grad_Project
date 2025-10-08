import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';
import { loadUser } from './authSlice';

// No-op auth header - cookies will be sent automatically by axios
const getAuthHeader = () => ({});

// Fetch all products for the seller, including non-approved ones
export const fetchSellerProducts = createAsyncThunk(
  'sellerProducts/fetchAll',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get the current user from state
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      // If user isn't loaded, try loading it
      if (!sellerId) {
        try {
          await dispatch(loadUser()).unwrap();
        } catch (e) {
          return rejectWithValue('User not authenticated. Please log in.');
        }
      }

      const updatedAuth = getState().auth;
      const updatedSellerId = updatedAuth.user?.id;
      if (!updatedSellerId) {
        return rejectWithValue('User ID not found after attempting to load user. Please log in.');
      }
      
      // Fetch all products, including non-approved ones
      // Use the regular products endpoint since there's no specific seller endpoint
  const response = await axios.get(ENDPOINTS.PRODUCTS);
      
      // Filter products to only include those belonging to the current seller
      const allProducts = response.data || [];
      const sellerIdStr = String(sellerId);
      
      const sellerProducts = allProducts.filter(product => {
        return (
          (product.seller && String(product.seller) === sellerIdStr) || 
          (product.seller_id && String(product.seller_id) === sellerIdStr) ||
          (product.user && String(product.user) === sellerIdStr) ||
          (product.user_id && String(product.user_id) === sellerIdStr) ||
          // Also check nested objects
          (product.seller && product.seller.id && String(product.seller.id) === sellerIdStr) ||
          (product.user && product.user.id && String(product.user.id) === sellerIdStr)
        );
      });
      
      return sellerProducts;
    } catch (error) {
      const serverMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      return rejectWithValue(`Could not fetch seller products: ${serverMsg}`);
    }
  }
);

// Fetch a single product by ID
export const fetchProductById = createAsyncThunk(
  'sellerProducts/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ENDPOINTS.PRODUCTS}${productId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Could not fetch product details'
      );
    }
  }
);

// Create a new product
export const createSellerProduct = createAsyncThunk(
  'sellerProducts/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.PRODUCTS, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not create product'
      );
    }
  }
);

// Update a product
export const updateSellerProduct = createAsyncThunk(
  'sellerProducts/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${ENDPOINTS.PRODUCTS}${productId}/`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not update product'
      );
    }
  }
);

// Delete a product
export const deleteSellerProduct = createAsyncThunk(
  'sellerProducts/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${ENDPOINTS.PRODUCTS}${productId}/`);
      return productId;
    } catch (error) {
      // Provide more detailed error message
      let errorMessage = 'Could not delete product';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to delete this product';
        } else if (error.response.status === 404) {
          errorMessage = 'Product not found or already deleted';
        } else if (error.response.data) {
          errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : 'Server error occurred while deleting product';
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const sellerProductsSlice = createSlice({
  name: 'sellerProducts',
  initialState: {
    items: [],
    currentProduct: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearSellerProductsState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Seller Products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch seller products';
      })
      
      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        // Also update the item in the items array if it exists
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product details';
      })
      
      // Create Product
      .addCase(createSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = 'Product created successfully';
      })
      .addCase(createSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create product';
      })
      
      // Update Product
      .addCase(updateSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Update in items array
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update currentProduct if it matches
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.success = 'Product updated successfully';
      })
      .addCase(updateSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      })
      
      // Delete Product
      .addCase(deleteSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        // Clear currentProduct if it was the deleted one
        if (state.currentProduct && state.currentProduct.id === action.payload) {
          state.currentProduct = null;
        }
        state.success = 'Product deleted successfully';
      })
      .addCase(deleteSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const { clearError, clearSuccess, clearSellerProductsState, clearCurrentProduct } = sellerProductsSlice.actions;

export default sellerProductsSlice.reducer;
