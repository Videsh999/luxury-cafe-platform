import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const baseReviewsData = [
  {
    id: 1,
    name: "Eleanor Wright",
    initial: "E",
    title: "A Culinary Masterpiece",
    text: "From the moment you step through the doors, Aura Reserve transports you. The Truffle Infused Latte is simply unparalleled. Every detail is meticulously crafted.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Sterling",
    initial: "J",
    title: "Unparalleled Atmosphere",
    text: "The interior design perfectly matches the exquisite menu. I hosted a private business dinner here and the Concierge service was flawlessly attentive yet unobtrusive.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sophia Laurent",
    initial: "S",
    title: "Simply Exquisite",
    text: "I've visited luxury cafés globally, but Aura's Saffron Gold Reserve is an experience of its own. The glassmorphism UI of their digital menu is a brilliant touch too.",
    rating: 5,
  },
  {
    id: 4,
    name: "Alexander Vance",
    initial: "A",
    title: "The Pinnacle of Hospitality",
    text: "You don't just come here for coffee; you come for the ceremony. The Chef's seasonal specials are a testament to true culinary art.",
    rating: 5,
  },
  {
    id: 5,
    name: "Isabella Thorne",
    initial: "I",
    title: "Impeccable Attention to Detail",
    text: "Every element, from the ambient lighting to the custom tableware, is designed to elevate your senses. A sanctuary in the middle of the city.",
    rating: 5,
  }
];

// Duplicate data to create a perfectly seamless infinite loop
const reviewsData = [...baseReviewsData, ...baseReviewsData, ...baseReviewsData, ...baseReviewsData];

const Reviews = () => {
  const scrollRef = useRef(null);
  const baseWidthRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Calculate the exact width of one base set of reviews for pixel-perfect looping
  useEffect(() => {
    const calculateWidth = () => {
      if (scrollRef.current && scrollRef.current.children.length > baseReviewsData.length) {
        const firstChild = scrollRef.current.children[0];
        const loopChild = scrollRef.current.children[baseReviewsData.length];
        if (firstChild && loopChild) {
          baseWidthRef.current = loopChild.offsetLeft - firstChild.offsetLeft;
        }
      }
    };
    
    calculateWidth();
    // Recalculate on window resize
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  // Frame-rate independent Auto-scroll logic
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    const speed = 40; // pixels per second

    const autoScroll = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollRef.current && !isHovered && !isDragging) {
        // Move by delta to ensure buttery smooth speed regardless of monitor refresh rate
        scrollRef.current.scrollLeft += (speed * delta) / 1000;
        
        // Infinite loop reset logic
        if (baseWidthRef.current > 0 && scrollRef.current.scrollLeft >= baseWidthRef.current) {
          scrollRef.current.scrollLeft -= baseWidthRef.current; 
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging]);

  // Mouse wheel to horizontal scroll conversion
  const handleWheel = (e) => {
    if (scrollRef.current) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Mouse Drag Logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-luxury-dark" id="reviews">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img 
          src="/assets/images/gallery_sanctuary_1779038309931.png" 
          alt="Aura Cafe Interior" 
          onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/gallery_sanctuary_1779038309931.png'; }}
          className="w-full h-full object-cover opacity-30 scale-105 blur-sm"
        />
        {/* Gradients to blend section smoothly into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-dark via-[#040404]/60 to-luxury-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-dark/90 via-transparent to-luxury-dark/90" />
      </div>

      {/* Floating Ambient Particles (Subtle glow effects) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-luxury-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-luxury-gold/70 tracking-[0.45em] uppercase text-[10px] font-sans mb-4 drop-shadow-md">
            Testimonials
          </p>
          <h2 className="font-luxury italic font-light text-white leading-[1.1] mb-6 drop-shadow-lg" style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
            Guest Experiences
          </h2>
          <p className="font-sans font-light text-white/50 text-[0.95rem] leading-relaxed">
            What our community says about their moments at Aura Reserve.
          </p>
        </motion.div>
      </div>

      {/* Carousel Wrapper with Fading Edges */}
      <div className="relative z-10 w-full max-w-[100vw] group">
        
        {/* Left Fade Edge */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-48 bg-gradient-to-r from-luxury-dark to-transparent z-20 pointer-events-none" />
        
        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleMouseUpOrLeave(); }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpOrLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className={`flex gap-6 md:gap-8 overflow-x-auto hide-scrollbar px-6 md:px-[20vw] pb-16 pt-8 transition-all duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'auto' }}
        >
          {reviewsData.map((review, index) => (
            <motion.div
              key={`${review.id}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-none w-[85vw] sm:w-[400px] p-8 md:p-10 rounded-[2rem] bg-white/[0.03] backdrop-blur-3xl border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-luxury-gold/30 hover:shadow-[0_30px_60px_rgba(197,160,89,0.15)] group"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1.5 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star 
                      key={i}
                      size={16} 
                      className="text-luxury-gold fill-luxury-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.8)] opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                  ))}
                </div>

                <h4 className="font-luxury italic text-white text-xl md:text-2xl mb-4 group-hover:text-luxury-gold transition-colors duration-500 drop-shadow-md">
                  "{review.title}"
                </h4>
                <p className="font-sans font-light text-white/50 text-sm leading-relaxed mb-8 group-hover:text-white/70 transition-colors duration-500">
                  {review.text}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10 group-hover:border-luxury-gold/20 transition-colors duration-500">
                <div className="w-12 h-12 rounded-full bg-black/50 border border-luxury-gold/30 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.2)] group-hover:shadow-[0_0_25px_rgba(197,160,89,0.5)] transition-shadow duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="font-serif text-luxury-gold text-lg relative z-10">{review.initial}</span>
                </div>
                <div>
                  <p className="font-sans text-white text-sm font-medium tracking-wide drop-shadow-sm">{review.name}</p>
                  <p className="font-sans text-white/30 text-[10px] uppercase tracking-widest mt-0.5 group-hover:text-luxury-gold/60 transition-colors">Verified Guest</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Fade Edge */}
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-48 bg-gradient-to-l from-luxury-dark to-transparent z-20 pointer-events-none" />
      </div>

    </section>
  );
};

export default Reviews;
