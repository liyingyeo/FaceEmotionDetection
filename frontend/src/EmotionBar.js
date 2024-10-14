import React, { useState, useEffect } from 'react';
import 'chartjs-adapter-date-fns'; // Needed for time-based charts
import './EmotionBar.css';
import { BsFillEmojiAngryFill } from "react-icons/bs";
import { ReactComponent as Angry } from './emoji/Angry.svg';
import { ReactComponent as Sadness } from './emoji/Sadness.svg';

import { ReactComponent as Fear } from './emoji/Fear.svg';
import { ReactComponent as Neutral } from './emoji/Neutral.svg';
import { ReactComponent as Happy } from './emoji/Happy.svg';

import { ReactComponent as Disgust } from './emoji/Disgust.svg';
import { ReactComponent as Contempt } from './emoji/Contempt.svg';

export default function EmotionBar() {
    return (
        <div style={{ position: 'relative'}}>
            <div style={{border: '0px solid red', verticalAlign: 'left'}}>
            <h1>Emotion Bar</h1>
            </div>
        <div style={{ paddingLeft: '0px', border: '0px solid red'}} className='side-by-side'>
            
            <div >
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
            <div style={{position: 'relative', bottom: 0, left: 0}}>Fear</div></div>
        </div>
        </div>
    );
}