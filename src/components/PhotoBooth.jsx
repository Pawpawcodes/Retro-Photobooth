import React, { useState, useEffect, useRef } from "react";
import PhotoStudio from "./PhotoStudio";
import Confetti from "react-confetti";
import "./PhotoBooth.css";

// Import audio files directly (make sure they're in your src/assets/sounds folder)


const PhotoBooth = () => {
  const [flashReady, setFlashReady] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Audio refs with direct imports
  
const audioRefs = useRef({
  charge: new Audio('/sounds/charge_up.mp3'),
  ready: new Audio('/sounds/battery-beep.mp3'),
  shutter: new Audio('/sounds/camera_flash.mp3')
});
  useEffect(() => {
    // Preload audio files
    const loadAudio = async () => {
      try {
        await Promise.all([
          audioRefs.current.charge.load(),
          audioRefs.current.ready.load(),
          audioRefs.current.shutter.load()
        ]);
        console.log("All audio files loaded successfully");
      } catch (error) {
        console.error("Audio loading error:", error);
      }
    };
    loadAudio();

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const playSound = (sound) => {
    try {
      const audio = audioRefs.current[sound];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play error:", e));
      }
    } catch (error) {
      console.error("Audio error:", error);
    }
  };

  const handleChargeClick = () => {
    if (!flashReady) {
      playSound("charge");
      const chargeInterval = setInterval(() => {
        setChargeLevel((prev) => {
          if (prev >= 100) {
            clearInterval(chargeInterval);
            setFlashReady(true);
            playSound("ready");
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      playSound("shutter");
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
        setShowStudio(true);
      }, 500);
    }
  };

  return (
    <div className="booth-container">
      {flashReady && !isFlashing && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
        />
      )}
      
      <h1 className="booth-header">RETRO PHOTOBOOTH</h1>

      {!showStudio ? (
        <div className="flash-interaction">
          <button
            className={`flash-bulb ${flashReady ? "ready" : ""}`}
            onClick={handleChargeClick}
            disabled={isFlashing}
          >
            <div className="charge-level" style={{ height: `${chargeLevel}%` }} />
          </button>
          <p className="flash-instructions">
            {flashReady ? "CLICK TO START!" : "CLICK TO CHARGE"}
          </p>
        </div>
      ) : (
        <PhotoStudio onBack={() => setShowStudio(false)} />
      )}
    </div>
  );
};

export default PhotoBooth;