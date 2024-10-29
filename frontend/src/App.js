import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';

import {API_URL} from './Config.js';
import Dashboard from './Dashboard.js';

import Profile from './Profile.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
//import VideoDetection from './VideoDetection.js';

const App = () => {

  const [activeTab, setActiveTab] = useState('Tab1');
  const [models, setModels] = useState([]);   // To store the list of models
  const [selectedModel, setSelectedModel] = useState('InceptResNet_IG_multi_v8g'); // To store the selected model
  const [refreshRate, setRefreshRate] = useState('500'); // To store the selected model
  const [message, setMessage] = useState(''); // To store the response message from the server

  // Generate a random UID (Universal Unique Identifier)
  function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }

  // Store the UID for this client
  const uuid = generateUID();


  useEffect(() => {
    fetch(API_URL + '/api/models')
      .then(response => response.json())
      .then(data => setModels(data))
      .catch(error => console.error('Error fetching models:', error));
  }, []);
  
  const handleModelSelect = (event) => {
    setSelectedModel(event.target.value);
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'Tab1':
        // return <div></div>
        return <Dashboard refreshRate={refreshRate} uuid={uuid} selectedModel={selectedModel}></Dashboard>;
      case 'Tab2':
        // return <VideoDetection width="640px" height="480px"></VideoDetection>;
        return <Profile/>
      case 'Tab3':
        return <div>
            <div className='row'>
            <div class="col-2" >Select a Model</div>
            <div class="col-10" style={{textAlign: 'left'}}>
            {models.length > 0 ? (
              <>
                <select value={selectedModel} onChange={handleModelSelect}>
                  <option value="" disabled>Select a model</option>
                  {models.map((model, index) => (
                    <option key={index} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p>Loading models...</p>
            )}

            {message && <p>{message}</p>}
            </div>
            </div>
            <div className='row'>
              <div class="col-2" >Refresh Rate : </div>
              <div class="col-4">
                <input
                type="text"
                className="form-control"
                placeholder="Frequency to send to server"
                value={refreshRate}
                onChange={(e) => setRefreshRate(e.target.value)}
              /> 
              </div>
            </div>
          </div>;
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
