import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Eye, 
  Edit, 
  Calendar,
  Tag,
  FileText,
  Image,
  BookOpen,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  coverImage?: string;
  categories: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  readTime: number; // in minutes
}

const Blog: React.FC = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'category'>('none');
  const [showNewPost, setShowNewPost] = useState(false);

  // Mock data
  const [posts] = useState<Post[]>([
    {
      id: '1',
      title: 'Getting Started with React Hooks',
      description: 'A comprehensive guide to understanding and implementing React Hooks in your applications.',
      content: 'React Hooks revolutionized how we write React components...',
      coverImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['React', 'JavaScript', 'Tutorial'],
      status: 'published',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      author: 'John Doe',
      readTime: 8
    },
    {
      id: '2',
      title: 'API Design Best Practices',
      description: 'Learn how to design robust and scalable APIs that developers love to use.',
      content: 'When designing APIs, consistency is key...',
      coverImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['API', 'Backend', 'Documentation'],
      status: 'published',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
      author: 'Jane Smith',
      readTime: 12
    },
    {
      id: '3',
      title: 'Database Optimization Strategies',
      description: 'Techniques and strategies for optimizing database performance in production environments.',
      content: 'Database optimization is crucial for application performance...',
      categories: ['Database', 'Performance', 'Research'],
      status: 'draft',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22'),
      author: 'Mike Johnson',
      readTime: 15
    },
    {
      id: '4',
      title: 'UI/UX Design Principles',
      description: 'Fundamental principles every designer should know for creating intuitive user interfaces.',
      content: 'Good design is invisible to the user...',
      coverImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
      categories: ['Design', 'UX', 'Tutorial'],
      status: 'published',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-06'),
      author: 'Sarah Wilson',
      readTime: 10
    },
    {
      id: '5',
      title: 'Machine Learning Research Notes',
      description: 'Personal research notes on recent developments in machine learning and AI.',
      content: 'Recent advances in transformer architectures...',
      categories: ['AI', 'Research', 'Notes'],
      status: 'archived',
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2023-12-20'),
      author: 'Alex Chen',
      readTime: 20
    },
    {
      id: '6',
      title: 'Project Management Methodologies',
      description: 'Comparing different project management approaches and their effectiveness.',
      content: 'Agile vs Waterfall vs Kanban...',
      categories: ['Management', 'Documentation', 'Business'],
      status: 'draft',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-26'),
      author: 'Emily Davis',
      readTime: 7
    }
  ]);

  // Get all unique categories
  const allCategories = Array.from(new Set(posts.flatMap(post => post.categories)));

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || post.categories.includes(categoryFilter);
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group posts
  const groupedPosts = () => {
    if (groupBy === 'none') {
      return { 'All Posts': filteredPosts };
    } else if (groupBy === 'status') {
      const groups: { [key: string]: Post[] } = {};
      filteredPosts.forEach(post => {
        const status = post.status.charAt(0).toUpperCase() + post.status.slice(1);
        if (!groups[status]) groups[status] = [];
        groups[status].push(post);
      });
      return groups;
    } else if (groupBy === 'category') {
      const groups: { [key: string]: Post[] } = {};
      filteredPosts.forEach(post => {
        post.categories.forEach(category => {
          if (!groups[category]) groups[category] = [];
          if (!groups[category].includes(post)) {
            groups[category].push(post);
          }
        });
      });
      return groups;
    }
    return { 'All Posts': filteredPosts };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className={`text-lg sm:text-xl font-semibold line-clamp-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {post.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)} ml-2 flex-shrink-0`}>
            {post.status}
          </span>
        </div>
        
        <p className={`text-sm mb-4 line-clamp-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {post.description}
        </p>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
          {post.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className={`px-2 py-1 text-xs rounded-full ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category}
            </span>
          ))}
          {post.categories.length > 3 && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              +{post.categories.length - 3}
            </span>
          )}
        </div>
        
        <div className={`flex items-center justify-between text-xs sm:text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="flex items-center space-x-1">
              <Calendar size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{post.updatedAt.toLocaleDateString()}</span>
              <span className="sm:hidden">{post.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </span>
            <span className="flex items-center space-x-1">
              <BookOpen size={12} className="sm:w-4 sm:h-4" />
              <span>{post.readTime}m</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              className={`p-1.5 sm:p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              className={`p-1.5 sm:p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Edit size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const PostListItem: React.FC<{ post: Post }> = ({ post }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-2 sm:p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } transition-colors group`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Image - smaller on mobile */}
        {post.coverImage && (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status - Mobile optimized */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-sm sm:text-base font-medium line-clamp-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {post.title}
            </h3>
            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full flex-shrink-0 ${getStatusColor(post.status)}`}>
              {post.status}
            </span>
          </div>
          
          {/* Description - Hidden on very small screens */}
          <p className={`text-xs sm:text-sm line-clamp-1 sm:line-clamp-2 mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          } hidden xs:block`}>
            {post.description}
          </p>
          
          {/* Meta information - Compact mobile layout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Categories - Show fewer on mobile */}
              <div className="flex gap-1">
                {post.categories.slice(0, window.innerWidth < 640 ? 1 : 2).map((category) => (
                  <span
                    key={category}
                    className={`px-1.5 py-0.5 text-xs rounded-full ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </span>
                ))}
                {post.categories.length > (window.innerWidth < 640 ? 1 : 2) && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    +{post.categories.length - (window.innerWidth < 640 ? 1 : 2)}
                  </span>
                )}
              </div>
              
              {/* Date and read time - Compact */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`flex items-center gap-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <Calendar size={10} />
                  <span className="hidden sm:inline">{post.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="sm:hidden">{post.updatedAt.getDate()}/{post.updatedAt.getMonth() + 1}</span>
                </span>
                <span className={`flex items-center gap-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <BookOpen size={10} />
                  <span>{post.readTime}m</span>
                </span>
              </div>
            </div>

            {/* Action buttons - Smaller on mobile */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className={`p-1.5 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <Eye size={12} className="sm:w-4 sm:h-4" />
              </button>
              <button
                className={`p-1.5 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <Edit size={12} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full overflow-auto px-3 sm:px-4 md:px-6">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Documentation & Blog
            </h1>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Write, organize, and share your documentation, blogs, research, and posts
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPost(true)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={16} />
            <input
              type="text"
              placeholder="Search posts, categories, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          <div className="grid grid-cols-2 sm:flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Categories</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className={`px-2 py-2 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm col-span-2 sm:col-span-1 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="none">No Grouping</option>
              <option value="status">Group by Status</option>
              <option value="category">Group by Category</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className={`flex rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm ${
                viewMode === 'cards'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 sm:px-4 sm:py-2 flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm ${
                viewMode === 'list'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
          
          <div className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {filteredPosts.length} posts
          </div>
        </div>
      </header>

      {/* Posts Display */}
      <div className="space-y-6 sm:space-y-8">
        {Object.entries(groupedPosts()).map(([groupName, groupPosts]) => (
          <div key={groupName}>
            {groupBy !== 'none' && (
              <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center space-x-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Layers size={16} className="sm:w-5 sm:h-5" />
                <span>{groupName} ({groupPosts.length})</span>
              </h2>
            )}
            
            <AnimatePresence mode="wait">
              {viewMode === 'cards' ? (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                  {groupPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1 sm:space-y-2"
                >
                  {groupPosts.map((post) => (
                    <PostListItem key={post.id} post={post} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className={`text-center py-8 sm:py-12 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <FileText size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg">No posts found matching your criteria</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Blog;