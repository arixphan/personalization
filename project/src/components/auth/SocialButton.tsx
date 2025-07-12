import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  onClick: () => void;
  children: React.ReactNode;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick, children }) => {
  const { theme } = useTheme();

  const getProviderStyles = () => {
    switch (provider) {
      case 'google':
        return {
          bg: theme === 'dark' ? 'bg-white hover:bg-gray-100' : 'bg-white hover:bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-300'
        };
      case 'facebook':
        return {
          bg: 'bg-blue-600 hover:bg-blue-700',
          text: 'text-white',
          border: 'border-blue-600'
        };
      default:
        return {
          bg: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
          text: theme === 'dark' ? 'text-white' : 'text-gray-900',
          border: theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
        };
    }
  };

  const styles = getProviderStyles();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg border transition-all duration-200 ${styles.bg} ${styles.text} ${styles.border} shadow-sm`}
    >
      {children}
    </motion.button>
  );
};

export default SocialButton;