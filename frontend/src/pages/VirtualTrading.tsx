import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { PortfolioSummary } from '../types';
import { OrderModal } from '../components/OrderModal';

export const VirtualTrading: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStockForOrder, setSelectedStockForOrder] = useState<string | null>(null);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch portfolio details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  return (
    <div className="space-y-6">
      {/* Portfolio Header Cards */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-dark-600">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="font-bold text-lg text-white font-mono">Virtual Paper Trading Account</h2>
              <p className="text-xs text-slate-400">Initial Capital: ₹1,00,000 (No Real Money Trades Executed)</p>
            </div>
          </div>
          <button
            onClick={loadPortfolio}
            className="p-2 bg-dark-900 border border-dark-600 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        ) : portfolio ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-mono">
              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Total Net Worth</div>
                <div className="text-2xl font-bold text-white mt-1">
                  ₹{portfolio.total_net_worth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-xs mt-1 font-semibold flex items-center ${
                  portfolio.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {portfolio.total_pnl >= 0 ? '+' : ''}₹{portfolio.total_pnl.toLocaleString()} ({portfolio.total_pnl_pct}%)
                </div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Available Cash</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  ₹{portfolio.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Liquid Capital</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Total Invested</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">
                  ₹{portfolio.total_invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Holdings Cost Basis</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Portfolio Value</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  ₹{portfolio.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Current Market Value</div>
              </div>
            </div>

            {/* Current Open Positions Table */}
            <div className="mt-8">
              <h3 className="font-bold text-sm text-white font-mono mb-4">Active Stock Positions</h3>
              {portfolio.positions.length === 0 ? (
                <div className="bg-dark-900 border border-dark-600 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
                  No active stock holdings in portfolio. Search stocks in the explorer to place virtual buy orders.
                </div>
              ) : (
                <div className="overflow-x-auto bg-dark-900 border border-dark-600 rounded-xl font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="border-b border-dark-600 text-slate-400 uppercase bg-dark-800">
                      <tr>
                        <th className="p-3">Symbol</th>
                        <th className="p-3">Shares</th>
                        <th className="p-3">Avg Price</th>
                        <th className="p-3">Current Price</th>
                        <th className="p-3">Market Value</th>
                        <th className="p-3">Unrealized P&L</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600/50 text-slate-200">
                      {portfolio.positions.map((pos) => (
                        <tr key={pos.symbol} className="hover:bg-dark-800/50">
                          <td className="p-3 font-bold text-cyan-400">{pos.symbol}</td>
                          <td className="p-3">{pos.shares}</td>
                          <td className="p-3">₹{pos.avg_price.toLocaleString()}</td>
                          <td className="p-3">₹{pos.current_price.toLocaleString()}</td>
                          <td className="p-3 font-semibold">₹{pos.market_value.toLocaleString()}</td>
                          <td className={`p-3 font-bold ${pos.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pos.unrealized_pnl >= 0 ? '+' : ''}₹{pos.unrealized_pnl.toLocaleString()} ({pos.unrealized_pnl_pct}%)
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedStockForOrder(pos.symbol)}
                              className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded font-semibold text-[11px]"
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Transaction History Log */}
            <div className="mt-8">
              <h3 className="font-bold text-sm text-white font-mono mb-4">Transaction History</h3>
              {portfolio.recent_transactions.length === 0 ? (
                <div className="bg-dark-900 border border-dark-600 rounded-xl p-6 text-center text-slate-400 font-mono text-xs">
                  No virtual transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto bg-dark-900 border border-dark-600 rounded-xl font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="border-b border-dark-600 text-slate-400 uppercase bg-dark-800">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Symbol</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Shares</th>
                        <th className="p-3">Execution Price</th>
                        <th className="p-3">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600/50 text-slate-200">
                      {portfolio.recent_transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-dark-800/50">
                          <td className="p-3 text-slate-400">{tx.timestamp}</td>
                          <td className="p-3 font-semibold text-white">{tx.symbol}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              tx.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {tx.action}
                            </span>
                          </td>
                          <td className="p-3">{tx.shares}</td>
                          <td className="p-3">₹{tx.price.toLocaleString()}</td>
                          <td className="p-3 font-semibold">₹{tx.total_amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Trade Modal when requested from positions table */}
      {selectedStockForOrder && (
        <OrderModal
          isOpen={true}
          onClose={() => setSelectedStockForOrder(null)}
          symbol={selectedStockForOrder}
          companyName={selectedStockForOrder}
          currentPrice={portfolio?.positions.find(p => p.symbol === selectedStockForOrder)?.current_price ?? 1000}
          cashBalance={portfolio?.cash_balance ?? 100000}
          availableShares={portfolio?.positions.find(p => p.symbol === selectedStockForOrder)?.shares ?? 0}
          onOrderCompleted={loadPortfolio}
        />
      )}
    </div>
  );
};
