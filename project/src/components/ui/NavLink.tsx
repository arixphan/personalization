import React from 'react';
import { NavLinkProps } from '../../types';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, isActive = false }) => {
  const { theme } = useTheme();
  
  return (
    <motion.a
      href={to}
      className={`relative flex items-center justify-center p-2 rounded-lg ${
        isActive 
          ? theme === 'dark' 
            ? 'bg-gray-700 text-white' 
            : 'bg-gray-100 text-gray-900' 
          : theme === 'dark'
            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } transition-colors group`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      
      {/* Tooltip */}
      <motion.span
        className={`absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap ${
          theme === 'dark' 
            ? 'bg-gray-700 text-white' 
            : 'bg-white text-gray-900 shadow-md'
        } opacity-0 group-hover:opacity-100 pointer-events-none`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </motion.a>
  );
};

export default NavLink;