import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Calendar, 
  ClipboardList, 
  DollarSign, 
  BookOpen, 
  FileText,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { theme } = useTheme();
  
  const appCards = [
    { 
      title: 'Projects Management', 
      icon: <ClipboardList size={24} />, 
      description: 'Organize and track all your projects in one place.',
      color: 'bg-blue-500',
      link: '/projects' 
    },
    { 
      title: 'Time Management', 
      icon: <Calendar size={24} />, 
      description: 'Schedule your day and manage your time effectively.',
      color: 'bg-green-500',
      link: '/time' 
    },
    { 
      title: 'Finance Management', 
      icon: <DollarSign size={24} />, 
      description: 'Track your expenses and manage your finances.',
      color: 'bg-purple-500',
      link: '/finance' 
    },
    { 
      title: 'Trading Management', 
      icon: <TrendingUp size={24} />, 
      description: 'Track your market analysis and trading performance.',
      color: 'bg-orange-500',
      link: '/trading' 
    },
    { 
      title: 'Diary', 
      icon: <BookOpen size={24} />, 
      description: 'Record your thoughts and experiences.',
      color: 'bg-yellow-500',
      link: '/diary' 
    },
    { 
      title: 'Documentation & Blog', 
      icon: <FileText size={24} />, 
      description: 'Write documentation, blogs, research, and posts.',
      color: 'bg-red-500',
      link: '/blog' 
    },
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <div>
      <header className="mb-8">
        <h1 className={`text-3xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Welcome to Your Personal Dashboard
        </h1>
        <p className={`mt-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Access all your tools and productivity apps in one place
        </p>
      </header>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {appCards.map((card, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className={`rounded-xl p-6 ${
              theme === 'dark' 
                ? 'bg-gray-700/50 hover:bg-gray-700/80' 
                : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors duration-300 cursor-pointer group`}
          >
            <div className={`${card.color} text-white p-3 rounded-lg inline-flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {card.title}
            </h2>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {card.description}
            </p>
            <a 
              href={card.link} 
              className={`inline-flex items-center text-sm font-medium ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Open App 
              <ArrowRight size={16} className="ml-1 transform transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;