import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});

  const categories = ['All', 'Coffee', 'Desserts', 'Interiors', 'Chef Specials', 'Dining Experience'];

  const galleryItems = [
    { id: 1, category: 'Interiors', src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200', title: 'The Sanctuary' },
    { id: 2, category: 'Coffee', src: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800', title: 'Artisan Craft' },
    { id: 3, category: 'Desserts', src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800', title: 'Sweet Indulgence' },
    { id: 4, category: 'Chef Specials', src: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=1200', title: 'Culinary Excellence' },
    { id: 5, category: 'Coffee', src: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800', title: 'Cold Brew Extraction' },
    { id: 6, category: 'Dining Experience', src: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1200', title: 'Intimate Setting' },
    { id: 7, category: 'Desserts', src: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800', title: 'Molten Core' },
    { id: 8, category: 'Interiors', src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200', title: 'Velvet Seating' },
    { id: 9, category: 'Chef Specials', src: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800', title: 'Morning Opulence' },
    { id: 10, category: 'Coffee', src: 'https://images.unsplash.com/photo-1515823662415-e0fd0d981a44?auto=format&fit=crop&q=80&w=800', title: 'Ceremonial Matcha' },
    { id: 11, category: 'Dining Experience', src: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&q=80&w=1200', title: 'The Royal Table' },
    { id: 12, category: 'Desserts', src: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800', title: 'New York Classic' },
  ];

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [lightboxImage]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxury-dark relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-luxury-gold tracking-[0.3em] uppercase text-xs mb-4"
          >
            The Visual Experience
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-white mb-8"
          >
            Moments at Aura
          </motion.h3>

          {/* Filter Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-luxury-gold text-black font-bold shadow-[0_0_20px_rgba(197,160,89,0.3)]' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Masonry Gallery */}
        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={item.id}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => setLightboxImage(item)}
              >
                {/* Shimmer Loader */}
                {!loadedImages[item.id] && (
                  <div className="absolute inset-0 z-0">
                    <div className="w-full h-full animate-pulse bg-gradient-to-r from-white/5 via-white/20 to-white/5 bg-[length:200%_100%] min-h-[300px]"></div>
                  </div>
                )}
                
                <img 
                  src={item.src} 
                  alt={item.title}
                  onLoad={() => handleImageLoad(item.id)}
                  className={`w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out ${loadedImages[item.id] ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Dark Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="w-full flex justify-between items-end">
                    <div>
                      <p className="text-luxury-gold text-[10px] uppercase tracking-widest mb-1 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">{item.category}</p>
                      <p className="text-white font-serif text-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">{item.title}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300">
                      <ZoomIn size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-white/50">
            No images found in this category.
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full backdrop-blur-md"
              onClick={() => setLightboxImage(null)}
            >
              <X size={24} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage.src} 
                alt={lightboxImage.title}
                className="w-full h-full object-contain rounded-xl shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                <p className="text-luxury-gold text-xs uppercase tracking-widest mb-1">{lightboxImage.category}</p>
                <p className="text-white font-serif text-3xl">{lightboxImage.title}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
