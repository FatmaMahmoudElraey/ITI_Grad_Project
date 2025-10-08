import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../api/constants';

// No-op auth header (we use cookies for auth)
const getAuthHeader = () => ({});

// Cart operations
export const fetchCart = createAsyncThunk(
  'cartApi/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart/`, {
        headers: getAuthHeader()
      });
      return response.data[0] || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

export const saveCart = createAsyncThunk(
  'cartApi/saveCart',
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/cart/`, cartData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to save cart');
    }
  }
);

export const addCartItem = createAsyncThunk(
  'cartApi/addCartItem',
  async (cartItem, { rejectWithValue }) => {
    try {
      // First check if cart exists
      let userCart = null;
      try {
        const cartListResponse = await axios.get(`${BASE_URL}/api/cart/`, {
          headers: getAuthHeader()
        });
        if (cartListResponse.data && cartListResponse.data.length > 0) {
          userCart = cartListResponse.data[0]; // Get the first cart
        }

        // If cart exists, check if item already exists in cart
        if (userCart && userCart.items) {
          const existingItem = userCart.items.find(
            item => item.product.id === cartItem.product_id
          );

          if (existingItem) {
            // Item exists, update its quantity instead
            const updateResponse = await axios.patch(
              `${BASE_URL}/api/cart-items/${existingItem.id}/`,
              { quantity: existingItem.quantity + cartItem.quantity },
              { headers: getAuthHeader() }
            );
            return updateResponse.data;
          }
        }
      } catch (cartError) {
        console.log('Cart not found or other error fetching cart:', cartError);
      }

      // Try to create a new cart item
      const response = await axios.post(`${BASE_URL}/api/cart-items/`, cartItem, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add cart item');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cartApi/updateCartItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/cart-items/${id}/`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update cart item');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cartApi/updateCartItemQuantity',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/cart-items/${id}/`, { quantity }, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update cart item quantity');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cartApi/removeCartItem',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/cart-items/${id}/`, {
        headers: getAuthHeader()
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove cart item');
    }
  }
);

// Order operations
export const createOrder = createAsyncThunk(
  'cartApi/createOrder',
  async (orderData = {}, { rejectWithValue, getState }) => {
    try {
      // Extract the billing information from orderData
      const {
        address, city, state, zipCode, phone, country,
        firstName, lastName, email, payment_status = 'P'
      } = orderData;

      // First, fetch the cart to get the items
      let cartItems = [];
      let cartResponseData;
      let userCart = null;

      try {
        const cartListResponse = await axios.get(`${BASE_URL}/api/cart/`, {
          headers: getAuthHeader()
        });
        cartResponseData = cartListResponse.data; // Store raw response data for logging


        // Check if the response is an array and has at least one cart
        if (Array.isArray(cartResponseData) && cartResponseData.length > 0) {
          userCart = cartResponseData[0]; // Get the first cart object

          if (userCart && userCart.items && userCart.items.length > 0) {
            cartItems = userCart.items.map(item => ({
              product_id: item.product.id,
              quantity: item.quantity
            }));
          } else {
            return rejectWithValue('Your cart is empty. Please add items before checking out.');
          }
        } else {
          return rejectWithValue('Could not find your cart. Please try adding an item again.');
        }
      } catch (cartError) {

        // Fallback: Try to use items from the Redux store
        const { cart } = getState();

        if (cart && cart.items && cart.items.length > 0) {
          cartItems = cart.items.map(item => ({
            product_id: item.id || item.template_id,
            quantity: item.quantity
          }));
        } else {
          return rejectWithValue('Could not verify cart contents. Please try again.');
        }
      }

      // Final check: If we still don't have any cart items, reject
      if (!cartItems.length) {
        return rejectWithValue('Your cart is empty. Please add items before checking out.');
      }


      // Make the API request with items and shipping info included
      const response = await axios.post(
        `${BASE_URL}/api/orders/`,
        {
          payment_status: payment_status,
          items: cartItems,
          // Add these fields for PayMob billing data:
          shipping_address: address,
          phone: phone,
          city: city,
          state: state,
          postal_code: zipCode,
          country: country,
          first_name: firstName,
          last_name: lastName,
          email: email
        },
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {


      return rejectWithValue(error.response?.data || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'cartApi/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'cartApi/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/${orderId}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch order details');
    }
  }
);

// Reducer
const initialState = {
  loading: false,
  error: null,
  cart: null,
  orders: [],
  currentOrder: null,
};

// This is a placeholder reducer - we'll use the async thunks directly with the existing cart slice
export default function cartApiReducer(state = initialState, action) {
  return state;
}
