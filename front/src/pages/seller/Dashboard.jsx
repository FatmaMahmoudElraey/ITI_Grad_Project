import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../../store/slices/authSlice";
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiClock, 
  FiTrendingUp,
  FiEye,
  FiCreditCard
} from "react-icons/fi";
import { FaBoxOpen, FaChartPie, FaChartBar } from "react-icons/fa";
import Sidebar from "../../components/Seller/Sidebar";
import DashboardCard from "../../components/Seller/DashboardCard";
import DataTable from "../../components/Seller/DataTable";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  fetchDashboardStats, 
  fetchMonthlySales, 
  fetchCategoryDistribution, 
  fetchRecentOrders, 
  fetchPopularProducts,
  generateReport 
} from "../../store/slices/dashboardApiSlice";
import '../../assets/css/dashboard/dash.css';
import '../../assets/css/dashboard/loading-indicators.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dashboardState, setDashboardState] = useState({
    loading: {
      stats: true,
      monthlySales: true,
      categories: true,
      recentOrders: true,
      popularProducts: true
    },
    error: null,
    stats: null,
    monthlySales: [],
    categories: [],
    recentOrders: [],
    popularProducts: []
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Get auth state from Redux
  const { isAuthenticated, user, loading: authLoading } = useSelector(state => state.auth);

  // Load user data if not already loaded
  useEffect(() => {
    if (!user && !authLoading) {
      dispatch(loadUser());
    }
  }, [dispatch, user, authLoading]);

  // Load dashboard data when user is authenticated
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !user) {
        return; // Don't load data if user is not authenticated
      }

      try {
        // Fetch dashboard stats
        setDashboardState(prev => ({
          ...prev,
          loading: { ...prev.loading, stats: true }
        }));
        
        const statsResponse = await dispatch(fetchDashboardStats()).unwrap();
        
        setDashboardState(prev => ({
          ...prev,
          stats: statsResponse,
          loading: { ...prev.loading, stats: false }
        }));

        // Fetch monthly sales data
        setDashboardState(prev => ({
          ...prev,
          loading: { ...prev.loading, monthlySales: true }
        }));
        
        const monthlySalesResponse = await dispatch(fetchMonthlySales()).unwrap();
        
        setDashboardState(prev => ({
          ...prev,
          monthlySales: monthlySalesResponse,
          loading: { ...prev.loading, monthlySales: false }
        }));

        // Fetch category distribution
        setDashboardState(prev => ({
          ...prev,
          loading: { ...prev.loading, categories: true }
        }));
        
        const categoryResponse = await dispatch(fetchCategoryDistribution()).unwrap();
        
        setDashboardState(prev => ({
          ...prev,
          categories: categoryResponse,
          loading: { ...prev.loading, categories: false }
        }));

        // Fetch recent orders
        setDashboardState(prev => ({
          ...prev,
          loading: { ...prev.loading, recentOrders: true }
        }));
        
        const ordersResponse = await dispatch(fetchRecentOrders()).unwrap();
        
        // Ensure amount is number
        const processedOrders = ordersResponse.map(order => ({
          ...order,
          amount: typeof order.amount === 'string' 
            ? parseFloat(order.amount.replace(/[^0-9.]/g, '')) 
            : order.amount
        }));
        
        setDashboardState(prev => ({
          ...prev,
          recentOrders: processedOrders,
          loading: { ...prev.loading, recentOrders: false }
        }));

        // Fetch popular products
        setDashboardState(prev => ({
          ...prev,
          loading: { ...prev.loading, popularProducts: true }
        }));
        
        const productsResponse = await dispatch(fetchPopularProducts()).unwrap();
        
        setDashboardState(prev => ({
          ...prev,
          popularProducts: productsResponse,
          loading: { ...prev.loading, popularProducts: false }
        }));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardState(prev => ({
          ...prev,
          loading: {
            stats: false,
            monthlySales: false,
            categories: false,
            recentOrders: false,
            popularProducts: false
          },
          error: error.message || "Failed to load dashboard data"
        }));
      }
    };

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, dispatch]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await dispatch(generateReport('sales')).unwrap();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (value) => {
    const num = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.]/g, '')) 
      : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num || 0);
  };

  // Chart data configurations
  const salesChartData = {
    labels: dashboardState.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: dashboardState.monthlySales.map(item => item.sales),
        backgroundColor: 'rgba(108, 92, 231, 0.7)',
        borderColor: 'rgba(108, 92, 231, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const categoryDistributionData = {
    labels: dashboardState.categories.map(cat => cat.name || cat.label),
    datasets: [{
      data: dashboardState.categories.map(cat => cat.product_count || cat.productCount),
      backgroundColor: [
        'rgba(108, 92, 231, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)'
      ],
      borderColor: [
        'rgba(108, 92, 231, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label 
              ? `${context.dataset.label}: ${formatCurrency(context.raw)}`
              : formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  if (dashboardState.loading.stats || dashboardState.loading.monthlySales || dashboardState.loading.categories || dashboardState.loading.recentOrders || dashboardState.loading.popularProducts) {
    return (
      <div className="dashboard-container">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="card loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (dashboardState.error) {
    return (
      <div className="dashboard-container">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="card error-content">
            <p>{dashboardState.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="button button-primary"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="dashboard-header-container">
          <h1 className="dashboard-header">Seller Dashboard</h1>
          <div className="dashboard-actions">
            <button 
              className={`button button-primary ${isGeneratingReport ? 'loading' : ''}`}
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              <FiTrendingUp className="icon" />
              {isGeneratingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <DashboardCard 
            title="Total Sales" 
            value={dashboardState.stats ? formatCurrency(dashboardState.stats.total_sales || dashboardState.stats.totalSales || 0) : 'Loading...'} 
            icon={<FiDollarSign className="card-icon" />}
            trend={dashboardState.stats?.sales_trend ? { 
              value: dashboardState.stats.sales_trend.value || 0, 
              direction: dashboardState.stats.sales_trend.direction || 'up', 
              label: "vs last month" 
            } : null}
            loading={dashboardState.loading.stats}
          />
          <DashboardCard 
            title="Products Listed" 
            value={dashboardState.stats ? (dashboardState.stats.total_products || dashboardState.stats.totalProducts || 0) : 'Loading...'} 
            icon={<FiShoppingBag className="card-icon" />}
            trend={dashboardState.stats?.products_trend ? { 
              value: dashboardState.stats.products_trend.value || 0, 
              direction: dashboardState.stats.products_trend.direction || 'up', 
              label: "new this month" 
            } : null}
            loading={dashboardState.loading.stats}
          />
          <DashboardCard 
            title="Pending Orders" 
            value={dashboardState.stats ? (dashboardState.stats.pending_orders || dashboardState.stats.pendingOrders || 0) : 'Loading...'} 
            icon={<FiClock className="card-icon" />}
            loading={dashboardState.loading.stats}
          />
          {/* Total Revenue card removed */}
        </div>

        <div className="charts-section">
          <div className="card chart-container">
            <div className="chart-header">
              <FaChartBar className="chart-icon" />
              <h3 className="chart-title">Monthly Sales</h3>
            </div>
            <div className="chart-wrapper">
              {dashboardState.loading.monthlySales ? (
                <div className="loading-indicator">Loading sales data...</div>
              ) : (
                <Bar data={salesChartData} options={chartOptions} />
              )}
            </div>
          </div>
          
          <div className="card chart-container">
            <div className="chart-header">
              <FaChartPie className="chart-icon" />
              <h3 className="chart-title">Category Distribution</h3>
            </div>
            <div className="chart-wrapper">
              {dashboardState.loading.categories ? (
                <div className="loading-indicator">Loading category data...</div>
              ) : (
                <Pie data={categoryDistributionData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders section removed */}
      </main>
    </div>
  );
}