import React from 'react';
import { MainContentProps } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <main className={`flex-1 p-6 h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="h-full">
        {children}
      </div>
    </main>
  );
};

export default MainContent;