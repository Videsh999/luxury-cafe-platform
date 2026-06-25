import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, CloudRain, Flame, Coffee, Settings2, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';

const LuxuryAudioPlayer = () => {
  const { 
    isPlaying, togglePlay, 
    volume, setVolume, 
    activeTrack, setActiveTrack, tracks,
    activeLayers, toggleLayer,
    audioUnlocked, unlockAudio, playSFX
  } = useContext(AudioContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleMuteToggle = () => {
    playSFX('click');
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
    if (val === 0) setIsMuted(true);
  };

  if (!audioUnlocked) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={unlockAudio}
          className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-luxury-gold/30 px-5 py-3 rounded-full text-white hover:bg-luxury-gold hover:text-black transition-all duration-300 group shadow-[0_0_30px_rgba(197,160,89,0.2)]"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold opacity-75 group-hover:bg-black"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-luxury-gold group-hover:bg-black"></span>
          </div>
          <span className="text-xs uppercase tracking-widest font-bold">Enable Luxury Ambience</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.div 
        layout
        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        initial={{ width: 280 }}
        animate={{ width: isExpanded ? 320 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Compact Header (Always Visible) */}
        <div 
          className="p-4 flex items-center justify-between cursor-pointer group" 
          onClick={() => { playSFX('click'); setIsExpanded(!isExpanded); }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); playSFX('click'); togglePlay(); }}
              className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center hover:bg-white transition-colors shadow-[0_0_15px_rgba(197,160,89,0.3)]"
            >
              {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black translate-x-0.5" />}
            </button>
            
            <div className="flex flex-col">
              <span className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Now Playing</span>
              <span className="text-white text-sm font-serif truncate w-32">{activeTrack}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Animated Equalizer */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: ["20%", "100%", "40%", "80%", "20%"] }}
                    transition={{ repeat: Infinity, duration: 1 + (i * 0.2), ease: "easeInOut" }}
                    className="w-1 bg-luxury-gold rounded-t-sm"
                  />
                ))}
              </div>
            )}
            <button className="text-white/50 hover:text-white transition-colors">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
              onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking inside
            >
              <div className="p-5 space-y-6">
                
                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <button onClick={handleMuteToggle} className="text-white/50 hover:text-luxury-gold transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume} 
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-luxury-gold [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                </div>

                {/* Track Selector */}
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1"><Music size={12}/> Ambience Mode</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tracks.map(track => (
                      <button 
                        key={track}
                        onClick={() => { playSFX('click'); setActiveTrack(track); if (!isPlaying) togglePlay(); }}
                        className={`text-xs p-2 rounded-lg border transition-all text-left truncate ${
                          activeTrack === track 
                            ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' 
                            : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer Toggles */}
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1"><Settings2 size={12}/> Atmospheric Layers</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { playSFX('click'); toggleLayer('rain'); }}
                      className={`flex-1 p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                        activeLayers.rain ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <CloudRain size={16} />
                      <span className="text-[10px]">Rain</span>
                    </button>
                    <button 
                      onClick={() => { playSFX('click'); toggleLayer('fireplace'); }}
                      className={`flex-1 p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                        activeLayers.fireplace ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Flame size={16} />
                      <span className="text-[10px]">Fire</span>
                    </button>
                    <button 
                      onClick={() => { playSFX('click'); toggleLayer('cafe'); }}
                      className={`flex-1 p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                        activeLayers.cafe ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Coffee size={16} />
                      <span className="text-[10px]">Café</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LuxuryAudioPlayer;
