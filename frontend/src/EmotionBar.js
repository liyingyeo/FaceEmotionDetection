import React, { useState, useEffect } from 'react';
import 'chartjs-adapter-date-fns'; // Needed for time-based charts
import './EmotionBar.css';
import { BsFillEmojiAngryFill } from "react-icons/bs";
import { ReactComponent as Angry } from './angry.svg';
import { ReactComponent as Frown } from './frown.svg';

import { ReactComponent as Normal } from './normal.svg';
import { ReactComponent as Scare } from './scare.svg';


export default function EmotionBar() {
    return (
        <div style={{float: 'right', position: 'relative'}}>
        <div style={{ paddingLeft: '40px', border: '0px solid red'}} className='side-by-side'>
            <div style={{border: '0px solid red', width: '150px', verticalAlign: 'middle'}}>
            <h1>Emotion Bar</h1>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Angry />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Angry</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Angry />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Angry</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Normal />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Happy</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Normal />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Happy</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Angry />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Angry</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}>
                <Scare />
                <div style={{position: 'relative', bottom: 0, left: 0}}>Scare</div>
            </div>
            <div style={{border: '0px solid red', width: '50px'}}> <Frown />
            <div style={{position: 'relative', bottom: 0, left: 0}}>Neutral</div></div>
        </div>
        </div>
    );
}