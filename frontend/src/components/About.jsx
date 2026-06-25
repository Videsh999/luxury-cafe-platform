import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const reveal = (delay = 0) => ({
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay } },
});

const STATS = [
  { value: 'Michelin', label: 'Recognized' },
  { value: '100%', label: 'Organic Sourced' },
  { value: '2026', label: 'Established' },
];

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section className="py-16 lg:py-24 relative z-10 overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {/* ── Section label ── */}
        <motion.p
          variants={reveal()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-luxury-gold/80 tracking-[0.45em] uppercase text-[10px] font-sans mb-16 text-center md:text-left drop-shadow-md"
        >
          Our Philosophy
        </motion.p>

        {/* ── Main Cinematic Split Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Text column — 6/12 */}
          <div className="lg:col-span-6 space-y-12">
            <motion.h2
              variants={reveal(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="font-luxury italic font-light text-white leading-[1.1] drop-shadow-lg"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)' }}
            >
              Redefining the<br />
              <em className="text-luxury-gold not-italic text-glow">Art of Coffee</em>
            </motion.h2>

            <motion.div
              variants={reveal(0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-6 text-white/60 font-sans font-light leading-[1.85] text-[1.05rem]"
            >
              <p>
                At Aura Reserve, coffee transcends a mere morning ritual — it is an act of ceremony. Every detail, from the exact temperature of our espresso extraction to the ambient glow of our dining room, has been meticulously considered so your time here feels genuinely apart from the ordinary.
              </p>
              <p>
                Our beans are hand-selected from the world's most discerning high-altitude artisanal farms. Our master baristas craft each beverage as a singular expression of ingredient and technique. Nothing is arbitrary. Everything is intentional.
              </p>
            </motion.div>

            {/* Stats row with glassmorphism */}
            <motion.div
              variants={reveal(0.3)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="flex flex-wrap items-center gap-10 pt-8"
            >
              {STATS.map((s, i) => (
                <div key={s.value} className="relative group">
                  <div className="absolute inset-0 bg-luxury-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="font-luxury italic text-white text-3xl leading-none mb-2 drop-shadow-md relative z-10">{s.value}</p>
                  <p className="text-luxury-gold/50 text-[9px] tracking-[0.3em] uppercase font-bold font-sans relative z-10">{s.label}</p>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Image column — 6/12 with Parallax */}
          <motion.div
            initial={{ opacity: 0, x: 40, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            {/* Primary Cinematic Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5">
              <motion.img
                style={{ y }}
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=1200"
                alt="Luxury Coffee Extraction"
                className="w-full h-[120%] object-cover object-center scale-[1.05] hover:scale-[1.1] transition-transform duration-[3s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040201]/80 via-[#040201]/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-luxury-gold/5 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>

            {/* Floating Glassmorphism Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 1 }}
              className="absolute -bottom-8 -left-8 md:-left-12 bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="absolute inset-0 bg-luxury-gold/10 rounded-[2rem] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="font-luxury italic text-3xl text-luxury-gold leading-none mb-2 relative z-10">Est.</p>
              <p className="font-luxury italic text-6xl text-white leading-none drop-shadow-lg relative z-10">2026</p>
              <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-bold font-sans mt-4 relative z-10 group-hover:text-white/80 transition-colors">A Legacy of Taste</p>
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default About;
