// API constants
export const BASE_URL = "https://webify-app-f9068c4398f5.herokuapp.com";

// Endpoints
export const ENDPOINTS = {
  // Authentication
  LOGIN: `${BASE_URL}/api/auth/jwt/create/`,
  REGISTER: `${BASE_URL}/api/auth/users/`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/jwt/refresh/`,
  CUSTOMERS: `${BASE_URL}/api/auth/customers/`,
  USER_DETAILS: `${BASE_URL}/api/auth/users/me/`,
  USER_PROFILE: `${BASE_URL}/api/auth/users/me/profile/`,
  FAVORITES: `${BASE_URL}/api/auth/favorites/`,

  // Chat
  CHAT_MESSAGES: `${BASE_URL}/api/auth/chat-messages/`,

  // Products
  CATEGORIES: `${BASE_URL}/api/categories/`,
  TAGS: `${BASE_URL}/api/tags/`,
  PRODUCTS: `${BASE_URL}/api/products/`,
  LATEST_PRODUCTS: `${BASE_URL}/api/latest-products/`,
  FEATURED_PRODUCTS: `${BASE_URL}/api/products/featured/`,
  PRODUCT_REVIEWS: `${BASE_URL}/api/product-reviews/`,
  PRODUCT_FLAGS: `${BASE_URL}/api/product-flags/`,

  // Orders
  CART: `${BASE_URL}/api/cart/`,
  CART_ITEMS: `${BASE_URL}/api/cart-items/`,
  ORDERS: `${BASE_URL}/api/orders/`,
  SELLER_ORDERS: `${BASE_URL}/api/seller-orders/`, // New endpoint for seller orders
  ORDER_ITEMS: `${BASE_URL}/api/order-items/`,
  SUBSCRIPTION_PLANS: `${BASE_URL}/api/subscription-plans/`,
  SUBSCRIPTIONS: `${BASE_URL}/api/subscriptions/`,
};
