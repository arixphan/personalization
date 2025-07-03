import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DockProps } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Dock: React.FC<DockProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useTheme();

  const toggleDock = () => {
    setIsVisible(!isVisible);
  };

  return (
    <motion.div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-50`}
    >
      <button
        onClick={toggleDock}
        className={`p-1 rounded-t-lg ${
          theme === 'dark' 
            ? 'bg-black/40 text-white hover:bg-black/60' 
            : 'bg-white/40 text-gray-800 hover:bg-white/60'
        } backdrop-blur-sm transition-colors`}
      >
        {isVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>
      
      <motion.div
        className={`flex items-center justify-center py-3 px-6 rounded-t-xl ${
          theme === 'dark' 
            ? 'bg-black/40 border-t border-white/10' 
            : 'bg-white/40 border-t border-black/10'
        } backdrop-blur-sm`}
        initial={false}
        animate={{ 
          y: isVisible ? 0 : 100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex space-x-4 items-end">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dock;