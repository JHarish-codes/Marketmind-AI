import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, ShoppingCart, TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { StockQuote, PortfolioSummary } from '../types';
import { StockSearch } from '../components/StockSearch';
import { CandlestickChart } from '../components/CandlestickChart';
import { TechnicalIndicators } from '../components/TechnicalIndicators';
import { OrderModal } from '../components/OrderModal';

export const StockExplorer: React.FC = () => {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState('1y');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quoteData, portfolioData] = await Promise.all([
        api.getStockQuote(symbol, period),
        api.getPortfolio()
      ]);
      setQuote(quoteData);
      setPortfolio(portfolioData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch stock information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol, period]);

  const periods = [
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
    { label: '5Y', value: '5y' },
  ];

  const currPos = portfolio?.positions.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
  const ownedShares = currPos ? currPos.shares : 0;

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-dark-800 border border-dark-600 rounded-xl p-4">
        <StockSearch onSelectSymbol={setSymbol} currentSymbol={symbol} />

        <div className="flex items-center justify-between sm:justify-end space-x-2">
          {/* Timeframe selector */}
          <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-600">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  period === p.value
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-dark-900 border border-dark-600 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-dark-800 border border-dark-600 rounded-xl">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <p className="text-sm font-mono text-slate-400">Loading Market Data for {symbol}...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center text-rose-400">
          <p className="font-semibold mb-2">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm font-mono text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : quote ? (
        <>
          {/* Stock Header & Live Metrics */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold font-mono text-white">{quote.symbol}</h1>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                    quote.data_source === 'live'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {quote.data_source === 'live' ? 'Live Data' : 'Simulated Data'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{quote.company_name}</p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-3xl font-bold font-mono text-white">
                    {quote.currency === 'INR' ? '₹' : '$'}
                    {quote.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center text-sm font-mono font-semibold ${
                    quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {quote.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>
                      {quote.change >= 0 ? '+' : ''}{quote.change} ({quote.percent_change}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono rounded-lg transition-colors shadow-lg shadow-cyan-950"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Trade</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-dark-600/50 text-xs font-mono">
              <div>
                <span className="text-slate-400">Day High:</span>
                <span className="ml-2 font-semibold text-white">
                  {quote.currency === 'INR' ? '₹' : '$'}{quote.day_high.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Day Low:</span>
                <span className="ml-2 font-semibold text-white">
                  {quote.currency === 'INR' ? '₹' : '$'}{quote.day_low.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Volume:</span>
                <span className="ml-2 font-semibold text-white">{quote.volume.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Holdings Owned:</span>
                <span className="ml-2 font-semibold text-cyan-400">{ownedShares} shares</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <CandlestickChart history={quote.history} indicators={quote.indicators} currency={quote.currency} />

          {/* Technical Analysis Section */}
          <TechnicalIndicators indicators={quote.indicators} currentPrice={quote.current_price} />

          {/* Order Modal */}
          <OrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            symbol={quote.symbol}
            companyName={quote.company_name}
            currentPrice={quote.current_price}
            currency={quote.currency}
            cashBalance={portfolio?.cash_balance ?? 100000}
            availableShares={ownedShares}
            onOrderCompleted={loadData}
          />
        </>
      ) : null}
    </div>
  );
};
