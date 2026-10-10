import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { StockDataPoint, TechnicalIndicators } from '../types';

interface CandlestickChartProps {
  history: StockDataPoint[];
  indicators?: TechnicalIndicators;
  currency?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ history, indicators, currency = 'INR' }) => {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const currSymbol = currency === 'INR' ? '₹' : '$';

  // Merge history with indicator points
  const data = history.map((pt, idx) => ({
    ...pt,
    sma_20: indicators?.sma_20?.[idx] ?? null,
    sma_50: indicators?.sma_50?.[idx] ?? null,
    rsi: indicators?.rsi?.[idx] ?? null,
  }));

  const minPrice = Math.min(...history.map(h => h.low));
  const maxPrice = Math.max(...history.map(h => h.high));
  const padding = (maxPrice - minPrice) * 0.05;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
      {/* Chart Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-600/50">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Chart View</span>
          <div className="flex bg-dark-900 rounded-lg p-0.5 border border-dark-600">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 text-xs font-mono rounded ${
                chartType === 'area' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 text-xs font-mono rounded ${
                chartType === 'line' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Technical Overlays Toggle */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <label className="flex items-center space-x-1.5 cursor-pointer text-amber-400">
            <input
              type="checkbox"
              checked={showSMA20}
              onChange={(e) => setShowSMA20(e.target.checked)}
              className="rounded bg-dark-900 border-dark-600 text-amber-400 focus:ring-0"
            />
            <span>SMA 20</span>
          </label>
          <label className="flex items-center space-x-1.5 cursor-pointer text-purple-400">
            <input
              type="checkbox"
              checked={showSMA50}
              onChange={(e) => setShowSMA50(e.target.checked)}
              className="rounded bg-dark-900 border-dark-600 text-purple-400 focus:ring-0"
            />
            <span>SMA 50</span>
          </label>
        </div>
      </div>

      {/* Main Stock Price Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2130" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: '#252F45' }}
            />
            <YAxis
              domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]}
              stroke="#64748b"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${currSymbol}${v}`}
              tickLine={false}
              axisLine={{ stroke: '#252F45' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121721',
                borderColor: '#252F45',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono'
              }}
              formatter={(value: any, name: string) => {
                if (typeof value === 'number') {
                  return [`${currSymbol}${value.toLocaleString()}`, name.toUpperCase()];
                }
                return [value, name];
              }}
            />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                name="Price"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                name="Price"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
            )}
            {showSMA20 && (
              <Line
                type="monotone"
                dataKey="sma_20"
                name="SMA 20"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma_50"
                name="SMA 50"
                stroke="#c084fc"
                strokeWidth={1.5}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Bar Chart */}
      <div className="h-20 w-full mt-4 pt-2 border-t border-dark-600/40">
        <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Trading Volume</div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <YAxis hide />
            <XAxis dataKey="timestamp" hide />
            <Bar dataKey="volume" fill="#334155" radius={[2, 2, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
