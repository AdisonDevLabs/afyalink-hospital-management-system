import React from 'react';
import { motion } from 'framer-motion';

const LazyMotionDiv = ({ children, sectionRef, variants, viewport }) => {
  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      >
        {children}
    </motion.div>
  );
};

export default LazyMotionDiv;