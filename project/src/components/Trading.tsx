import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  X,
  Plus,
  Target,
  Activity,
  PieChartIcon,
  LineChart,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart as RechartsLineChart, Line } from 'recharts';

interface MarketAnalysis {
  id: string;
  date: string;
  title: string;
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  tags: string[];
  type: 'stock' | 'crypto';
  symbol: string;
}

interface TradeEntry {
  id: string;
  date: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  status: 'open' | 'closed';
  strategy: string;
  notes: string;
  assetType: 'stock' | 'crypto';
}

const Trading: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'trading-view' | 'performance'>('trading-view');
  const [subTab, setSubTab] = useState<'market-analysis' | 'trading-journal'>('market-analysis');
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 0)); // January 2024
  const [editingAnalysis, setEditingAnalysis] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');

  // Mock data for Market Analysis - Comprehensive data across multiple months
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAnalysis[]>([
    // January 2024
    {
      id: '1',
      date: '2024-01-30',
      title: 'Bitcoin Technical Analysis',
      content: 'BTC showing strong support at $42k level. RSI oversold, potential bounce expected. Key resistance at $45k.',
      sentiment: 'bullish',
      tags: ['BTC', 'Technical Analysis', 'Support/Resistance'],
      type: 'crypto',
      symbol: 'BTC'
    },
    {
      id: '2',
      date: '2024-01-29',
      title: 'S&P 500 Market Outlook',
      content: 'SPY approaching major resistance zone. Volume declining, expecting consolidation or pullback.',
      sentiment: 'neutral',
      tags: ['SPY', 'Market Outlook', 'Volume Analysis'],
      type: 'stock',
      symbol: 'SPY'
    },
    {
      id: '3',
      date: '2024-01-28',
      title: 'NVDA Earnings Impact',
      content: 'NVDA earnings beat expectations but guidance cautious. AI sector rotation possible.',
      sentiment: 'bearish',
      tags: ['NVDA', 'Earnings', 'AI Sector'],
      type: 'stock',
      symbol: 'NVDA'
    },
    {
      id: '4',
      date: '2024-01-27',
      title: 'Gold Price Analysis',
      content: 'Gold breaking above $2000 resistance. Dollar weakness supporting precious metals rally.',
      sentiment: 'bullish',
      tags: ['GOLD', 'Commodities', 'Dollar'],
      type: 'stock',
      symbol: 'GLD'
    },
    {
      id: '5',
      date: '2024-01-26',
      title: 'Ethereum Network Update',
      content: 'ETH staking rewards increasing. Network activity picking up after recent lull.',
      sentiment: 'bullish',
      tags: ['ETH', 'Staking', 'Network Activity'],
      type: 'crypto',
      symbol: 'ETH'
    },
    {
      id: '6',
      date: '2024-01-25',
      title: 'Tesla Stock Analysis',
      content: 'TSLA facing resistance at $250. Production numbers disappointing, expecting further decline.',
      sentiment: 'bearish',
      tags: ['TSLA', 'Production', 'Resistance'],
      type: 'stock',
      symbol: 'TSLA'
    },
    {
      id: '7',
      date: '2024-01-24',
      title: 'Solana Ecosystem Growth',
      content: 'SOL showing strong ecosystem development. DeFi TVL increasing, bullish momentum building.',
      sentiment: 'bullish',
      tags: ['SOL', 'DeFi', 'Ecosystem'],
      type: 'crypto',
      symbol: 'SOL'
    },
    {
      id: '8',
      date: '2024-01-23',
      title: 'Apple Quarterly Review',
      content: 'AAPL showing resilience despite iPhone sales decline. Services revenue growth strong.',
      sentiment: 'neutral',
      tags: ['AAPL', 'iPhone', 'Services'],
      type: 'stock',
      symbol: 'AAPL'
    },
    {
      id: '9',
      date: '2024-01-22',
      title: 'Cardano Development Update',
      content: 'ADA smart contract adoption accelerating. Hydra scaling solution showing promise.',
      sentiment: 'bullish',
      tags: ['ADA', 'Smart Contracts', 'Scaling'],
      type: 'crypto',
      symbol: 'ADA'
    },
    {
      id: '10',
      date: '2024-01-21',
      title: 'Microsoft AI Integration',
      content: 'MSFT AI integration across products driving revenue growth. Cloud segment outperforming.',
      sentiment: 'bullish',
      tags: ['MSFT', 'AI', 'Cloud'],
      type: 'stock',
      symbol: 'MSFT'
    }
  ]);

  // Mock data for Trading Journal - Comprehensive trade history
  const [trades, setTrades] = useState<TradeEntry[]>([
    // January 2024 Trades
    {
      id: '1',
      date: '2024-01-30',
      symbol: 'AAPL',
      type: 'buy',
      quantity: 100,
      entryPrice: 185.50,
      exitPrice: 192.30,
      pnl: 680,
      status: 'closed',
      strategy: 'Momentum',
      notes: 'Strong earnings momentum, clean breakout above resistance',
      assetType: 'stock'
    },
    {
      id: '2',
      date: '2024-01-29',
      symbol: 'BTC',
      type: 'buy',
      quantity: 0.5,
      entryPrice: 42500,
      exitPrice: 44200,
      pnl: 850,
      status: 'closed',
      strategy: 'Crypto Momentum',
      notes: 'Bitcoin breaking key resistance, institutional buying',
      assetType: 'crypto'
    },
    {
      id: '3',
      date: '2024-01-28',
      symbol: 'MSFT',
      type: 'buy',
      quantity: 75,
      entryPrice: 378.90,
      status: 'open',
      strategy: 'Swing Trade',
      notes: 'Cloud growth story intact, holding for earnings',
      assetType: 'stock'
    },
    {
      id: '4',
      date: '2024-01-27',
      symbol: 'ETH',
      type: 'buy',
      quantity: 5,
      entryPrice: 2450.75,
      exitPrice: 2580.30,
      pnl: 647.75,
      status: 'closed',
      strategy: 'DeFi Play',
      notes: 'Ethereum staking rewards driving demand',
      assetType: 'crypto'
    },
    {
      id: '5',
      date: '2024-01-26',
      symbol: 'AMZN',
      type: 'buy',
      quantity: 40,
      entryPrice: 155.20,
      status: 'open',
      strategy: 'Growth',
      notes: 'AWS growth accelerating, long-term hold',
      assetType: 'stock'
    },
    {
      id: '6',
      date: '2024-01-25',
      symbol: 'SOL',
      type: 'buy',
      quantity: 100,
      entryPrice: 98.50,
      exitPrice: 105.20,
      pnl: 670,
      status: 'closed',
      strategy: 'Ecosystem Play',
      notes: 'Solana DeFi ecosystem expanding rapidly',
      assetType: 'crypto'
    },
    {
      id: '7',
      date: '2024-01-24',
      symbol: 'NVDA',
      type: 'sell',
      quantity: 25,
      entryPrice: 520.30,
      exitPrice: 485.60,
      pnl: -867.50,
      status: 'closed',
      strategy: 'Short Squeeze',
      notes: 'Overvalued on AI hype, good short entry',
      assetType: 'stock'
    },
    {
      id: '8',
      date: '2024-01-23',
      symbol: 'ADA',
      type: 'buy',
      quantity: 2000,
      entryPrice: 0.52,
      exitPrice: 0.58,
      pnl: 120,
      status: 'closed',
      strategy: 'Alt Coin Play',
      notes: 'Cardano smart contracts gaining traction',
      assetType: 'crypto'
    },
    {
      id: '9',
      date: '2024-01-22',
      symbol: 'TSLA',
      type: 'buy',
      quantity: 50,
      entryPrice: 248.75,
      exitPrice: 235.20,
      pnl: -677.50,
      status: 'closed',
      strategy: 'Mean Reversion',
      notes: 'Failed bounce off support, cut losses quickly',
      assetType: 'stock'
    },
    {
      id: '10',
      date: '2024-01-21',
      symbol: 'GOOGL',
      type: 'buy',
      quantity: 60,
      entryPrice: 142.15,
      exitPrice: 148.80,
      pnl: 399,
      status: 'closed',
      strategy: 'Value Play',
      notes: 'Oversold on AI concerns, good entry point',
      assetType: 'stock'
    }
  ]);

  // Performance metrics
  const totalPnL = trades.filter(t => t.status === 'closed').reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const monthlyPnL = trades
    .filter(t => t.status === 'closed' && new Date(t.date).getMonth() === currentMonth.getMonth() && new Date(t.date).getFullYear() === currentMonth.getFullYear())
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const openTrades = trades.filter(t => t.status === 'open').length;
  const closedTrades = trades.filter(t => t.status === 'closed');
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  // Chart data
  const monthlyPnLData = [
    { month: 'Sep', pnl: 1200 },
    { month: 'Oct', pnl: -450 },
    { month: 'Nov', pnl: 2659 },
    { month: 'Dec', pnl: 4780 },
    { month: 'Jan', pnl: monthlyPnL }
  ];

  const tradeDistribution = [
    { name: 'Winning Trades', value: winningTrades, color: '#10B981' },
    { name: 'Losing Trades', value: closedTrades.length - winningTrades, color: '#EF4444' }
  ];

  const strategyPerformance = [
    { strategy: 'Momentum', trades: 8, pnl: 2796 },
    { strategy: 'Mean Reversion', trades: 5, pnl: -1097.50 },
    { strategy: 'Swing Trade', trades: 12, pnl: 890 },
    { strategy: 'Value Play', trades: 6, pnl: 984 },
    { strategy: 'Growth', trades: 4, pnl: 420 },
    { strategy: 'AI Play', trades: 3, pnl: 1330 },
    { strategy: 'Index Play', trades: 2, pnl: 720 }
  ];

  // Get unique symbols for filter
  const allSymbols = Array.from(new Set([
    ...marketAnalyses.map(a => a.symbol),
    ...trades.map(t => t.symbol)
  ])).sort();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isCurrentMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Apply filters
  const applyFilters = (items: any[]) => {
    return items.filter(item => {
      const matchesType = typeFilter === 'all' || 
        (item.type === typeFilter || item.assetType === typeFilter);
      const matchesSymbol = symbolFilter === 'all' || item.symbol === symbolFilter;
      return matchesType && matchesSymbol;
    });
  };

  const filteredAnalyses = applyFilters(marketAnalyses.filter(analysis => isCurrentMonth(analysis.date)));
  const filteredTrades = applyFilters(trades.filter(trade => isCurrentMonth(trade.date)));

  // Add today's blank row if not exists
  const todayString = getTodayString();
  const hasAnalysisToday = filteredAnalyses.some(a => a.date === todayString);
  const hasTradeToday = filteredTrades.some(t => t.date === todayString);

  const analysesWithBlank = hasAnalysisToday ? filteredAnalyses : [
    ...filteredAnalyses,
    {
      id: 'blank-today',
      date: todayString,
      title: '',
      content: '',
      sentiment: 'neutral' as const,
      tags: [],
      type: 'stock' as const,
      symbol: ''
    }
  ];

  const tradesWithBlank = hasTradeToday ? filteredTrades : [
    ...filteredTrades,
    {
      id: 'blank-today',
      date: todayString,
      symbol: '',
      type: 'buy' as const,
      quantity: 0,
      entryPrice: 0,
      status: 'open' as const,
      strategy: '',
      notes: '',
      assetType: 'stock' as const
    }
  ];

  const handleSaveAnalysis = (id: string, updatedAnalysis: Partial<MarketAnalysis>) => {
    if (id === 'blank-today') {
      // Create new analysis
      const newAnalysis: MarketAnalysis = {
        id: Date.now().toString(),
        date: todayString,
        title: updatedAnalysis.title || '',
        content: updatedAnalysis.content || '',
        sentiment: updatedAnalysis.sentiment || 'neutral',
        tags: updatedAnalysis.tags || [],
        type: updatedAnalysis.type || 'stock',
        symbol: updatedAnalysis.symbol || ''
      };
      setMarketAnalyses([...marketAnalyses, newAnalysis]);
    } else {
      // Update existing analysis
      setMarketAnalyses(prev => prev.map(analysis => 
        analysis.id === id ? { ...analysis, ...updatedAnalysis } : analysis
      ));
    }
    setEditingAnalysis(null);
  };

  const handleSaveTrade = (id: string, updatedTrade: Partial<TradeEntry>) => {
    if (id === 'blank-today') {
      // Create new trade
      const newTrade: TradeEntry = {
        id: Date.now().toString(),
        date: todayString,
        symbol: updatedTrade.symbol || '',
        type: updatedTrade.type || 'buy',
        quantity: updatedTrade.quantity || 0,
        entryPrice: updatedTrade.entryPrice || 0,
        exitPrice: updatedTrade.exitPrice,
        pnl: updatedTrade.exitPrice && updatedTrade.entryPrice && updatedTrade.quantity
          ? (updatedTrade.exitPrice - updatedTrade.entryPrice) * updatedTrade.quantity * (updatedTrade.type === 'sell' ? -1 : 1)
          : undefined,
        status: updatedTrade.status || 'open',
        strategy: updatedTrade.strategy || '',
        notes: updatedTrade.notes || '',
        assetType: updatedTrade.assetType || 'stock'
      };
      setTrades([...trades, newTrade]);
    } else {
      // Update existing trade
      setTrades(prev => prev.map(trade => 
        trade.id === id ? { ...trade, ...updatedTrade } : trade
      ));
    }
    setEditingTrade(null);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500 bg-green-100';
      case 'bearish': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const TradingViewTab = () => (
    <div className="h-full flex flex-col">
      {/* TradingView Chart - 70% height */}
      <div className="h-[70%] mb-4">
        <div className={`h-full rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg p-6 flex items-center justify-center`}>
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            } flex items-center justify-center`}>
              <BarChart3 className="text-blue-500" size={48} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              TradingView Integration
            </h3>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Professional charting and technical analysis tools will be integrated here
            </p>
            <div className="mt-4 text-sm text-blue-500">
              Chart Widget Placeholder - 70% Height Allocation
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs and Tables - 30% height */}
      <div className="h-[30%] flex flex-col">
        {/* Sub-tab Navigation and Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className={`flex rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setSubTab('market-analysis')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                subTab === 'market-analysis'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Market Analysis
            </button>
            <button
              onClick={() => setSubTab('trading-journal')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                subTab === 'trading-journal'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trading Journal
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filters */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-1 text-sm rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Types</option>
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
            </select>

            <select
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              className={`px-3 py-1 text-sm rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Symbols</option>
              {allSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>

            {/* Month Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={`text-sm font-medium px-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatDate(currentMonth)}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden">
          {subTab === 'market-analysis' ? (
            <div className={`h-full rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg overflow-hidden`}>
              <div className="h-full overflow-auto">
                <table className="w-full text-sm">
                  <thead className={`sticky top-0 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Symbol</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                      <th className="px-3 py-2 text-left font-medium">Title</th>
                      <th className="px-3 py-2 text-left font-medium">Content</th>
                      <th className="px-3 py-2 text-left font-medium">Sentiment</th>
                      <th className="px-3 py-2 text-left font-medium">Tags</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysesWithBlank.map((analysis) => (
                      <tr key={analysis.id} className={`border-t ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className="px-3 py-2">{new Date(analysis.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">
                          {editingAnalysis === analysis.id ? (
                            <input
                              type="text"
                              defaultValue={analysis.symbol}
                              className={`w-16 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveAnalysis(analysis.id, { symbol: e.target.value })}
                            />
                          ) : (
                            <span className={`font-medium ${analysis.id === 'blank-today' && !analysis.symbol ? 'text-gray-400 italic' : ''}`}>
                              {analysis.symbol || 'Symbol'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingAnalysis === analysis.id ? (
                            <select
                              defaultValue={analysis.type}
                              className={`px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveAnalysis(analysis.id, { type: e.target.value as any })}
                            >
                              <option value="stock">Stock</option>
                              <option value="crypto">Crypto</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              analysis.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {analysis.type}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingAnalysis === analysis.id ? (
                            <input
                              type="text"
                              defaultValue={analysis.title}
                              className={`w-full px-2 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveAnalysis(analysis.id, { title: e.target.value })}
                            />
                          ) : (
                            <span className={analysis.id === 'blank-today' ? 'text-gray-400 italic' : ''}>
                              {analysis.title || 'Click edit to add...'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 max-w-xs">
                          {editingAnalysis === analysis.id ? (
                            <textarea
                              defaultValue={analysis.content}
                              className={`w-full px-2 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              rows={2}
                              onBlur={(e) => handleSaveAnalysis(analysis.id, { content: e.target.value })}
                            />
                          ) : (
                            <span className={`truncate block ${analysis.id === 'blank-today' ? 'text-gray-400 italic' : ''}`}>
                              {analysis.content || 'Click edit to add...'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {editingAnalysis === analysis.id ? (
                            <select
                              defaultValue={analysis.sentiment}
                              className={`px-2 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveAnalysis(analysis.id, { sentiment: e.target.value as any })}
                            >
                              <option value="bullish">Bullish</option>
                              <option value="bearish">Bearish</option>
                              <option value="neutral">Neutral</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(analysis.sentiment)}`}>
                              {analysis.sentiment}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {analysis.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className={`px-2 py-1 text-xs rounded-full ${
                                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {tag}
                              </span>
                            ))}
                            {analysis.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{analysis.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setEditingAnalysis(editingAnalysis === analysis.id ? null : analysis.id)}
                            className={`p-1 rounded ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            {editingAnalysis === analysis.id ? <Save size={14} /> : <Edit size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={`h-full rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg overflow-hidden`}>
              <div className="h-full overflow-auto">
                <table className="w-full text-sm">
                  <thead className={`sticky top-0 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className="px-2 py-2 text-left font-medium">Date</th>
                      <th className="px-2 py-2 text-left font-medium">Symbol</th>
                      <th className="px-2 py-2 text-left font-medium">Type</th>
                      <th className="px-2 py-2 text-left font-medium">Asset</th>
                      <th className="px-2 py-2 text-left font-medium">Qty</th>
                      <th className="px-2 py-2 text-left font-medium">Entry</th>
                      <th className="px-2 py-2 text-left font-medium">Exit</th>
                      <th className="px-2 py-2 text-left font-medium">P&L</th>
                      <th className="px-2 py-2 text-left font-medium">Status</th>
                      <th className="px-2 py-2 text-left font-medium">Strategy</th>
                      <th className="px-2 py-2 text-left font-medium">Notes</th>
                      <th className="px-2 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradesWithBlank.map((trade) => (
                      <tr key={trade.id} className={`border-t ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className="px-2 py-2 text-xs">{new Date(trade.date).toLocaleDateString()}</td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <input
                              type="text"
                              defaultValue={trade.symbol}
                              className={`w-16 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { symbol: e.target.value })}
                            />
                          ) : (
                            <span className={`font-medium ${trade.id === 'blank-today' && !trade.symbol ? 'text-gray-400 italic' : ''}`}>
                              {trade.symbol || 'Symbol'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <select
                              defaultValue={trade.type}
                              className={`px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { type: e.target.value as any })}
                            >
                              <option value="buy">Buy</option>
                              <option value="sell">Sell</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.type}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <select
                              defaultValue={trade.assetType}
                              className={`px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { assetType: e.target.value as any })}
                            >
                              <option value="stock">Stock</option>
                              <option value="crypto">Crypto</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              trade.assetType === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {trade.assetType}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              defaultValue={trade.quantity}
                              className={`w-16 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { quantity: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="text-xs">{trade.quantity || 0}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={trade.entryPrice}
                              className={`w-20 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { entryPrice: parseFloat(e.target.value) || 0 })}
                            />
                          ) : (
                            <span className="text-xs">${trade.entryPrice?.toFixed(2) || '0.00'}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={trade.exitPrice || ''}
                              className={`w-20 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { exitPrice: parseFloat(e.target.value) || undefined })}
                            />
                          ) : (
                            <span className="text-xs">{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <span className={`text-xs font-medium ${
                            (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <select
                              defaultValue={trade.status}
                              className={`px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { status: e.target.value as any })}
                            >
                              <option value="open">Open</option>
                              <option value="closed">Closed</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              trade.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {trade.status}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingTrade === trade.id ? (
                            <input
                              type="text"
                              defaultValue={trade.strategy}
                              className={`w-20 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { strategy: e.target.value })}
                            />
                          ) : (
                            <span className={`text-xs ${trade.id === 'blank-today' && !trade.strategy ? 'text-gray-400 italic' : ''}`}>
                              {trade.strategy || 'Strategy'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 max-w-xs">
                          {editingTrade === trade.id ? (
                            <input
                              type="text"
                              defaultValue={trade.notes}
                              className={`w-24 px-1 py-1 text-xs rounded border ${
                                theme === 'dark' ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                              }`}
                              onBlur={(e) => handleSaveTrade(trade.id, { notes: e.target.value })}
                            />
                          ) : (
                            <span className={`text-xs truncate block ${trade.id === 'blank-today' && !trade.notes ? 'text-gray-400 italic' : ''}`}>
                              {trade.notes || 'Notes'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setEditingTrade(editingTrade === trade.id ? null : trade.id)}
                            className={`p-1 rounded ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            {editingTrade === trade.id ? <Save size={12} /> : <Edit size={12} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Total P&L
              </p>
              <p className={`text-2xl font-bold ${
                totalPnL >= 0 
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                ${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
            <DollarSign className={`${
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`} size={24} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Monthly P&L
              </p>
              <p className={`text-2xl font-bold ${
                monthlyPnL >= 0 
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                ${monthlyPnL >= 0 ? '+' : ''}${monthlyPnL.toFixed(2)}
              </p>
            </div>
            <Calendar className={`${
              monthlyPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`} size={24} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Open Trades
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {openTrades}
              </p>
            </div>
            <Target className="text-blue-500" size={24} />
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Win Rate
              </p>
              <p className={`text-2xl font-bold ${
                winRate >= 50 
                  ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                {winRate.toFixed(1)}%
              </p>
            </div>
            <Activity className={`${
              winRate >= 50 ? 'text-green-500' : 'text-red-500'
            }`} size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L Chart */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Monthly P&L Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={monthlyPnLData}>
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
                  formatter={(value) => [`$${value}`, 'P&L']}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade Distribution */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Trade Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Trades']}
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

      {/* Strategy Performance */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Strategy Performance
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strategyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="strategy" 
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
                formatter={(value, name) => [
                  name === 'pnl' ? `$${value}` : value,
                  name === 'pnl' ? 'P&L' : 'Trades'
                ]}
              />
              <Legend />
              <Bar dataKey="pnl" fill="#3B82F6" name="P&L" />
              <Bar dataKey="trades" fill="#10B981" name="Trades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto px-4 md:px-6">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Trading Management
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Track your market analysis and trading performance
            </p>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex justify-between items-center">
          <div className={`flex rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveTab('trading-view')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'trading-view'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trading View
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'performance'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-900 shadow'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Performance
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="h-[calc(100vh-200px)]"
        >
          {activeTab === 'trading-view' ? <TradingViewTab /> : <PerformanceTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Trading;