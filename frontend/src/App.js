import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

import {API_URL} from './Config.js';
import Dashboard from './Dashboard.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
//import VideoDetection from './VideoDetection.js';

const App = () => {

  const [activeTab, setActiveTab] = useState('Tab1');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'Tab1':
        // return <div></div>
        return <Dashboard></Dashboard>;
      case 'Tab2':
        // return <VideoDetection width="640px" height="480px"></VideoDetection>;
        return <div></div>
      case 'Tab3':
        return <div>This is Tab 3 content</div>;
      default:
        return <div>Tab not found</div>;
    }
  };

  

  

  return (
    <div className="container mt-5">
      
      <h1>Personal Care Assistant Monitor</h1>
      
      <ul className="nav nav-tabs justify-content-center">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'Tab1' ? 'active' : ''}`}
            onClick={() => setActiveTab('Tab1')}
            href="#"
          >
            Dashboard
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'Tab2' ? 'active' : ''}`}
            onClick={() => setActiveTab('Tab2')}
            href="#"
          >
            Profile
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'Tab3' ? 'active' : ''}`}
            onClick={() => setActiveTab('Tab3')}
            href="#"
          >
            Setting
          </a>
        </li>
      </ul>
      <div className="content">
        {renderContent()}
      </div>
      
      <br/>
      <br/>
      <br/>
      
    </div>
    );
};

export default App;
