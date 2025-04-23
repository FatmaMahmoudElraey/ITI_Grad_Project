import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import dashboardData from "../../assets/data/dashboardData.json";
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
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: null,
    stats: null,
    monthlySales: [],
    categories: [],
    recentOrders: [],
    popularProducts: []
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Process data
        const categoriesWithCounts = dashboardData.categories.map(cat => {
          const count = dashboardData.popularProducts.filter(
            product => product.category === cat.value
          ).length;
          return { ...cat, productCount: count };
        });

        // Ensure amount is number
        const processedOrders = dashboardData.recentOrders.map(order => ({
          ...order,
          amount: typeof order.amount === 'string' 
            ? parseFloat(order.amount.replace(/[^0-9.]/g, '')) 
            : order.amount
        }));

        setDashboardState({
          loading: false,
          error: null,
          stats: dashboardData.dashboardStats,
          monthlySales: dashboardData.monthlySales,
          categories: categoriesWithCounts,
          recentOrders: processedOrders,
          popularProducts: dashboardData.popularProducts
        });
      } catch (error) {
        setDashboardState(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard data"
        }));
      }
    };

    loadDashboardData();
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGeneratingReport(false);
    // In a real app, this would download a report
    console.log("Report generated");
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
    labels: dashboardState.categories.map(cat => cat.label),
    datasets: [{
      data: dashboardState.categories.map(cat => cat.productCount),
      backgroundColor: [
        'rgba(108, 92, 231, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)'
      ],
      borderWidth: 1
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

  if (dashboardState.loading) {
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
            value={formatCurrency(dashboardState.stats.totalSales)} 
            icon={<FiDollarSign className="card-icon" />}
            trend={{ value: 12.5, direction: 'up', label: "vs last month" }}
          />
          <DashboardCard 
            title="Products Listed" 
            value={dashboardState.stats.totalProducts} 
            icon={<FiShoppingBag className="card-icon" />}
            trend={{ value: 8, direction: 'up', label: "new this month" }}
          />
          <DashboardCard 
            title="Pending Orders" 
            value={dashboardState.stats.pendingOrders} 
            icon={<FiClock className="card-icon" />}
          />
          <DashboardCard 
            title="Total Revenue" 
            value={formatCurrency(dashboardState.stats.totalRevenue)} 
            icon={<FiCreditCard className="card-icon" />}
            trend={{ value: 15.2, direction: 'up', label: "vs last month" }}
          />
        </div>

        <div className="charts-section">
          <div className="card chart-container">
            <div className="chart-header">
              <FaChartBar className="chart-icon" />
              <h3 className="chart-title">Monthly Sales</h3>
            </div>
            <div className="chart-wrapper">
              <Bar data={salesChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="card chart-container">
            <div className="chart-header">
              <FaChartPie className="chart-icon" />
              <h3 className="chart-title">Category Distribution</h3>
            </div>
            <div className="chart-wrapper">
              <Pie data={categoryDistributionData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card data-table-container">
          <div className="table-header-container">
            <div className="table-title-container">
              <FaBoxOpen className="table-icon" />
              <h2 className="table-title">Recent Orders</h2>
            </div>
            <button 
              className="button button-secondary"
              onClick={() => navigate('/seller/orders')}
            >
              <FiEye className="icon" /> View All Orders
            </button>
          </div>
          
          <DataTable
            headers={[
              { key: 'id', label: 'Order ID' },
              { key: 'customer', label: 'Customer' },
              { key: 'date', label: 'Date' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' }
            ]}
            data={dashboardState.recentOrders.map(order => ({
              ...order,
              amount: formatCurrency(order.amount),
              status: (
                <span className={`status-badge ${
                  order.status === 'Completed' ? 'status-completed' :
                  order.status === 'Shipped' ? 'status-shipped' : 'status-processing'
                }`}>
                  {order.status}
                </span>
              )
            }))}
            sortable
            pagination
            itemsPerPage={5}
          />
        </div>
      </main>
    </div>
  );
}