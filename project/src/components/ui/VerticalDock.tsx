import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DockProps } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const VerticalDock: React.FC<DockProps> = ({ children }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Hover detection area */}
      <div 
        className="fixed left-0 top-0 w-2 h-full z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40"
        initial={{ x: -100 }}
        animate={{ x: isHovered ? 0 : -100 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 25,
          mass: 1
        }}
      >
        <motion.div
          className={`flex flex-col items-center py-6 px-4 rounded-r-2xl ${
            theme === 'dark' 
              ? 'bg-black/40 border-r border-white/10' 
              : 'bg-white/40 border-r border-black/10'
          } backdrop-blur-sm space-y-4`}
        >
          <div className="space-y-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default VerticalDock;