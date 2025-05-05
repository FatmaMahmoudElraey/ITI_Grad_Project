import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all products for the seller, including non-approved ones
export const fetchSellerProducts = createAsyncThunk(
  'sellerProducts/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the current user from state
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }
      
      // Fetch all products, including non-approved ones
      // Use the regular products endpoint since there's no specific seller endpoint
      const response = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
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
      
      console.log('Filtered seller products:', sellerProducts);
      return sellerProducts;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return rejectWithValue(
        typeof error.response?.data === 'object' ? 'Could not fetch seller products' : error.response?.data || 'Could not fetch seller products'
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
          ...getAuthHeader(),
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
          ...getAuthHeader(),
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
      await axios.delete(`${ENDPOINTS.PRODUCTS}${productId}/`, {
        headers: getAuthHeader()
      });
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not delete product'
      );
    }
  }
);

const sellerProductsSlice = createSlice({
  name: 'sellerProducts',
  initialState: {
    items: [],
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
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
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
        state.success = 'Product deleted successfully';
      })
      .addCase(deleteSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const { clearError, clearSuccess, clearSellerProductsState } = sellerProductsSlice.actions;

export default sellerProductsSlice.reducer;
