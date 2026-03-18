import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardCharts = ({ stats }) => {
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [12000, 19000, 15000, 25000, 22000, 30000], // Example data
        borderColor: '#ff3f6c',
        backgroundColor: 'rgba(255, 63, 108, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Orders',
        data: [50, 80, 60, 100, 90, 120], // Example data
        borderColor: '#42e695',
        backgroundColor: 'rgba(66, 230, 149, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Pending', 'Accepted', 'Out for Delivery', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [10, 15, 8, 25, 5], // Example data
        backgroundColor: [
          '#ffd33d',
          '#f093fb',
          '#667eea',
          '#42e695',
          '#ff6b6b',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales & Orders Trend'
      }
    }
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Sales & Orders Trend</h3>
        <Line data={lineData} options={chartOptions} />
      </div>
      <div className="chart-card doughnut">
        <h3>Order Status Distribution</h3>
        <Doughnut data={doughnutData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DashboardCharts;
