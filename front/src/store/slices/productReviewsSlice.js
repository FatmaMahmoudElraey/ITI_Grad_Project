import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all reviews for a specific product
export const fetchProductReviews = createAsyncThunk(
  'productReviews/fetchByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ENDPOINTS.PRODUCT_REVIEWS}?product=${productId}`, {
        headers: getAuthHeader()
      });
      return { productId, reviews: response.data };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? 'Could not fetch product reviews' 
          : error.response?.data || 'Could not fetch product reviews'
      );
    }
  }
);

// Fetch all reviews for all products of a seller
export const fetchSellerProductReviews = createAsyncThunk(
  'productReviews/fetchBySeller',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the current user from state
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }
      
      // First, get all products belonging to the seller
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      // Filter products to only include those belonging to the current seller
      const allProducts = productsResponse.data || [];
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
      
      console.log('Seller products for reviews:', sellerProducts);
      
      if (sellerProducts.length === 0) {
        return [];
      }
      
      // Get all product IDs
      const productIds = sellerProducts.map(product => product.id);
      
      // Fetch all reviews
      const reviewsResponse = await axios.get(ENDPOINTS.PRODUCT_REVIEWS, {
        headers: getAuthHeader()
      });
      
      const allReviews = reviewsResponse.data || [];
      
      // Filter reviews to only include those for the seller's products
      const sellerProductReviews = allReviews.filter(review => {
        // Check if the review's product ID is in our list of seller product IDs
        return productIds.includes(review.product);
      });
      
      console.log('Filtered seller product reviews:', sellerProductReviews);
      
      // Add product details to each review
      const reviewsWithProductDetails = sellerProductReviews.map(review => {
        const product = sellerProducts.find(p => p.id === review.product);
        return {
          ...review,
          productDetails: product || null
        };
      });
      
      return reviewsWithProductDetails;
    } catch (error) {
      console.error('Error fetching seller product reviews:', error);
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? 'Could not fetch seller product reviews' 
          : error.response?.data || 'Could not fetch seller product reviews'
      );
    }
  }
);

const productReviewsSlice = createSlice({
  name: 'productReviews',
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
    clearProductReviewsState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        // Find existing reviews for this product and replace them
        const existingReviews = state.items.filter(review => 
          review.product !== action.payload.productId
        );
        state.items = [...existingReviews, ...action.payload.reviews];
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product reviews';
      })
      
      // Fetch Seller Product Reviews
      .addCase(fetchSellerProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch seller product reviews';
      });
  },
});

export const { clearError, clearSuccess, clearProductReviewsState } = productReviewsSlice.actions;

export default productReviewsSlice.reducer;
