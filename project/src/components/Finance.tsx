import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, Layout, BookOpen, Plus, ArrowRight, ArrowLeft, X, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinanceSettings from './FinanceSettings';

const Finance: React.FC = () => {
  const { theme } = useTheme();
  const [view, setView] = useState<'dashboard' | 'journal' | 'settings'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expensePeriod, setExpensePeriod] = useState<'week' | 'month'>('week');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: 'Food',
    wallet: 'Main Wallet'
  });

  // Mock data
  const monthlyData = [
    { month: 'Jan', income: 5000, outcome: 3200 },
    { month: 'Feb', income: 5200, outcome: 3400 },
    { month: 'Mar', income: 4800, outcome: 3100 },
    { month: 'Apr', income: 5500, outcome: 3800 },
    { month: 'May', income: 5300, outcome: 3600 },
    { month: 'Jun', income: 5700, outcome: 4000 }
  ];

  const walletData = [
    { name: 'Main Wallet', value: 15000, color: '#3B82F6' },
    { name: 'Savings', value: 25000, color: '#10B981' },
    { name: 'Investment', value: 8000, color: '#F59E0B' },
    { name: 'Emergency Fund', value: 12000, color: '#EF4444' }
  ];

  // Daily expense data for the current week
  const weeklyExpenseData = [
    { day: 'Mon', Food: 45, Transport: 15, Entertainment: 0, Utilities: 0, Shopping: 25, Health: 0 },
    { day: 'Tue', Food: 32, Transport: 12, Entertainment: 20, Utilities: 0, Shopping: 0, Health: 0 },
    { day: 'Wed', Food: 28, Transport: 15, Entertainment: 0, Utilities: 120, Shopping: 45, Health: 0 },
    { day: 'Thu', Food: 55, Transport: 8, Entertainment: 35, Utilities: 0, Shopping: 0, Health: 89 },
    { day: 'Fri', Food: 67, Transport: 20, Entertainment: 45, Utilities: 0, Shopping: 120, Health: 0 },
    { day: 'Sat', Food: 89, Transport: 25, Entertainment: 80, Utilities: 0, Shopping: 200, Health: 0 },
    { day: 'Sun', Food: 42, Transport: 0, Entertainment: 60, Utilities: 0, Shopping: 0, Health: 0 }
  ];

  // Monthly expense data (weekly aggregated)
  const monthlyExpenseData = [
    { week: 'Week 1', Food: 280, Transport: 95, Entertainment: 140, Utilities: 120, Shopping: 390, Health: 89 },
    { week: 'Week 2', Food: 320, Transport: 110, Entertainment: 180, Utilities: 0, Shopping: 450, Health: 0 },
    { week: 'Week 3', Food: 290, Transport: 85, Entertainment: 120, Utilities: 150, Shopping: 320, Health: 120 },
    { week: 'Week 4', Food: 310, Transport: 100, Entertainment: 160, Utilities: 130, Shopping: 380, Health: 0 }
  ];

  const expenseCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health'];
  const categoryColors = {
    Food: '#3B82F6',
    Transport: '#10B981',
    Entertainment: '#F59E0B',
    Utilities: '#EF4444',
    Shopping: '#8B5CF6',
    Health: '#EC4899'
  };

  const quickAddCategories = [
    { name: 'Food', icon: '🍽️', color: 'bg-blue-500' },
    { name: 'Transport', icon: '🚗', color: 'bg-green-500' },
    { name: 'Entertainment', icon: '🎬', color: 'bg-yellow-500' },
    { name: 'Utilities', icon: '⚡', color: 'bg-red-500' },
    { name: 'Shopping', icon: '🛍️', color: 'bg-purple-500' },
    { name: 'Health', icon: '🏥', color: 'bg-pink-500' }
  ];

  const todayTransactions = [
    { id: 1, type: 'expense', amount: 25.50, description: 'Coffee and breakfast', category: 'Food', wallet: 'Main Wallet', time: '08:30' },
    { id: 2, type: 'expense', amount: 12.00, description: 'Bus fare', category: 'Transport', wallet: 'Main Wallet', time: '09:15' },
    { id: 3, type: 'income', amount: 500.00, description: 'Freelance payment', category: 'Work', wallet: 'Main Wallet', time: '10:45' },
    { id: 4, type: 'expense', amount: 45.80, description: 'Lunch with colleagues', category: 'Food', wallet: 'Main Wallet', time: '12:30' },
    { id: 5, type: 'expense', amount: 15.00, description: 'Parking fee', category: 'Transport', wallet: 'Main Wallet', time: '14:20' },
    { id: 6, type: 'expense', amount: 89.99, description: 'Monthly gym membership', category: 'Health', wallet: 'Main Wallet', time: '16:00' },
    { id: 7, type: 'expense', amount: 35.60, description: 'Grocery shopping', category: 'Food', wallet: 'Main Wallet', time: '17:45' },
    { id: 8, type: 'expense', amount: 8.50, description: 'Coffee break', category: 'Food', wallet: 'Main Wallet', time: '19:30' },
    { id: 9, type: 'income', amount: 50.00, description: 'Cashback reward', category: 'Rewards', wallet: 'Main Wallet', time: '20:15' },
    { id: 10, type: 'expense', amount: 22.30, description: 'Online subscription', category: 'Entertainment', wallet: 'Main Wallet', time: '21:00' }
  ];

  const totalBalance = walletData.reduce((sum, wallet) => sum + wallet.value, 0);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const netIncome = currentMonth.income - currentMonth.outcome;

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.description) {
      // In a real app, this would add to the transactions list
      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        category: 'Food',
        wallet: 'Main Wallet'
      });
    }
  };

  const handleQuickAdd = (category: string) => {
    if (quickAmount && parseFloat(quickAmount) > 0) {
      // In a real app, this would add the transaction to the list
      console.log(`Added ${category} expense: $${quickAmount}`);
      setQuickAmount('');
      setShowQuickAdd(false);
    }
  };

  const QuickAddModal = () => (
    <AnimatePresence>
      {showQuickAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuickAdd(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md mx-auto rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-2xl md:max-w-lg`}
            style={{
              maxHeight: '90vh',
              height: window.innerWidth < 768 ? '100vh' : 'auto',
              borderRadius: window.innerWidth < 768 ? '0' : '1rem'
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Add Expense
              </h2>
              <button
                onClick={() => setShowQuickAdd(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <label className={`block mb-3 text-lg font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Amount
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 text-2xl font-bold rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  } focus:outline-none transition-colors`}
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={`block mb-3 text-lg font-medium ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {quickAddCategories.map((category) => (
                  <motion.button
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAdd(category.name)}
                    disabled={!quickAmount || parseFloat(quickAmount) <= 0}
                    className={`p-4 rounded-xl flex flex-col items-center space-y-2 transition-all ${
                      !quickAmount || parseFloat(quickAmount) <= 0
                        ? theme === 'dark'
                          ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-100 opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Enter an amount and tap a category to add expense
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const JournalEntry = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Add Transaction
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  newTransaction.type === 'income'
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  newTransaction.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Expense
              </button>
            </div>

            <input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />

            <input
              type="text"
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />

            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Work">Work</option>
              <option value="Rewards">Rewards</option>
            </select>

            <select
              value={newTransaction.wallet}
              onChange={(e) => setNewTransaction({ ...newTransaction, wallet: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              {walletData.map((wallet) => (
                <option key={wallet.name} value={wallet.name}>{wallet.name}</option>
              ))}
            </select>

            <button
              onClick={handleAddTransaction}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Transactions
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {transaction.category}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {transaction.description}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {transaction.wallet} • {transaction.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-4">
      {/* Monthly Income & Outcome */}
      <div className={`p-4 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Monthly Cash Flow
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-green-600'
                }`}>
                  Total Income
                </p>
                <p className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-green-700'
                }`}>
                  ${currentMonth.income.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-red-600'
                }`}>
                  Total Outcome
                </p>
                <p className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-red-700'
                }`}>
                  ${currentMonth.outcome.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-blue-600'
                }`}>
                  Net Income
                </p>
                <p className={`text-2xl font-bold ${
                  netIncome >= 0 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-700'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>
                  ${netIncome.toLocaleString()}
                </p>
              </div>
              <DollarSign className={`${
                netIncome >= 0 ? 'text-green-500' : 'text-red-500'
              }`} size={24} />
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Outcome']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="outcome" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2 }}
                name="Outcome"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Balance and Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`col-span-1 p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Total Balance
          </h2>
          
          <div className="text-center">
            <div className={`inline-flex p-4 rounded-full ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            } mb-4`}>
              <Wallet className="text-blue-500" size={32} />
            </div>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${totalBalance.toLocaleString()}
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Across all wallets
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {walletData.map((wallet) => (
              <div key={wallet.name} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: wallet.color }}
                  />
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {wallet.name}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${wallet.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`col-span-2 p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Wallet Distribution
          </h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={walletData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {walletData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Expense Tracking */}
      <div className={`p-4 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Expenses by Category
          </h2>
          
          <div className={`flex rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setExpensePeriod('week')}
              className={`px-4 py-2 text-sm transition-colors ${
                expensePeriod === 'week'
                  ? theme === 'dark'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setExpensePeriod('month')}
              className={`px-4 py-2 text-sm transition-colors ${
                expensePeriod === 'month'
                  ? theme === 'dark'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month View
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={expensePeriod === 'week' ? weeklyExpenseData : monthlyExpenseData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey={expensePeriod === 'week' ? 'day' : 'week'}
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#FFFFFF' : '#000000'
                }}
                formatter={(value, name) => [`$${value}`, name]}
                labelFormatter={(label) => `${expensePeriod === 'week' ? 'Day' : 'Week'}: ${label}`}
              />
              <Legend />
              {expenseCategories.map((category) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="expenses"
                  fill={categoryColors[category as keyof typeof categoryColors]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {expenseCategories.map((category) => {
            const data = expensePeriod === 'week' ? weeklyExpenseData : monthlyExpenseData;
            const total = data.reduce((sum, item) => sum + (item[category as keyof typeof item] as number || 0), 0);
            
            return (
              <div
                key={category}
                className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
                  />
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {category}
                  </span>
                </div>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${total}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  This {expensePeriod}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (view === 'settings') {
    return <FinanceSettings onClose={() => setView('dashboard')} />;
  }

  return (
    <div className="h-full overflow-auto px-2 sm:px-4 md:px-6">
      <header className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Finance Management
              </h1>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Track your finances and manage your wealth
              </p>
            </div>
          </div>
          
          {/* Mobile-optimized button row */}
          <div className="flex items-center justify-between gap-2">
            {/* View Toggle - Redesigned for mobile */}
            <div className={`flex rounded-lg overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setView('dashboard')}
                className={`px-3 sm:px-4 py-2 flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
                  view === 'dashboard'
                    ? theme === 'dark'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-900 shadow'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout size={16} />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setView('journal')}
                className={`px-3 sm:px-4 py-2 flex items-center justify-center space-x-1 sm:space-x-2 transition-colors ${
                  view === 'journal'
                    ? theme === 'dark'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-900 shadow'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen size={16} />
                <span className="text-sm hidden sm:inline">Journal</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Quick Add Button - Icon only on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickAdd(true)}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white shadow-lg transition-all`}
              >
                <Zap size={16} />
                <span className="text-sm font-medium hidden sm:inline">Quick Add</span>
              </motion.button>

              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('settings')}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } transition-all`}
              >
                <Settings size={16} />
                <span className="text-sm font-medium hidden sm:inline">Settings</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'dashboard' ? <Dashboard /> : <JournalEntry />}
        </motion.div>
      </AnimatePresence>

      <QuickAddModal />
    </div>
  );
};

export default Finance;