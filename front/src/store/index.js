import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import usersReducer from './slices/usersSlice';
import cartReducer from './slices/cartSlice';
import cartApiReducer from './slices/cartApiSlice';
import dashboardApiReducer from './slices/dashboardApiSlice';
import sellerProductsReducer from './slices/sellerProductsSlice';
import sellerOrdersReducer from './slices/sellerOrdersSlice';
import productReviewsReducer from './slices/productReviewsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    orders: ordersReducer,
    cart: cartReducer,
    cartApi: cartApiReducer,
    dashboardApi: dashboardApiReducer,
    sellerProducts: sellerProductsReducer,
    sellerOrders: sellerOrdersReducer,
    productReviews: productReviewsReducer,
  },
});

export default store;