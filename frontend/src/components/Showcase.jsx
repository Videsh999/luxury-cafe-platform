import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const DEFAULT_IMAGE = '/assets/images/showcase_latte_1779038408179.png';

const ITEMS = [
  {
    id: 1,
    name: 'Truffle Infused Latte',
    desc: 'Ethiopian single-origin espresso, white truffle oil, steamed A2 milk, topped with 22k gold flakes.',
    price: '₹449',
    img: '/assets/images/showcase_latte_1779038408179.png',
  },
  {
    id: 2,
    name: 'Saffron Gold Reserve',
    desc: 'Cold-drip Yirgacheffe steeped for 48 hours, Kashmiri saffron, delicate cream crown.',
    price: '₹599',
    img: '/assets/images/showcase_reserve_1779038423479.png',
  },
  {
    id: 3,
    name: 'Madagascar Vanilla Mille-Feuille',
    desc: 'Hundreds of layers of French butter pastry, Madagascar vanilla bean crème diplomat.',
    price: '₹649',
    img: '/assets/images/showcase_mille_1779038439275.png',
  },
];

const Showcase = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0,  40]);

  const offsets = [y1, y2, y1];

  return (
    <section className="py-16 lg:py-24 bg-transparent relative z-10 overflow-hidden" id="menu-preview">
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
              Signature Collection
            </p>
            <h2
              className="font-luxury italic font-light text-white leading-[1.1] drop-shadow-lg"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
            >
              Masterpieces<br />in every <em className="text-luxury-gold not-italic">cup.</em>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/menu"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-luxury-gold hover:bg-white/10 hover:border-luxury-gold/50 text-xs tracking-[0.3em] uppercase font-bold font-sans transition-all duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            >
              View full menu
              <span className="w-8 h-px bg-white/30 group-hover:w-12 group-hover:bg-luxury-gold transition-all duration-700 inline-block" />
            </Link>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              style={{ y: offsets[i] }}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: offsets[i].get?.() ?? 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 }}
              className={`group relative overflow-hidden rounded-[2rem] bg-luxury-dark backdrop-blur-3xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${i === 1 ? 'md:-mt-16' : ''}`}
            >
              {/* Image Box */}
              <div className="relative aspect-[4/5] overflow-hidden m-4 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/50">
                <img
                  src={item.img}
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                  className="w-full h-full object-cover scale-[1.02] group-hover:scale-110 transition-transform duration-[2.5s] ease-out"
                />
                {/* Image Glow */}
                <div className="absolute inset-0 bg-luxury-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040201]/90 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Content Panel */}
              <div className="p-8 pt-4 flex flex-col justify-between relative z-10">
                <div>
                  <p className="font-luxury italic text-white text-2xl leading-tight mb-3 group-hover:text-luxury-gold drop-shadow-md transition-colors duration-500">{item.name}</p>
                  <p className="font-sans font-light text-white/50 text-[0.85rem] leading-relaxed mb-6 group-hover:text-white/80 transition-colors duration-500">
                    {item.desc}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto border-t border-white/10 pt-6">
                  <p className="font-luxury text-luxury-gold text-2xl drop-shadow-md">{item.price}</p>
                  
                  {/* Glowing Add Button */}
                  <button className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white group-hover:bg-luxury-gold group-hover:border-luxury-gold group-hover:text-black group-hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] transition-all duration-500 transform hover:scale-110">
                    <Plus size={20} className="transition-transform duration-500 group-hover:rotate-90" />
                  </button>
                </div>
              </div>
              
              {/* Card Border Glow */}
              <div className="absolute inset-0 border border-luxury-gold/0 group-hover:border-luxury-gold/30 rounded-[2rem] pointer-events-none transition-colors duration-700" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Showcase;
