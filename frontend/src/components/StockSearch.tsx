import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { StockSearchMatch } from '../types';

interface StockSearchProps {
  onSelectSymbol: (symbol: string) => void;
  currentSymbol: string;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectSymbol, currentSymbol }) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<StockSearchMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const results = await api.searchStocks(query);
        setMatches(results);
      } catch (err) {
        console.error('Failed to search stocks:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMatches, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search stock symbol or name (e.g. RELIANCE.NS, TCS, AAPL)..."
          className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
        )}
      </div>

      {isOpen && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
          <div className="p-1">
            {matches.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  onSelectSymbol(item.symbol);
                  setQuery('');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-dark-700 flex items-center justify-between transition-colors ${
                  item.symbol.toUpperCase() === currentSymbol.toUpperCase() ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                }`}
              >
                <div>
                  <div className="text-sm font-semibold font-mono text-white">{item.symbol}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[240px]">{item.name}</div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900 text-slate-400 border border-dark-600">
                  {item.exchange}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
