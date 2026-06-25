import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChefHat, Clock, Crown } from 'lucide-react';

const reveal = (delay = 0) => ({
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay } },
});

const DEFAULT_IMAGE = '/assets/images/feature_ai_1779038454034.png';

const FEATURES = [
  {
    num: '01',
    title: 'AI Concierge',
    body:  'Intelligent menu curation and real-time reservation assistance, calibrated seamlessly to your unique palate.',
    image: '/assets/images/feature_ai_1779038454034.png',
    icon: <Sparkles size={24} className="text-luxury-gold" />
  },
  {
    num: '02',
    title: 'Seasonal Curation',
    body:  'A living, breathing menu that evolves with the micro-seasons, ensuring peak freshness and flavor.',
    image: '/assets/images/feature_seasonal_1779038468900.png',
    icon: <ChefHat size={24} className="text-luxury-gold" />
  },
  {
    num: '03',
    title: 'Precision Tracking',
    body:  'Follow your culinary journey from our master kitchen directly to your table with elegant status updates.',
    image: '/assets/images/feature_tracking_1779038484475.png',
    icon: <Clock size={24} className="text-luxury-gold" />
  },
  {
    num: '04',
    title: 'Aura Reserve Member',
    body:  'Priority seating, private tasting events, and a dedicated host who remembers exactly how you take your coffee.',
    image: '/assets/images/feature_member_1779038499164.png',
    icon: <Crown size={24} className="text-luxury-gold" />
  },
];

const Features = () => (
  <section className="py-16 lg:py-24 bg-transparent relative z-10 overflow-hidden" id="specialties">
    <div className="max-w-7xl mx-auto px-6 md:px-16">

      {/* ── Section header ── */}
      <div className="text-center mb-20 md:mb-28">
        <motion.p
          variants={reveal()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="text-luxury-gold/80 tracking-[0.45em] uppercase text-[10px] font-sans mb-6 drop-shadow-md"
        >
          The Aura Experience
        </motion.p>
        <motion.h2
          variants={reveal(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="font-luxury italic font-light text-white leading-[1.1] drop-shadow-lg"
          style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
        >
          Elevated Hospitality,<br />
          <em className="text-luxury-gold not-italic">Intelligently Served</em>
        </motion.h2>
      </div>

      {/* ── Image-Backed Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.num}
            variants={reveal(i * 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="group relative overflow-hidden rounded-[2rem] aspect-[4/3] md:aspect-square lg:aspect-[4/3] shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-pointer bg-luxury-dark"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={f.image} 
                alt={f.title}
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                className="w-full h-full object-cover scale-[1.05] group-hover:scale-110 transition-transform duration-[2s] ease-out"
              />
            </div>
            
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050301]/95 via-[#050301]/40 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-80" />
            <div className="absolute inset-0 bg-luxury-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />

            {/* Content Container */}
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end">
              {/* Icon & Number (Floating at top) */}
              <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                {f.icon}
              </div>
              <span className="absolute top-10 right-8 font-serif text-white/30 text-2xl group-hover:text-luxury-gold/50 transition-colors duration-500">
                {f.num}
              </span>

              {/* Text Body */}
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h4 className="font-luxury italic text-white text-3xl lg:text-4xl mb-3 group-hover:text-luxury-gold drop-shadow-md transition-colors duration-500">
                  {f.title}
                </h4>
                <div className="w-10 h-px bg-luxury-gold/50 mb-5 group-hover:w-full transition-all duration-700 ease-in-out" />
                <p className="font-sans font-light text-white/70 text-[0.95rem] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 drop-shadow-sm max-w-sm">
                  {f.body}
                </p>
              </div>
            </div>
            
            {/* Glassmorphism Border Glow */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-[2rem] pointer-events-none group-hover:border-luxury-gold/30 transition-colors duration-700" />
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default Features;
