import React, { useState, useEffect } from 'react';
import 'chartjs-adapter-date-fns'; // Needed for time-based charts
import './EmotionBar.css';
import { BsFillEmojiAngryFill } from "react-icons/bs";
import { ReactComponent as Angry } from './emoji/Angry.svg';
import { ReactComponent as Sadness } from './emoji/Sadness.svg';

import { ReactComponent as Fear } from './emoji/Fear.svg';
import { ReactComponent as Neutral } from './emoji/Neutral.svg';
import { ReactComponent as Happy } from './emoji/Happy.svg';

import { ReactComponent as Surprise } from './emoji/Surprise.svg';
import { ReactComponent as Disgust } from './emoji/Disgust.svg';
import { ReactComponent as Contempt } from './emoji/Contempt.svg';

import {API_URL} from './Config.js';

export default function EmotionBar() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const svgComponents = {
        "Anger": Angry,
        "Sadness": Sadness,
        "Fear": Fear,
        "Neutral": Neutral,
        "Happy": Happy,
        "Disgust": Disgust,
        "Contempt": Contempt,
        "Surprise": Surprise,
      };

      

    const apiUrl = API_URL; // Adjust to your Flask server's URL

  useEffect(() => {
    
  
    
    const fetchBarData = setInterval(() => {
        console.log('API_URL' + API_URL);
        fetch(apiUrl + '/bar_data')
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('data : ' + data.data);
            setData(data.data);
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
        <div style={{ position: 'relative'}}>
            <div style={{border: '0px solid red', verticalAlign: 'left'}}>
            <h1>Emotion Bar</h1>
            </div>
        <div style={{ paddingLeft: '0px', border: '0px solid red'}} className='side-by-side'>
                {data.length > 0 ? (
                    data.map((svgName, index) => {
                    const SvgComponent = svgComponents[svgName.predicted_emotion]; // Get the component based on svgName
                    return (
                        <div key={index} className="svg-item">
                            {svgName.predicted_emotion}
                        {SvgComponent ? <SvgComponent width='40px' height='40px' /> : <p>Unknown SVG</p>}
                        <div style={{fontSize: '8px'}}>{new Date(svgName.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })}</div>
                        </div>
                    );
                    })
                ) : (
                    <p>No SVGs available</p>
                )}
            
            {/* <div >
                <Angry width='50px' height="50px" />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Angry</div>
                <div style={{position: 'relative', bottom: 0, left: 0}}>10:10am</div>
            </div>
            <div >
                <Sadness width='50px' height="50px"/>
                <div style={{position: 'relative', bottom: 0, left: 0}}>Sadness</div>
            </div>
            <div >
                <Neutral width='50px' height="50px"/>
                <div style={{position: 'relative', bottom: 0, left: 0}}>Neutral</div>
            </div>
            <div >
                <Happy width='50px' height="50px"/>
                <div style={{position: 'relative', bottom: 0, left: 0}}>Happy</div>
            </div>
            <div >
                <Contempt width='50px' height="50px"/>
                <div style={{position: 'relative', bottom: 0, left: 0}}>Contempt</div>
            </div>
            <div >
                <Disgust width='50px' height="50px" />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Disgust</div>
            </div>
            <div > 
                <Fear width='50px' height="50px"/>
            <div style={{position: 'relative', bottom: 0, left: 0}}>Fear</div></div> */}
        </div>
        </div>
    );
}