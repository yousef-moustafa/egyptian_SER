import React, { useRef, useEffect, useState } from 'react';

const LiveWaveform = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 300;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startAudio = () => {
    if (audioStarted) return;
    setAudioStarted(true);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyserRef.current = analyser;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        visualize();
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err);
      });
  };

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const totalBars = 64;
    const spacing = 6;
    const barWidth = 4;
    const centerY = canvas.height / 2;
    const smoothedVolumes = new Array(totalBars / 2).fill(0);
    const smoothingFactor = 0.15; // Lower = smoother

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f0f1a'; // Background color
      const bgHeight = 140; // set how tall you want the strip
      const bgY = (canvas.height - bgHeight) / 2;
      ctx.fillRect(0, bgY, canvas.width, bgHeight);

      const centerX = canvas.width / 2;
      const mirroredBars = totalBars / 2;

      for (let i = 0; i < mirroredBars; i++) {
        const barIndex = Math.floor((i / mirroredBars) * bufferLength);
        const rawVolume = dataArray[barIndex] / 255;

        // Smooth volume
        smoothedVolumes[i] += (rawVolume - smoothedVolumes[i]) * smoothingFactor;

        // Adjust for modern soft feel
        const adjusted = Math.pow(smoothedVolumes[i], 1.5);
        const barHeight = adjusted * 100 + 4;

        const xLeft = centerX - (i + 1) * (barWidth + spacing);
        const xRight = centerX + i * (barWidth + spacing);
        const y = centerY - barHeight / 2;

        ctx.fillStyle = '#ffffff'; // Frederico's white bars
        ctx.beginPath();
        ctx.roundRect(xLeft, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(xRight, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
      }
    };

    draw();
  };

  return (
    <div>
      {!audioStarted && (
        <button onClick={startAudio} style={{
          margin: '20px auto',
          padding: '12px 24px',
          display: 'block',
          fontSize: '16px',
          border: 'none',
          background: '#9d4edd',
          color: '#fff',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          Start Listening
        </button>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '300px', display: 'block'}} />
    </div>
  );
};

export default LiveWaveform;