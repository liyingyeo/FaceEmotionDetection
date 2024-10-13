import React, { useState, useEffect } from 'react';

import { Line } from 'react-chartjs-2';
import { PointElement } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Needed for time-based charts
import './PainGraph.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement,PointElement, TimeScale, Title, Tooltip, Legend);

export default function PainGraph() {
    //const [timestamps, setTimestamps] = useState([]);
//   const timestamps = ["2024-10-07T14:00:00Z", "2024-10-07T14:01:00Z", "2024-10-07T14:02:00Z"];
//   const values =  [10, 20, 15];
  const [timestamps, setTimestamps] = useState([]);
  const [values, setValues] = useState([]);
  const [values2, setValues2] = useState([]);
  const [values3, setValues3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = 'http://localhost:8080'; // Adjust to your Flask server's URL

  useEffect(() => {
    
    const fetchGraphData = setInterval(() => {
        
        fetch(apiUrl + '/data')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('data' + data.values);
            setTimestamps(data.timestamps);
            setValues(data.values);
            setValues2(data.values2);
            setValues3(data.values3);
            setLoading(false);
        })
        .catch(error => {
            setError(error.toString());
            setLoading(false);
            
        });
      }, 3000); // Send every 1 second (1000 ms)

      return () => {
        clearInterval(fetchGraphData);
      };

  });
  const chartData = {
    labels: timestamps,
    datasets: [
    //   {
    //     label: 'Happy',
    //     data: values,
    //     fill: false,
    //     borderColor: 'rgba(75, 192, 192, 1)',
    //     backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //     tension: 0.1,
    //   },
    //   {
    //     label: 'Angry',
    //     data: values2,
    //     fill: false,
    //     borderColor: 'rgba(255, 99, 132, 1)',
    //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //     tension: 0.1,
    //   },
      {
        label: 'Pain',
        data: values,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'MMM d, yyyy HH:mm',
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Pain Level',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
    return (
        <div style={{float: 'left', position: 'relative'}}>
        <section>
            <h1>Pain Detection Graph</h1>
        </section>
        <div>
        <Line className='painGraph' data={chartData} options={options} />
        </div>
        </div>
    );
  }