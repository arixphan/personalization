import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-200'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-200'
        }`}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className={`rounded-2xl shadow-2xl p-8 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border border-white/50'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}
            >
              <span className="text-2xl font-bold text-white">P</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {subtitle}
            </motion.p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-center mt-6 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          © 2024 Personal Dashboard. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;