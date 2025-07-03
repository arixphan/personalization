import React from 'react';
import { DashboardProps } from '../../types';
import MainContent from './MainContent';
import { useTheme } from '../../context/ThemeContext';
import NavBar from "./NavBar"

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="flex">
        <NavBar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default Dashboard;