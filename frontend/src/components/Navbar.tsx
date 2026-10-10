import React from 'react';
import { TrendingUp, BarChart2, ShieldAlert, Wallet, Newspaper, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cashBalance?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cashBalance = 100000 }) => {
  const navItems = [
    { id: 'explorer', label: 'Stock Explorer', icon: TrendingUp },
    { id: 'backtest', label: 'Backtester', icon: BarChart2 },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
    { id: 'trading', label: 'Virtual Trading', icon: Wallet },
    { id: 'news', label: 'News & Sentiment', icon: Newspaper },
  ];

  return (
    <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explorer')}>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">MarketMind</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded border border-cyan-500/30 font-semibold font-mono">
                  AI TERMINAL
                </span>
              </div>
              <p className="text-xs text-slate-400">Institutional Financial Analytics</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Virtual Capital Indicator */}
          <div className="hidden sm:flex items-center space-x-3 bg-dark-900 px-3 py-1.5 rounded-lg border border-dark-600">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Virtual Balance</div>
              <div className="text-xs font-bold font-mono text-emerald-400">
                ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
