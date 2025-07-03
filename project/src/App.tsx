import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/layout/Dashboard';
import Home from './components/Home';
import Projects from './components/Projects';
import Finance from './components/Finance';
import Blog from './components/Blog';
import { 
  Home as HomeIcon, 
  Calendar, 
  ClipboardList, 
  DollarSign, 
  BookOpen, 
  FileText,
  Cog,
  FolderSearch
} from 'lucide-react';
import Dock from './components/ui/Dock';
import AppIcon from './components/ui/AppIcon';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <ThemeProvider>
      <Dashboard>
        {currentView === 'home' && <Home />}
        {currentView === 'projects' && <Projects />}
        {currentView === 'finance' && <Finance />}
        {currentView === 'blog' && <Blog />}
      </Dashboard>
      <Dock>
        <AppIcon 
          icon={<HomeIcon size={24} />} 
          label="Home" 
          isActive={currentView === 'home'}
          onClick={() => setCurrentView('home')}
        />
        <AppIcon 
          icon={<ClipboardList size={24} />} 
          label="Projects" 
          isActive={currentView === 'projects'}
          onClick={() => setCurrentView('projects')}
        />
        <AppIcon icon={<Calendar size={24} />} label="Time" />
        <AppIcon 
          icon={<DollarSign size={24} />} 
          label="Finance" 
          isActive={currentView === 'finance'}
          onClick={() => setCurrentView('finance')}
        />
        <AppIcon icon={<BookOpen size={24} />} label="Diary" />
        <AppIcon 
          icon={<FileText size={24} />} 
          label="Documentation" 
          isActive={currentView === 'blog'}
          onClick={() => setCurrentView('blog')}
        />
        <AppIcon icon={<FolderSearch size={24} />} label="Files" />
        <AppIcon icon={<Cog size={24} />} label="Settings" />
      </Dock>
    </ThemeProvider>
  );
}