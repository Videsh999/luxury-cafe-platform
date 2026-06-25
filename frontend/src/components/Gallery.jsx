import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const DEFAULT_IMAGE = '/assets/images/gallery_sanctuary_1779038309931.png';

const IMAGES = [
  {
    id: 1,
    src: '/assets/images/gallery_sanctuary_1779038309931.png',
    alt: 'The Sanctuary',
    title: 'The Sanctuary',
    cat: 'Interiors',
    aspect: 'aspect-[3/4]',
  },
  {
    id: 2,
    src: '/assets/images/gallery_artisan_craft_1779038324863.png',
    alt: 'Artisan Craft',
    title: 'Artisan Craft',
    cat: 'Coffee',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 3,
    src: '/assets/images/gallery_sweet_1779038342447.png',
    alt: 'Sweet Indulgence',
    title: 'Sweet Indulgence',
    cat: 'Desserts',
    aspect: 'aspect-square',
  },
  {
    id: 4,
    src: '/assets/images/gallery_culinary_1779038361734.png',
    alt: 'Culinary Excellence',
    title: 'Culinary Excellence',
    cat: 'Chef Specials',
    aspect: 'aspect-[4/5]',
  },
  {
    id: 5,
    src: '/assets/images/gallery_extraction_1779038377529.png',
    alt: 'Extraction',
    title: 'Perfect Extraction',
    cat: 'Process',
    aspect: 'aspect-square',
  },
];

const Gallery = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section className="py-16 lg:py-24 bg-transparent relative z-10" id="gallery">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-luxury-gold/80 tracking-[0.45em] uppercase text-[10px] font-sans mb-4 drop-shadow-md">
              Visual Narrative
            </p>
            <h2
              className="font-luxury italic font-light text-white leading-[1.1] drop-shadow-lg"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
            >
              Moments at <em className="text-luxury-gold not-italic">Aura.</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-luxury-gold hover:bg-white/10 hover:border-luxury-gold/50 text-xs tracking-[0.3em] uppercase font-bold font-sans transition-all duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            >
              View full gallery
              <span className="w-8 h-px bg-white/30 group-hover:w-12 group-hover:bg-luxury-gold transition-all duration-700 inline-block" />
            </Link>
          </motion.div>
        </div>

        {/* Masonry-style Grid with Focus/Blur Peer effects */}
        {/* We use a group on the parent. When parent is hovered, all children blur/dim.
            When a child is hovered, it removes its own blur/dim and scales up. */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 group/gallery pb-12">
          {IMAGES.map((img, i) => (
            <motion.div
              key={img.id}
              style={{ y: i % 2 === 0 ? y1 : y2 }}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-[2rem] bg-luxury-dark border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer break-inside-avoid ${img.aspect} transition-all duration-700 ease-out group-hover/gallery:blur-sm group-hover/gallery:opacity-40 hover:!blur-none hover:!opacity-100 hover:scale-[1.03] hover:z-10 hover:shadow-[0_40px_80px_rgba(197,160,89,0.2)]`}
            >
              <img
                src={img.src}
                alt={img.alt}
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                className="w-full h-full object-cover"
              />

              {/* Cinematic Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040201]/90 via-[#040201]/20 to-transparent opacity-80" />
              <div className="absolute inset-0 bg-luxury-gold/20 opacity-0 transition-opacity duration-700 mix-blend-overlay hover:opacity-100" />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 opacity-70 transition-all duration-500 hover:translate-y-0 hover:opacity-100">
                <p className="text-luxury-gold tracking-[0.4em] uppercase text-[9px] font-sans font-bold mb-2">{img.cat}</p>
                <p className="font-luxury italic text-white text-2xl drop-shadow-md">{img.title}</p>
              </div>

              {/* Border Glow */}
              <div className="absolute inset-0 border border-luxury-gold/0 rounded-[2rem] pointer-events-none transition-colors duration-700 hover:border-luxury-gold/40" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Gallery;
