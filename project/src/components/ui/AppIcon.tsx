import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppIconProps } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const AppIcon: React.FC<AppIconProps> = ({ icon, label, onClick, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  return (
    <motion.div
      className="flex flex-col items-center justify-center relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className={`p-3 rounded-xl cursor-pointer flex items-center justify-center ${
          isActive 
            ? theme === 'dark' 
              ? 'bg-white/20' 
              : 'bg-black/20' 
            : theme === 'dark'
              ? 'hover:bg-white/10'
              : 'hover:bg-black/10'
        } transition-colors`}
        whileHover={{ scale: 1.2, y: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Indicator dot */}
      {isActive && (
        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
          theme === 'dark' ? 'bg-white' : 'bg-black'
        }`}></div>
      )}

      {/* Tooltip */}
      <motion.div
        className={`absolute bottom-full mb-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
          theme === 'dark' 
            ? 'bg-black/80 text-white' 
            : 'bg-white/80 text-gray-800'
        } backdrop-blur-sm`}
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          y: isHovered ? 0 : 10, 
          scale: isHovered ? 1 : 0.8 
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

export default AppIcon;