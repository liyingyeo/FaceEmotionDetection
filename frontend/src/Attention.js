import React, { useState, useEffect } from 'react';
import 'chartjs-adapter-date-fns'; // Needed for time-based charts
import './Attention.css';
import Warning from './assets/warning.png'; // Adjust the path to your image

import {API_URL} from './Config.js';

export default function Attention() {
    const [data, setData] = useState('none');
    const [error, setError] = useState(null);

    const apiUrl = API_URL; // Adjust to your Flask server's URL

  useEffect(() => {
    
  
    
    const fetchBarData = setInterval(() => {
        console.log('API_URL' + API_URL);
        fetch(apiUrl + '/attention')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('attention data : ' + data.data);
            if(data.data>0){
                console.log('block');
                setData('block');
            }else{
                console.log('none');
                setData('none');
            }
            
        })
        .catch(error => {
            setError(error.toString());
            
        });
      }, 3000); // Send every 1 second (1000 ms)

      return () => {
        clearInterval(fetchBarData);
      };

  });
    return (
        <div style={{ position:'absolute', top: 0, display:data }}>
            <img src={Warning} style={{width: '60px', height: '70px'}}/>
        </div>
    );
}