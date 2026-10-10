import React, { useState } from 'react';
import { Play, Loader2, BarChart2, ShieldCheck, CheckCircle2, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { api } from '../services/api';
import { BacktestRequest, BacktestResult } from '../types';

export const Backtesting: React.FC = () => {
  const [form, setForm] = useState<BacktestRequest>({
    symbol: 'RELIANCE.NS',
    strategy: 'ma_crossover',
    period: '1y',
    initial_capital: 100000,
    fast_period: 20,
    slow_period: 50,
    rsi_oversold: 30,
    rsi_overbought: 70,
    transaction_cost_pct: 0.1
  });

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.runBacktest(form);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Backtest failed to complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-dark-600">
          <BarChart2 className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-bold text-lg text-white font-mono">Strategy Backtesting Engine</h2>
            <p className="text-xs text-slate-400">Simulate algorithmic strategies without look-ahead bias</p>
          </div>
        </div>

        <form onSubmit={handleRun} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          {/* Symbol */}
          <div>
            <label className="block text-slate-400 uppercase mb-1">Stock Ticker</label>
            <input
              type="text"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g. RELIANCE.NS, TCS, AAPL"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-slate-400 uppercase mb-1">Strategy Type</label>
            <select
              value={form.strategy}
              onChange={(e) => setForm({ ...form, strategy: e.target.value as any })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
            >
              <option value="ma_crossover">Moving Average Crossover</option>
              <option value="rsi">RSI Mean Reversion</option>
              <option value="buy_hold">Buy & Hold Benchmark</option>
            </select>
          </div>

          {/* Historical Period */}
          <div>
            <label className="block text-slate-400 uppercase mb-1">Historical Period</label>
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
            >
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>

          {/* Starting Capital */}
          <div>
            <label className="block text-slate-400 uppercase mb-1">Starting Capital (₹)</label>
            <input
              type="number"
              value={form.initial_capital}
              onChange={(e) => setForm({ ...form, initial_capital: parseFloat(e.target.value) || 100000 })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
            />
          </div>

          {/* Conditional Params for MA Crossover */}
          {form.strategy === 'ma_crossover' && (
            <>
              <div>
                <label className="block text-slate-400 uppercase mb-1">Fast SMA Period</label>
                <input
                  type="number"
                  value={form.fast_period}
                  onChange={(e) => setForm({ ...form, fast_period: parseInt(e.target.value) || 20 })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase mb-1">Slow SMA Period</label>
                <input
                  type="number"
                  value={form.slow_period}
                  onChange={(e) => setForm({ ...form, slow_period: parseInt(e.target.value) || 50 })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
                />
              </div>
            </>
          )}

          {/* Conditional Params for RSI */}
          {form.strategy === 'rsi' && (
            <>
              <div>
                <label className="block text-slate-400 uppercase mb-1">RSI Oversold Level</label>
                <input
                  type="number"
                  value={form.rsi_oversold}
                  onChange={(e) => setForm({ ...form, rsi_oversold: parseFloat(e.target.value) || 30 })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase mb-1">RSI Overbought Level</label>
                <input
                  type="number"
                  value={form.rsi_overbought}
                  onChange={(e) => setForm({ ...form, rsi_overbought: parseFloat(e.target.value) || 70 })}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
                />
              </div>
            </>
          )}

          {/* Transaction Cost % */}
          <div>
            <label className="block text-slate-400 uppercase mb-1">Slippage & Cost (%)</label>
            <input
              type="number"
              step="0.05"
              value={form.transaction_cost_pct}
              onChange={(e) => setForm({ ...form, transaction_cost_pct: parseFloat(e.target.value) || 0.1 })}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end md:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Execute Strategy Backtest</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Strategy Return</div>
              <div className={`text-xl font-bold font-mono mt-1 ${result.total_return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.total_return_pct >= 0 ? '+' : ''}{result.total_return_pct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Final: ₹{result.final_capital.toLocaleString()}</div>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">Benchmark Return</div>
              <div className={`text-xl font-bold font-mono mt-1 ${result.benchmark_return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.benchmark_return_pct >= 0 ? '+' : ''}{result.benchmark_return_pct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Buy & Hold Return</div>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">Max Drawdown</div>
              <div className="text-xl font-bold font-mono mt-1 text-rose-400">
                -{result.max_drawdown_pct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Peak-to-Trough Loss</div>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">Win Rate</div>
              <div className="text-xl font-bold font-mono mt-1 text-cyan-400">
                {result.win_rate_pct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Profitable Trades</div>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Trades</div>
              <div className="text-xl font-bold font-mono mt-1 text-white">
                {result.total_trades}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Executed Orders</div>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <h3 className="font-bold text-sm text-white font-mono mb-4">Equity Curve vs Benchmark</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.equity_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2130" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#121721', borderColor: '#252F45', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="portfolio_value" name="Strategy Portfolio" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="benchmark_value" name="Benchmark (Buy & Hold)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Execution Logs Table */}
          {result.trade_logs.length > 0 && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
              <h3 className="font-bold text-sm text-white font-mono mb-4">Trade Execution History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-dark-900 border-b border-dark-600 text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Shares</th>
                      <th className="p-3">Total Value</th>
                      <th className="p-3">Trigger Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600/50 text-slate-200">
                    {result.trade_logs.map((trade, idx) => (
                      <tr key={idx} className="hover:bg-dark-700/50">
                        <td className="p-3">{trade.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="p-3">₹{trade.price.toLocaleString()}</td>
                        <td className="p-3">{trade.shares}</td>
                        <td className="p-3 font-semibold">₹{trade.value.toLocaleString()}</td>
                        <td className="p-3 text-slate-400">{trade.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
