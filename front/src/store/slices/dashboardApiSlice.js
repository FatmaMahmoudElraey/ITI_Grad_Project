import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL, ENDPOINTS } from '../../api/constants';

// No-op auth header - cookies will be sent automatically by axios
const getAuthHeader = () => ({});

// We'll get the user ID from the state in the thunk

// Dashboard data operations
export const fetchDashboardStats = createAsyncThunk(
  'dashboardApi/fetchStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }

      // Get all products first
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      // Get orders
      const ordersResponse = await axios.get(ENDPOINTS.ORDERS, {
        headers: getAuthHeader()
      });
      
      // Filter products by seller ID manually
      const allProducts = productsResponse.data?.results || productsResponse.data || [];
      
      const products = allProducts.filter(product => {
        // Convert IDs to strings for comparison to handle both number and string IDs
        const sellerIdStr = String(sellerId);
        
        // Check all possible fields where seller ID might be stored
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
      const sellerProductIds = products.map(p => p.id);
      
      // Filter orders by seller ID manually
      const allOrders = ordersResponse.data?.results || ordersResponse.data || [];
      const orders = allOrders.filter(order => {
        // Check if order has items that contain products from this seller
        if (order.items && Array.isArray(order.items)) {
          return order.items.some(item => {
            const productId = item.product_id || (item.product && item.product.id);
            return sellerProductIds.includes(productId);
          });
        }
        return false;
      });
      
      // Count total products
      const totalProducts = products.length;
      
      // Calculate total sales as the sum of all order item prices
      let totalSales = 0;
      
      // Loop through each order to calculate total sales
      orders.forEach(order => {
        try {
          // Check if order has items
          if (order.items && Array.isArray(order.items)) {
            // Loop through each item in the order
            order.items.forEach(item => {
              try {
                // Get the product ID
                const productId = item.product_id || (item.product && item.product.id) || item.product;
                
                // Check if this item's product belongs to the seller
                if (sellerProductIds.includes(productId)) {
                  // Get the item price
                  let itemPrice = 0;
                  if (item.price) {
                    itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  } else if (item.product && item.product.price) {
                    itemPrice = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                  }
                  
                  // Get the quantity
                  const quantity = item.quantity || 1;
                  
                  // Add to total sales
                  totalSales += itemPrice * quantity;
                }
              } catch (itemError) {
                console.log('Error processing order item:', itemError);
              }
            });
          } else if (order.order_items && Array.isArray(order.order_items)) {
            // Process order_items instead
            order.order_items.forEach(item => {
              try {
                // Get the product ID
                const productId = item.product_id || (item.product && item.product.id) || item.product;
                
                // Check if this item's product belongs to the seller
                if (sellerProductIds.includes(productId)) {
                  // Get the item price
                  let itemPrice = 0;
                  if (item.price) {
                    itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  } else if (item.product && item.product.price) {
                    itemPrice = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                  }
                  
                  // Get the quantity
                  const quantity = item.quantity || 1;
                  
                  // Add to total sales
                  totalSales += itemPrice * quantity;
                }
              } catch (itemError) {
                console.log('Error processing order item:', itemError);
              }
            });
          } else if (order.total) {
            // If order has a total field, use that as a fallback
            const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
            
            // Check if any product in this order belongs to the seller
            const belongsToSeller = sellerProductIds.some(id => {
              return order.product_id === id || (order.product && order.product.id === id);
            });
            
            if (belongsToSeller) {
              totalSales += orderTotal;
            }
          }
        } catch (orderError) {
          console.log('Error processing order:', orderError);
        }
      });
      
      // Format totalSales to 2 decimal places
      totalSales = parseFloat(totalSales.toFixed(2));
      
      // Count pending orders
      const pendingOrders = orders.filter(order => 
        order.status === 'P' || order.status === 'Pending' || order.status === 'Processing'
      ).length;
      
      return {
        total_sales: totalSales,
        total_products: totalProducts,
        pending_orders: pendingOrders,
        sales_trend: { value: 8.5, direction: 'up' },
        products_trend: { value: 5.2, direction: 'up' }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchMonthlySales = createAsyncThunk(
  'dashboardApi/fetchMonthlySales',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }

      // Get all orders
      const ordersResponse = await axios.get(ENDPOINTS.ORDERS, {
        headers: getAuthHeader()
      });
      
      // Get all products to identify seller's products
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      // Filter products by seller ID
      const allProducts = productsResponse.data?.results || productsResponse.data || [];
      
      const sellerProducts = allProducts.filter(product => {
        // Convert IDs to strings for comparison to handle both number and string IDs
        const sellerIdStr = String(sellerId);
        
        // Check all possible fields where seller ID might be stored
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
      
      // Get product IDs belonging to this seller
      const sellerProductIds = sellerProducts.map(p => p.id);
      
      // Filter orders that contain products from this seller
      const allOrders = ordersResponse.data?.results || ordersResponse.data || [];
      const orders = allOrders.filter(order => {
        if (order.items && Array.isArray(order.items)) {
          return order.items.some(item => {
            const productId = item.product_id || (item.product && item.product.id);
            return sellerProductIds.includes(productId);
          });
        }
        return false;
      });
      
      // Generate sample monthly data based on real orders
      const currentDate = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Create a map of months with sales data
      const monthlySalesMap = {};
      
      // Initialize all months with zero sales
      for (let i = 0; i < 6; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        monthlySalesMap[monthNames[monthIndex]] = 0;
      }
      
      // Aggregate order data by month
      orders.forEach(order => {
        if (order.created_at) {
          const orderDate = new Date(order.created_at);
          const monthName = monthNames[orderDate.getMonth()];
          
          // Only count orders from the last 6 months
          const monthsDiff = (currentDate.getMonth() - orderDate.getMonth() + 12) % 12;
          if (monthsDiff < 6) {
            const orderTotal = order.total || 0;
            monthlySalesMap[monthName] += (typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal);
          }
        }
      });
      
      // Convert map to array of objects
      const monthlySales = Object.keys(monthlySalesMap)
        .map(month => ({ month, sales: monthlySalesMap[month] }))
        .reverse(); // Show oldest month first
      
      return monthlySales;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch monthly sales data');
    }
  }
);

export const fetchCategoryDistribution = createAsyncThunk(
  'dashboardApi/fetchCategoryDistribution',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }

      // Get categories and all products
      const categoriesResponse = await axios.get(ENDPOINTS.CATEGORIES, {
        headers: getAuthHeader()
      });
      
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      const categories = categoriesResponse.data || [];
      const allProducts = productsResponse.data?.results || productsResponse.data || [];
      
      // Filter products by seller ID
      const products = allProducts.filter(product => 
        product.seller === sellerId || 
        product.seller_id === sellerId ||
        product.user === sellerId ||
        product.user_id === sellerId
      );
      
      // Count products per category
      const categoryDistribution = categories.map(category => {
        const productCount = products.filter(product => 
          product.category === category.id || 
          product.category_id === category.id ||
          product.category_name === category.name
        ).length;
        
        return {
          id: category.id,
          name: category.name,
          product_count: productCount
        };
      });
      
      // Filter out categories with no products
      return categoryDistribution.filter(cat => cat.product_count > 0);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch category distribution data');
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboardApi/fetchRecentOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }

      // Get all orders and products
      const ordersResponse = await axios.get(ENDPOINTS.ORDERS, {
        headers: getAuthHeader()
      });
      
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      // Filter products by seller ID
      const allProducts = productsResponse.data?.results || productsResponse.data || [];
      
      const sellerProducts = allProducts.filter(product => {
        // Convert IDs to strings for comparison to handle both number and string IDs
        const sellerIdStr = String(sellerId);
        
        // Check all possible fields where seller ID might be stored
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
      
      // Get product IDs belonging to this seller
      const sellerProductIds = sellerProducts.map(p => p.id);
      
      // Get all orders
      const allOrders = ordersResponse.data?.results || ordersResponse.data || [];
      
      // Filter orders that might be related to this seller
      const sellerOrders = allOrders.filter(order => {
        try {
          // Check if order has items array and any item contains a product from this seller
          if (order.items && Array.isArray(order.items)) {
            return order.items.some(item => {
              const productId = item.product_id || (item.product && item.product.id) || item.product;
              return sellerProductIds.includes(productId);
            });
          }
          
          // Check if order has order_items array and any item contains a product from this seller
          if (order.order_items && Array.isArray(order.order_items)) {
            return order.order_items.some(item => {
              const productId = item.product_id || (item.product && item.product.id) || item.product;
              return sellerProductIds.includes(productId);
            });
          }
          
          // Check if order directly references a product that belongs to this seller
          if (order.product_id && sellerProductIds.includes(order.product_id)) {
            return true;
          }
          
          if (order.product && order.product.id && sellerProductIds.includes(order.product.id)) {
            return true;
          }
          
          return false;
        } catch (error) {
          console.log('Error filtering order:', error);
          return false;
        }
      });
      
      // Get the 5 most recent orders
      const recentOrders = sellerOrders
        .sort((a, b) => new Date(b.created_at || b.date || Date.now()) - new Date(a.created_at || a.date || Date.now()))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          customer: order.first_name ? `${order.first_name} ${order.last_name || ''}` : 'Customer',
          date: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown date',
          amount: order.total || 0,
          status: getOrderStatus(order.status)
        }));
      
      return recentOrders;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch recent orders');
    }
  }
);

// Helper function to convert order status codes to readable status
function getOrderStatus(statusCode) {
  const statusMap = {
    'P': 'Processing',
    'S': 'Shipped',
    'D': 'Delivered',
    'C': 'Completed'
  };
  
  return statusMap[statusCode] || statusCode || 'Processing';
}

export const fetchPopularProducts = createAsyncThunk(
  'dashboardApi/fetchPopularProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }

      // Get all products
      const productsResponse = await axios.get(ENDPOINTS.PRODUCTS, {
        headers: getAuthHeader()
      });
      
      const allProducts = productsResponse.data?.results || productsResponse.data || [];
      
      // Filter products by seller ID
      const products = allProducts.filter(product => 
        product.seller === sellerId || 
        product.seller_id === sellerId ||
        product.user === sellerId ||
        product.user_id === sellerId
      );
      
      // Sort by some criteria (like price or date added) to simulate popularity
      // In a real app, this would be based on sales data or views
      const popularProducts = products
        .sort((a, b) => b.price - a.price) // Sort by price as a proxy for popularity
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name || product.title,
          price: product.price,
          image: product.image || product.thumbnail,
          category: product.category_name || 'Uncategorized'
        }));
      
      return popularProducts;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch popular products');
    }
  }
);

export const generateReport = createAsyncThunk(
  'dashboardApi/generateReport',
  async (reportType = 'sales', { rejectWithValue, getState, dispatch }) => {
    try {
      // Since we don't have a real report endpoint, we'll simulate generating a report
      // by collecting data we already have
      
      // Get the data based on report type
      let reportData;
      
      if (reportType === 'sales') {
        // Get monthly sales data
        const monthlySalesAction = await dispatch(fetchMonthlySales());
        reportData = monthlySalesAction.payload;
      } else if (reportType === 'products') {
        // Get products data
        const productsAction = await dispatch(fetchPopularProducts());
        reportData = productsAction.payload;
      } else {
        // Get orders data
        const ordersAction = await dispatch(fetchRecentOrders());
        reportData = ordersAction.payload;
      }
      
      // Create a simple text representation of the data
      const reportText = JSON.stringify(reportData, null, 2);
      
      // Create a blob and trigger download
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, reportType };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to generate report');
    }
  }
);

// Reducer
const initialState = {
  loading: {
    stats: false,
    monthlySales: false,
    categoryDistribution: false,
    recentOrders: false,
    popularProducts: false,
    report: false
  },
  error: null,
  stats: null,
  monthlySales: [],
  categoryDistribution: [],
  recentOrders: [],
  popularProducts: []
};

// This is a placeholder reducer - we'll use the async thunks directly with the dashboard component
export default function dashboardApiReducer(state = initialState, action) {
  return state;
}
