import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AmbientBackground = () => {
  const canvasRef = useRef(null);

  // Animated Dust/Coffee Smoke Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.2, // slight upward drift like smoke/steam
        alpha: Math.random() * 0.5 + 0.1,
        // Warm color palette: amber, gold, white
        color: Math.random() > 0.5 ? '212, 175, 55' : (Math.random() > 0.5 ? '255, 191, 0' : '255, 255, 255')
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha * 2})`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0a0604]">
      {/* 
        Cinematic Gradients 
        Using warm espresso browns, caramel golds, and deep amber 
      */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: ['0%', '10%', '0%'],
          y: ['0%', '-5%', '0%']
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-luxury-gold/10 blur-[120px] mix-blend-screen"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: ['0%', '-10%', '0%'],
          y: ['0%', '10%', '0%']
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full bg-orange-600/10 blur-[150px] mix-blend-screen"
      />

      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-amber-700/15 blur-[140px] mix-blend-screen"
      />

      {/* Deep espresso vignette to frame the content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,3,2,0.8)_100%)]" />

      {/* Floating Particles Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-1000"
      />
    </div>
  );
};

export default AmbientBackground;
