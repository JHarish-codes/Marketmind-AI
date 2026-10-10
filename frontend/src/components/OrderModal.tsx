import React, { useState } from 'react';
import { X, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  currentPrice: number;
  currency?: string;
  cashBalance: number;
  availableShares?: number;
  onOrderCompleted: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  symbol,
  companyName,
  currentPrice,
  currency = 'INR',
  cashBalance,
  availableShares = 0,
  onOrderCompleted
}) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCost = shares * currentPrice;
  const isBuy = action === 'BUY';
  const currSym = currency === 'INR' ? '₹' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) {
      setError('Number of shares must be greater than 0');
      return;
    }

    if (isBuy && totalCost > cashBalance) {
      setError(`Insufficient cash balance (${currSym}${cashBalance.toLocaleString()})`);
      return;
    }

    if (!isBuy && shares > availableShares) {
      setError(`Insufficient shares owned (${availableShares} available)`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.placeOrder(symbol, action, shares);
      onOrderCompleted();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-dark-600">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white font-mono">Virtual Trade Execution</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Stock */}
          <div className="bg-dark-900 border border-dark-600 rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-bold font-mono text-cyan-400 text-base">{symbol}</div>
              <div className="text-xs text-slate-400 truncate max-w-[200px]">{companyName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Market Price</div>
              <div className="font-bold font-mono text-white text-base">{currSym}{currentPrice.toLocaleString()}</div>
            </div>
          </div>

          {/* Action Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-dark-900 rounded-lg border border-dark-600 font-mono">
            <button
              type="button"
              onClick={() => setAction('BUY')}
              className={`py-2 text-sm font-bold rounded-md transition-colors ${
                isBuy ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setAction('SELL')}
              className={`py-2 text-sm font-bold rounded-md transition-colors ${
                !isBuy ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Shares Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white font-mono text-base focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Order Financial Calculation */}
          <div className="bg-dark-900/60 border border-dark-600/60 rounded-lg p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Available Cash:</span>
              <span className="text-emerald-400 font-semibold">{currSym}{cashBalance.toLocaleString()}</span>
            </div>
            {!isBuy && (
              <div className="flex justify-between text-slate-400">
                <span>Holdings Owned:</span>
                <span className="text-cyan-400 font-semibold">{availableShares} shares</span>
              </div>
            )}
            <div className="flex justify-between text-slate-200 border-t border-dark-600 pt-1.5 font-bold text-sm">
              <span>Total Estimated Value:</span>
              <span className="text-white">{currSym}{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold font-mono text-sm text-white flex items-center justify-center space-x-2 transition-colors ${
                isBuy ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              } disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Confirm {action} Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
