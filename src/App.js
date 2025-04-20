import React, { useRef } from 'react';
import LiveWaveform from './LiveWaveform';
import './App.css'; // assuming styles are in here

function App() {
  return (
    <div className="App full-screen-center">
      <div className="glow-container">
        <div className="glow-sphere"></div>
      </div>
      <LiveWaveform/>
    </div>
  );
}

export default App;
