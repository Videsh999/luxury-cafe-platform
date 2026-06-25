import React, { createContext, useState, useEffect, useRef } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [activeTrack, setActiveTrack] = useState('Morning Café');
  const [activeLayers, setActiveLayers] = useState({
    rain: false,
    fireplace: false,
    cafe: false
  });

  // Track Definitions (.mp3 is REQUIRED for Mac/Safari compatibility)
  const tracks = {
    'Morning Café': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    'Evening Lounge': 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
    'Romantic Dining': 'https://cdn.pixabay.com/audio/2022/03/15/audio_24a2c918ee.mp3',
    'VIP Experience': 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3'
  };

  // Layers (Using Mixkit .mp3 files)
  const layers = {
    rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3',
    fireplace: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3',
    cafe: 'https://assets.mixkit.co/sfx/preview/mixkit-cafe-ambience-with-clinking-cups-292.mp3'
  };

  const sfx = {
    click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
    cart: 'https://assets.mixkit.co/sfx/preview/mixkit-bubble-pop-up-alert-2358.mp3',
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
  };

  // Audio DOM Refs
  const mainAudioRef = useRef(null);
  const rainAudioRef = useRef(null);
  const fireAudioRef = useRef(null);
  const cafeAudioRef = useRef(null);

  // Sync Volume
  useEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = volume;
    if (rainAudioRef.current) rainAudioRef.current.volume = volume * 0.4;
    if (fireAudioRef.current) fireAudioRef.current.volume = volume * 0.4;
    if (cafeAudioRef.current) cafeAudioRef.current.volume = volume * 0.2;
  }, [volume]);

  // Unlock Audio
  const unlockAudio = async () => {
    if (audioUnlocked) return;
    setAudioUnlocked(true);
    setIsPlaying(true);

    try {
      if (mainAudioRef.current) await mainAudioRef.current.play();
    } catch (error) {
      console.warn("Autoplay still blocked:", error);
    }
  };

  const playSFX = (type) => {
    if (!audioUnlocked) return;
    try {
      const effect = new Audio(sfx[type]);
      effect.volume = volume * 0.8;
      effect.play().catch(() => {});
    } catch (e) {}
  };

  // Handle Play/Pause State
  useEffect(() => {
    if (!audioUnlocked) return;

    if (isPlaying) {
      mainAudioRef.current?.play().catch(() => {});
      if (activeLayers.rain) rainAudioRef.current?.play().catch(() => {});
      if (activeLayers.fireplace) fireAudioRef.current?.play().catch(() => {});
      if (activeLayers.cafe) cafeAudioRef.current?.play().catch(() => {});
    } else {
      mainAudioRef.current?.pause();
      rainAudioRef.current?.pause();
      fireAudioRef.current?.pause();
      cafeAudioRef.current?.pause();
    }
  }, [isPlaying, activeLayers, audioUnlocked]);

  // Handle Track Switching
  useEffect(() => {
    if (!mainAudioRef.current) return;
    
    const changeTrack = async () => {
      const wasPlaying = !mainAudioRef.current.paused;
      mainAudioRef.current.src = tracks[activeTrack];
      
      if (wasPlaying && audioUnlocked) {
        try {
          await mainAudioRef.current.play();
        } catch (e) {
          console.warn("Autoplay blocked after switch", e);
        }
      }
    };
    changeTrack();
  }, [activeTrack]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleLayer = (layer) => {
    setActiveLayers(prev => {
      const newState = { ...prev, [layer]: !prev[layer] };
      const ref = layer === 'rain' ? rainAudioRef : layer === 'fireplace' ? fireAudioRef : cafeAudioRef;
      if (newState[layer] && isPlaying && audioUnlocked) {
        ref.current?.play().catch(() => {});
      } else {
        ref.current?.pause();
      }
      return newState;
    });
  };

  return (
    <AudioContext.Provider value={{ 
      isPlaying, togglePlay, 
      volume, setVolume, 
      activeTrack, setActiveTrack, tracks: Object.keys(tracks),
      activeLayers, toggleLayer,
      audioUnlocked, unlockAudio, playSFX
    }}>
      {/* Hidden DOM Audio Elements for perfect browser support */}
      <audio ref={mainAudioRef} loop preload="auto" src={tracks[activeTrack]} />
      <audio ref={rainAudioRef} loop preload="auto" src={layers.rain} />
      <audio ref={fireAudioRef} loop preload="auto" src={layers.fireplace} />
      <audio ref={cafeAudioRef} loop preload="auto" src={layers.cafe} />
      
      {children}
    </AudioContext.Provider>
  );
};
