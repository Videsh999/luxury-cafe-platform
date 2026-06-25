import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const RollingNumber = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Strip non-numeric characters for the animation
  const targetValue = parseFloat(value.toString().replace(/[^0-9.]/g, ''));

  useEffect(() => {
    const controls = animate(0, targetValue, {
      duration: 2,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [targetValue]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: value.toString().includes('.') ? 2 : 0,
        maximumFractionDigits: 2,
      })}
      {suffix}
    </span>
  );
};

export default RollingNumber;
