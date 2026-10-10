import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StockExplorer } from './pages/StockExplorer';
import { Backtesting } from './pages/Backtesting';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { VirtualTrading } from './pages/VirtualTrading';
import { NewsAnalysis } from './pages/NewsAnalysis';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explorer');
  const [cashBalance, setCashBalance] = useState<number>(100000);

  const fetchPortfolioBalance = async () => {
    try {
      const data = await api.getPortfolio();
      setCashBalance(data.cash_balance);
    } catch (err) {
      console.error('Could not load portfolio cash balance:', err);
    }
  };

  useEffect(() => {
    fetchPortfolioBalance();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cashBalance={cashBalance} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'explorer' && <StockExplorer />}
        {activeTab === 'backtest' && <Backtesting />}
        {activeTab === 'risk' && <RiskAnalysis />}
        {activeTab === 'trading' && <VirtualTrading />}
        {activeTab === 'news' && <NewsAnalysis />}
      </main>

      <footer className="bg-dark-800 border-t border-dark-600 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <div>
            MarketMind AI Terminal v1.0 • Educational & Paper Trading Simulation Engine
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>API Status: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
