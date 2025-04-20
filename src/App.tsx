import React from 'react'
import LiveWaveform from './LiveWaveform'
import './App.css'

function App() {
  return (
    <div className="App full-screen-center">
      <div className="glow-container">
        <div className="glow-sphere"></div>
      </div>
      <LiveWaveform />
    </div>
  )
}

export default App 