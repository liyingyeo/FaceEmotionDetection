// src/PieChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './PieChart.css';


ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Color Distribution',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  const apiUrl = 'http://localhost:8080'; // Adjust to your Flask server's URL


  // Fetch data from server-side API
  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl + '/pie_data');
      const data = await response.json();

      // Assume the API returns data in the format:
      // { labels: ['label1', 'label2'], data: [10, 20], backgroundColor: [...], borderColor: [...] }
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Color Distribution',
            data: data.data,
            backgroundColor: ['red','yellow','green','blue','pink', 'purple'],
            borderColor: ['red','yellow','green','blue','pink', 'purple'],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Fetch data on component mount
    fetchData();

    // Fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h2>Pie Chart Example</h2>
      <Pie className='pieChart' data={chartData} />
    </div>
  );
};

export default PieChart;
