import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import "./PhotoStudio.css";

const filters = [
  { name: "Normal", style: { filter: "none" } },
  { name: "Vintage", style: { filter: "sepia(0.8) contrast(1.2)" } },
  { name: "Noir", style: { filter: "grayscale(100%) contrast(1.4)" } },
  { name: "Warm", style: { filter: "hue-rotate(-10deg) saturate(1.4)" } }
];

const PhotoStudio = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const webcamRef = useRef(null);
  const stripRef = useRef(null);

  const capturePhoto = () => {
    // Create flash effect
    const flash = document.createElement("div");
    flash.className = "camera-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);

    const imageSrc = webcamRef.current?.getScreenshot();
    return imageSrc ? {
      src: imageSrc,
      filter: selectedFilter,
      timestamp: Date.now()
    } : null;
  };

  const startCapture = async () => {
    setIsCapturing(true);
    setPhotos([]);

    // 3-2-1 Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Capture 3 photos with 2-second intervals
    for (let i = 0; i < 3; i++) {
      setCountdown(i === 0 ? "SMILE!" : `PHOTO ${i + 1}`);
      const photo = capturePhoto();
      if (photo) {
        setPhotos(prev => [...prev, photo]);
      }
      await new Promise(r => setTimeout(r, 2000)); // 2-second delay
    }

    setCountdown(null);
    setIsCapturing(false);
    setShowResult(true);
  };

  const downloadStrip = () => {
    html2canvas(stripRef.current, {
      backgroundColor: '#000',
      scale: 2
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = `photostrip-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="photo-studio">
      {!showResult ? (
        <>
          <div className="webcam-container">
            {countdown && <div className="countdown-overlay">{countdown}</div>}
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              style={selectedFilter.style}
              className="webcam-view"
            />
          </div>

          <div className="filter-bar">
            {filters.map((filter) => (
              <button
                key={filter.name}
                className={`filter-btn ${selectedFilter.name === filter.name ? "active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
                disabled={isCapturing}
              >
                {filter.name}
              </button>
            ))}
          </div>

          <div className="controls">
            <button
              className="capture-btn"
              onClick={startCapture}
              disabled={isCapturing}
            >
              {isCapturing ? "..." : "📸"}
            </button>
          </div>
        </>
      ) : (
        <div className="result-screen">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          
          <h2 className="strip-title">YOUR PHOTOSTRIP</h2>
          
          <div className="photostrip" ref={stripRef}>
            {photos.map((photo, index) => (
              <div key={`${photo.timestamp}-${index}`} className="photo-frame">
                <img 
                  src={photo.src} 
                  alt={`Photo ${index + 1}`}
                  style={photo.filter.style}
                />
                <div className="photo-number">{index + 1}</div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button onClick={() => setShowResult(false)}>Retake</button>
            <button onClick={downloadStrip}>Download</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoStudio;