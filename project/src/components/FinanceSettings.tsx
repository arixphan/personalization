import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Star,
  StarOff
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface Wallet {
  id: string;
  name: string;
  description: string;
  expenseApplied: boolean;
  isDefault: boolean;
  isActive: boolean;
}

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  walletId: string;
  appliedDate: number; // day of month (1-31)
  isActive: boolean;
}

interface FinanceSettingsProps {
  onClose: () => void;
}

const FinanceSettings: React.FC<FinanceSettingsProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'categories' | 'wallets' | 'recurring'>('categories');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editingRecurring, setEditingRecurring] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewWallet, setShowNewWallet] = useState(false);
  const [showNewRecurring, setShowNewRecurring] = useState(false);

  // Mock data - in real app this would come from state management
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Food', color: '#3B82F6', icon: '🍽️', isActive: true },
    { id: '2', name: 'Transport', color: '#10B981', icon: '🚗', isActive: true },
    { id: '3', name: 'Entertainment', color: '#F59E0B', icon: '🎬', isActive: true },
    { id: '4', name: 'Utilities', color: '#EF4444', icon: '⚡', isActive: true },
    { id: '5', name: 'Shopping', color: '#8B5CF6', icon: '🛍️', isActive: true },
    { id: '6', name: 'Health', color: '#EC4899', icon: '🏥', isActive: true },
  ]);

  const [wallets, setWallets] = useState<Wallet[]>([
    { id: '1', name: 'Main Wallet', description: 'Primary checking account', expenseApplied: true, isDefault: true, isActive: true },
    { id: '2', name: 'Savings', description: 'Emergency fund and savings', expenseApplied: false, isDefault: false, isActive: true },
    { id: '3', name: 'Credit Card', description: 'Monthly credit card expenses', expenseApplied: true, isDefault: false, isActive: true },
    { id: '4', name: 'Cash', description: 'Physical cash expenses', expenseApplied: true, isDefault: false, isActive: false },
  ]);

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([
    { id: '1', name: 'Rent', amount: 1200, categoryId: '4', walletId: '1', appliedDate: 1, isActive: true },
    { id: '2', name: 'Netflix Subscription', amount: 15.99, categoryId: '3', walletId: '1', appliedDate: 15, isActive: true },
    { id: '3', name: 'Internet Bill', amount: 59.99, categoryId: '4', walletId: '1', appliedDate: 5, isActive: true },
    { id: '4', name: 'Gym Membership', amount: 29.99, categoryId: '6', walletId: '1', appliedDate: 10, isActive: false },
  ]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📝',
    isActive: true
  });

  const [newWallet, setNewWallet] = useState({
    name: '',
    description: '',
    expenseApplied: true,
    isDefault: false,
    isActive: true
  });

  const [newRecurring, setNewRecurring] = useState({
    name: '',
    amount: 0,
    categoryId: categories[0]?.id || '',
    walletId: wallets.filter(w => w.expenseApplied)[0]?.id || '',
    appliedDate: 1,
    isActive: true
  });

  const commonIcons = [
    '🍽️', '🚗', '🎬', '⚡', '🛍️', '🏥', '🏠', '📱', '💻', '✈️',
    '🎓', '💰', '🎵', '📚', '☕', '🍕', '🚌', '⛽', '💊', '👕',
    '🎮', '📺', '🏋️', '💇', '🐕', '🌱', '🔧', '📝', '💳', '🎁'
  ];

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const handleSaveCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: Date.now().toString(),
        ...newCategory
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', color: '#3B82F6', icon: '📝', isActive: true });
      setShowNewCategory(false);
    }
  };

  const handleSaveWallet = () => {
    if (newWallet.name.trim()) {
      const wallet: Wallet = {
        id: Date.now().toString(),
        ...newWallet
      };
      setWallets([...wallets, wallet]);
      setNewWallet({ name: '', description: '', expenseApplied: true, isDefault: false, isActive: true });
      setShowNewWallet(false);
    }
  };

  const handleSaveRecurring = () => {
    if (newRecurring.name.trim() && newRecurring.amount > 0) {
      const recurring: RecurringExpense = {
        id: Date.now().toString(),
        ...newRecurring
      };
      setRecurringExpenses([...recurringExpenses, recurring]);
      setNewRecurring({
        name: '',
        amount: 0,
        categoryId: categories[0]?.id || '',
        walletId: wallets.filter(w => w.expenseApplied)[0]?.id || '',
        appliedDate: 1,
        isActive: true
      });
      setShowNewRecurring(false);
    }
  };

  const handleSetDefaultWallet = (walletId: string) => {
    setWallets(wallets.map(wallet => ({
      ...wallet,
      isDefault: wallet.id === walletId && wallet.expenseApplied
    })));
  };

  const handleToggleWalletActive = (walletId: string) => {
    setWallets(wallets.map(wallet => 
      wallet.id === walletId 
        ? { ...wallet, isActive: !wallet.isActive, isDefault: !wallet.isActive ? false : wallet.isDefault }
        : wallet
    ));
  };

  const handleToggleCategoryActive = (categoryId: string) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { ...category, isActive: !category.isActive }
        : category
    ));
  };

  const handleToggleRecurringActive = (recurringId: string) => {
    setRecurringExpenses(recurringExpenses.map(recurring => 
      recurring.id === recurringId 
        ? { ...recurring, isActive: !recurring.isActive }
        : recurring
    ));
  };

  const handleDeleteRecurring = (recurringId: string) => {
    setRecurringExpenses(recurringExpenses.filter(recurring => recurring.id !== recurringId));
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getWalletName = (walletId: string) => {
    return wallets.find(w => w.id === walletId)?.name || 'Unknown';
  };

  const expenseWallets = wallets.filter(w => w.expenseApplied);

  const tabs = [
    { id: 'categories', label: 'Categories', count: categories.length },
    { id: 'wallets', label: 'Wallets', count: wallets.length },
    { id: 'recurring', label: 'Recurring', count: recurringExpenses.length }
  ];

  return (
    <div className="h-full overflow-auto">
      <header className="mb-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className={`mr-4 p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Finance Settings
            </h1>
            <p className={`mt-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Configure your finance management preferences
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex rounded-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Expense Categories
                </h2>
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } ${!category.isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {category.name}
                          </h3>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleCategoryActive(category.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          {category.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setEditingCategory(category.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Category Form */}
              {showNewCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-6 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Add New Category
                    </h3>
                    <button
                      onClick={() => setShowNewCategory(false)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter category name"
                      />
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Icon
                      </label>
                      <div className="grid grid-cols-10 gap-2">
                        {commonIcons.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewCategory({ ...newCategory, icon })}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                              newCategory.icon === icon
                                ? 'bg-blue-500 text-white'
                                : theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Color
                      </label>
                      <div className="flex space-x-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewCategory({ ...newCategory, color })}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newCategory.color === color ? 'border-gray-400' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowNewCategory(false)}
                        className={`px-4 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCategory}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                      >
                        <Save size={18} />
                        <span>Save Category</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Wallets & Accounts
                </h2>
                <button
                  onClick={() => setShowNewWallet(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Wallet</span>
                </button>
              </div>

              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } ${!wallet.isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {wallet.name}
                            {wallet.isDefault && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">
                                Default
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {wallet.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            wallet.expenseApplied
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {wallet.expenseApplied ? 'Expense Account' : 'Savings Account'}
                          </span>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {wallet.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {wallet.expenseApplied && wallet.isActive && (
                          <button
                            onClick={() => handleSetDefaultWallet(wallet.id)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            title={wallet.isDefault ? 'Remove as default' : 'Set as default'}
                          >
                            {wallet.isDefault ? <Star size={18} className="text-yellow-500" /> : <StarOff size={18} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleWalletActive(wallet.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          {wallet.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setEditingWallet(wallet.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Wallet Form */}
              {showNewWallet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-6 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Add New Wallet
                    </h3>
                    <button
                      onClick={() => setShowNewWallet(false)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Wallet Name
                      </label>
                      <input
                        type="text"
                        value={newWallet.name}
                        onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter wallet name"
                      />
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Description
                      </label>
                      <textarea
                        value={newWallet.description}
                        onChange={(e) => setNewWallet({ ...newWallet, description: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter wallet description"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newWallet.expenseApplied}
                          onChange={(e) => setNewWallet({ ...newWallet, expenseApplied: e.target.checked })}
                          className="rounded"
                        />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Use for expense tracking
                        </span>
                      </label>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Enable this if you want to track expenses from this wallet
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowNewWallet(false)}
                        className={`px-4 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveWallet}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                      >
                        <Save size={18} />
                        <span>Save Wallet</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Recurring Expenses Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Monthly Recurring Expenses
                </h2>
                <button
                  onClick={() => setShowNewRecurring(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Add Recurring</span>
                </button>
              </div>

              <div className="space-y-4">
                {recurringExpenses.map((recurring) => (
                  <div
                    key={recurring.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } ${!recurring.isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {recurring.name}
                          </h3>
                          <span className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${recurring.amount}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {getCategoryName(recurring.categoryId)}
                          </span>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {getWalletName(recurring.walletId)}
                          </span>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Every {recurring.appliedDate}{recurring.appliedDate === 1 ? 'st' : recurring.appliedDate === 2 ? 'nd' : recurring.appliedDate === 3 ? 'rd' : 'th'} of month
                          </span>
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {recurring.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRecurringActive(recurring.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          {recurring.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setEditingRecurring(recurring.id)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecurring(recurring.id)}
                          className={`p-2 rounded-lg text-red-500 hover:bg-red-50 ${
                            theme === 'dark' ? 'hover:bg-red-900/20' : ''
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Recurring Expense Form */}
              {showNewRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-6 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Add Recurring Expense
                    </h3>
                    <button
                      onClick={() => setShowNewRecurring(false)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Expense Name
                      </label>
                      <input
                        type="text"
                        value={newRecurring.name}
                        onChange={(e) => setNewRecurring({ ...newRecurring, name: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="e.g., Netflix Subscription"
                      />
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newRecurring.amount}
                        onChange={(e) => setNewRecurring({ ...newRecurring, amount: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Category
                      </label>
                      <select
                        value={newRecurring.categoryId}
                        onChange={(e) => setNewRecurring({ ...newRecurring, categoryId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {categories.filter(c => c.isActive).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Wallet
                      </label>
                      <select
                        value={newRecurring.walletId}
                        onChange={(e) => setNewRecurring({ ...newRecurring, walletId: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {expenseWallets.filter(w => w.isActive).map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block mb-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Applied Date (Day of Month)
                      </label>
                      <select
                        value={newRecurring.appliedDate}
                        onChange={(e) => setNewRecurring({ ...newRecurring, appliedDate: parseInt(e.target.value) })}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>
                            {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowNewRecurring(false)}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRecurring}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Save Recurring</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinanceSettings;