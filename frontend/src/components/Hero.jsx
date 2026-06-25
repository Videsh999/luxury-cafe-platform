import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import local video
import heroVideo from '../assets/videos/hero.mp4';

// Stable particle data — deterministic, computed once
const DUST = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: ((i * 43 + 7) % 100) + '%',
  top:  ((i * 29 + 11) % 100) + '%',
  delay: (i * 0.4) % 6,
  dur:   6 + (i * 1.3) % 6,
}));

const fade = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const lift = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay } },
});

const Hero = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const bgY    = useTransform(scrollY, [0, 700], ['0%',  '18%']);
  const textY  = useTransform(scrollY, [0, 700], ['0%', '-12%']);
  const opacity= useTransform(scrollY, [0, 400],  [1, 0]);

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">

      {/* Cinematic Parallax Background Video */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-10%] z-0"
      >
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=90&w=2400"
          className="w-full h-full object-cover scale-[1.05]" // Scale slightly to hide edges during parallax/zoom
        />
        
        {/* Multi-layer cinematic overlay gradients */}
        {/* 1. Dark matte black base vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/50 to-[#050505]/95 mix-blend-multiply" />
        
        {/* 2. Soft luxury gold glow in the center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.25)_0%,rgba(5,5,5,0)_60%)] pointer-events-none" />
        
        {/* 3. Cinematic blur depth */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-[#050505]/10" />
      </motion.div>

      {/* Subtle floating dust motes */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden>
        {DUST.map(p => (
          <motion.span
            key={p.id}
            className="absolute w-[2px] h-[2px] rounded-full bg-luxury-gold/25"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -14, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Centre content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fade}
          initial="hidden"
          animate="show"
          transition={{ duration: 1.2, delay: 0.2 }}
          className="text-luxury-gold/80 tracking-[0.5em] uppercase text-[11px] mb-8 font-sans font-medium drop-shadow-md"
        >
          Est. 2026 · A Reserve Experience
        </motion.p>

        {/* Wordmark */}
        <div className="overflow-hidden mb-6 py-2">
          <motion.h1
            initial={{ y: '105%', filter: 'blur(10px)' }}
            animate={{ y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="font-luxury uppercase font-light text-white leading-none tracking-widest drop-shadow-2xl"
            style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}
          >
            AURA
          </motion.h1>
        </div>

        {/* Thin rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
          className="w-32 h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/70 to-transparent mx-auto mb-10 origin-center"
        />

        {/* Subheading */}
        <motion.p
          variants={lift(1.2)}
          initial="hidden"
          animate="show"
          className="font-sans text-white/80 uppercase tracking-[0.3em] font-light leading-relaxed mb-16 drop-shadow-lg"
          style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1.1rem)' }}
        >
          Luxury Dining Reimagined
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={lift(1.4)}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            to="/reservations"
            className="group relative px-12 py-4 overflow-hidden bg-luxury-gold text-[#050505] font-sans font-bold text-xs tracking-[0.25em] uppercase transition-all duration-700 hover:shadow-[0_0_50px_rgba(197,160,89,0.4)]"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-in-out skew-x-12" />
            <span className="relative z-10">Reserve a Table</span>
          </Link>
          
          <Link
            to="/menu"
            className="group relative px-12 py-4 border border-white/20 text-white font-sans font-light text-xs tracking-[0.25em] uppercase hover:border-white/50 hover:bg-white/5 backdrop-blur-sm transition-all duration-500"
          >
            <span className="relative z-10">Explore Menu</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Cinematic Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1.5, ease: 'easeOut' }}
        style={{ opacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 cursor-pointer"
      >
        <span className="text-white/40 text-[9px] tracking-[0.4em] uppercase font-sans font-light">Scroll to Discover</span>
        <motion.div 
          className="w-[1px] h-12 bg-white/10 relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2 bg-luxury-gold"
            animate={{ top: ['-50%', '100%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
