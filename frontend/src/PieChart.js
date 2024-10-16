// src/PieChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './PieChart.css';
import {API_URL} from './Config.js';

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

  // Chart options to tidy up the legend
  const options = {
    plugins: {
      legend: {
        position: 'right', // Position legend to the right
        labels: {
          boxWidth: 20, // Size of the legend box
          padding: 15,  // Padding between legend items
          font: {
            size: 14,   // Font size for legend text
            family: "'Arial', sans-serif", // Font family
            weight: 'bold',  // Font weight
          },
          color: '#333',  // Color of legend text
        },
      },
    },
  };

  const apiUrl = API_URL; // Adjust to your Flask server's URL


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
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div >
        <div class="row" style={{textAlign : 'left'}}>
      <h1>Daily Emotion</h1></div>
      <div class="row">
      <Pie className='pieChart' data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;
