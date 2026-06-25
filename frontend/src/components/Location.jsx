import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Navigation } from 'lucide-react';

const reveal = (delay = 0) => ({
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay } },
});

const Location = () => {
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.827222549241!2d78.34830981537233!3d17.41162628806411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb945100000001%3A0x6b63c6837050016a!2sWipro%20Circle!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Wipro+Circle+Financial+District+Hyderabad";

  return (
    <section className="py-16 lg:py-24 bg-transparent relative z-10 overflow-hidden" id="location">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {/* ── Section Header ── */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            variants={reveal()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="text-luxury-gold/80 tracking-[0.45em] uppercase text-[10px] font-sans mb-6 drop-shadow-md"
          >
            Visit Us
          </motion.p>
          <motion.h2
            variants={reveal(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="font-luxury italic font-light text-white leading-[1.1] drop-shadow-lg"
            style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
          >
            Find your <em className="text-luxury-gold not-italic">Sanctuary.</em>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
          
          {/* ── Interactive Map Embed ── */}
          <motion.div 
            variants={reveal(0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:w-3/5 group relative overflow-hidden rounded-[2rem] bg-luxury-dark border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-h-[400px]"
          >
            <div className="absolute inset-0 bg-luxury-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay z-10" />
            <iframe 
              src={mapUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2) sepia(0.2) hue-rotate(350deg)' }}
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.02]"
              title="Aura Cafe Location"
            />
            {/* Soft inner shadow for cinematic depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none" />
            <div className="absolute inset-0 border border-luxury-gold/0 group-hover:border-luxury-gold/30 rounded-[2rem] pointer-events-none transition-colors duration-700 z-20" />
          </motion.div>

          {/* ── Contact Details Panel ── */}
          <motion.div 
            variants={reveal(0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:w-2/5 relative overflow-hidden rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-8 lg:p-12 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0604]/80 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-10">
              
              {/* Address */}
              <div className="group/item flex gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shadow-[0_0_15px_rgba(197,160,89,0.1)] group-hover/item:bg-luxury-gold/10 group-hover/item:border-luxury-gold/30 transition-all duration-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-white font-sans text-xs uppercase tracking-widest font-bold mb-2">Location</h4>
                  <p className="font-sans font-light text-white/60 leading-relaxed text-sm">
                    Wipro Circle, Financial District<br />
                    Gachibowli, Hyderabad<br />
                    Telangana, India
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="group/item flex gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shadow-[0_0_15px_rgba(197,160,89,0.1)] group-hover/item:bg-luxury-gold/10 group-hover/item:border-luxury-gold/30 transition-all duration-500">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-white font-sans text-xs uppercase tracking-widest font-bold mb-2">Hours</h4>
                  <p className="font-sans font-light text-white/60 leading-relaxed text-sm">
                    Monday - Friday: 7am - 11pm<br />
                    Saturday - Sunday: 8am - Midnight
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="group/item flex gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-luxury-gold shadow-[0_0_15px_rgba(197,160,89,0.1)] group-hover/item:bg-luxury-gold/10 group-hover/item:border-luxury-gold/30 transition-all duration-500">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-white font-sans text-xs uppercase tracking-widest font-bold mb-2">Contact</h4>
                  <p className="font-sans font-light text-white/60 leading-relaxed text-sm mb-1">
                    +91 98765 43210
                  </p>
                  <p className="font-sans font-light text-white/60 leading-relaxed text-sm">
                    concierge@auracafe.in
                  </p>
                </div>
              </div>

            </div>

            {/* Directions Button */}
            <div className="relative z-10 mt-12 lg:mt-0 pt-8 border-t border-white/10">
              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-luxury-gold text-black font-sans font-bold text-xs tracking-[0.2em] uppercase transition-all duration-500 hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:bg-white"
              >
                Get Directions
                <Navigation size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
              </a>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Location;
