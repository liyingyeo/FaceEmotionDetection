// src/PieChart.js
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './PieChart.css';
import {API_URL} from './Config.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = (props) => {
  const [profileName, setProfileName] = useState(null)
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
  const fetchData = async (parapara) => {
    try {
      console.log(profileName);
      const response = await fetch(apiUrl + '/pie_data/' + parapara);
      const data = await response.json();

      // Assume the API returns data in the format:
      // { labels: ['label1', 'label2'], data: [10, 20], backgroundColor: [...], borderColor: [...] }
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Emotion Distribution',
            data: data.data,
            backgroundColor: ['#d93204','#6666FF','#FFFF00','#DDDDDD','#027540', '#9f02e8', '#8bb881', 'f78f45'],
            borderColor: ['#d93204','#6666FF','#FFFF00','#DDDDDD','#027540', '#9f02e8', '#8bb881', 'f78f45'],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {

    console.log('useEffect' + props.profileName)
    setProfileName(props.profileName);
    // Fetch data on component mount
    fetchData(props.profileName);

    // Fetch data every 10 seconds
    const intervalId = setInterval(function(){fetchData(props.profileName);}, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [props]);

  return (
    <div >
        <div class="row" style={{textAlign : 'left'}}>
      <h1>Daily Emotion</h1></div>
      <div class="row">
      {chartData? (
      <Pie className='pieChart' data={chartData} options={options} />
      ):
      (<div>No data found</div>)}
      </div>
    </div>
  );
};

export default PieChart;
