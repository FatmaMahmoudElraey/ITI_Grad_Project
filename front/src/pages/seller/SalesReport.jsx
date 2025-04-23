// src/pages/Seller/SalesReport.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fetchedSalesData = [
          { month: 'Jan', sales: 4000, orders: 42 },
          { month: 'Feb', sales: 3000, orders: 38 },
          { month: 'Mar', sales: 5000, orders: 56 },
          { month: 'Apr', sales: 2780, orders: 32 },
          { month: 'May', sales: 1890, orders: 28 },
          { month: 'Jun', sales: 2390, orders: 35 },
        ];

        setSalesData(fetchedSalesData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load sales data");
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

  const salesChartData = {
    labels: salesData.map(item => item.month),
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData.map(item => item.sales),
        backgroundColor: 'rgba(102, 15, 241, 0.7)',
        borderColor: 'rgba(102, 15, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Orders',
        data: salesData.map(item => item.orders),
        backgroundColor: 'rgba(156, 163, 175, 0.7)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.label === 'Sales ($)') {
              label += '$' + context.raw.toLocaleString();
            } else {
              label += context.raw.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000) {
              return '$' + (value / 1000).toFixed(1) + 'k';
            }
            return '$' + value;
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ 
          flex: 1, 
          padding: "2rem", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "#f9f9f9"
        }}>
          <div>  <div className="loading-spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ 
          flex: 1, 
          padding: "2rem", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "#f9f9f9"
        }}>
          <div style={{ color: "#ef4444" }}>{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: "2rem", backgroundColor: "#f9f9f9" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <h1 style={{ 
            color: "rgb(102, 15, 241)",
            fontSize: "1.8rem",
            margin: 0
          }}>
            Sales Report
          </h1>
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setTimeRange('weekly')}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: timeRange === 'weekly' ? "rgb(102, 15, 241)" : "rgba(102, 15, 241, 0.1)",
                color: timeRange === 'weekly' ? "#fff" : "rgb(102, 15, 241)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: timeRange === 'monthly' ? "rgb(102, 15, 241)" : "rgba(102, 15, 241, 0.1)",
                color: timeRange === 'monthly' ? "#fff" : "rgb(102, 15, 241)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: timeRange === 'yearly' ? "rgb(102, 15, 241)" : "rgba(102, 15, 241, 0.1)",
                color: timeRange === 'yearly' ? "#fff" : "rgb(102, 15, 241)",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Yearly
            </button>
          </div>
        </div>

        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "12px", 
          padding: "1.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "2rem"
        }}>
          <div style={{ height: "400px" }}>
            <Bar data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: "12px", 
          padding: "1.5rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ 
            color: "rgb(102, 15, 241)",
            fontSize: "1.2rem",
            marginTop: 0,
            marginBottom: "1.5rem"
          }}>
            Sales Summary
          </h3>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px"
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: "rgba(102, 15, 241, 0.05)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: "500", color: "#666" }}>Period</th>
                  <th style={{ padding: "1rem", textAlign: "right", fontWeight: "500", color: "#666" }}>Sales</th>
                  <th style={{ padding: "1rem", textAlign: "right", fontWeight: "500", color: "#666" }}>Orders</th>
                  <th style={{ padding: "1rem", textAlign: "right", fontWeight: "500", color: "#666" }}>Avg. Order Value</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item) => (
                  <tr key={item.month} style={{ 
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    ":hover": {
                      backgroundColor: "rgba(102, 15, 241, 0.02)"
                    }
                  }}>
                    <td style={{ padding: "1rem", fontWeight: "500" }}>{item.month}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>${item.sales.toLocaleString()}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>{item.orders}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>${(item.sales / item.orders).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ 
                  backgroundColor: "rgba(102, 15, 241, 0.05)",
                  fontWeight: "600"
                }}>
                  <td style={{ padding: "1rem" }}>Total</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    ${salesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    {salesData.reduce((sum, item) => sum + item.orders, 0)}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    ${(salesData.reduce((sum, item) => sum + item.sales, 0) / 
                      salesData.reduce((sum, item) => sum + item.orders, 0)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}