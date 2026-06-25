import React from 'react';
import { motion } from 'framer-motion';

// Simplified page transition — no filter:blur which can freeze scroll,
// no layout shifts from y translation on page-level elements
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ willChange: 'opacity' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
