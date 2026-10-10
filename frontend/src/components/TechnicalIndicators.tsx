import React from 'react';
import { TechnicalIndicators as TechnicalIndicatorsType } from '../types';

interface Props {
  indicators?: TechnicalIndicatorsType;
  currentPrice: number;
}

export const TechnicalIndicators: React.FC<Props> = ({ indicators, currentPrice }) => {
  if (!indicators) return null;

  const getLatest = (arr?: (number | null)[]) => {
    if (!arr || arr.length === 0) return null;
    const valid = arr.filter((v): v is number => v !== null);
    return valid.length > 0 ? valid[valid.length - 1] : null;
  };

  const rsi = getLatest(indicators.rsi);
  const macd = getLatest(indicators.macd);
  const macdSignal = getLatest(indicators.macd_signal);
  const macdHist = getLatest(indicators.macd_hist);
  const sma20 = getLatest(indicators.sma_20);
  const sma50 = getLatest(indicators.sma_50);
  const sma200 = getLatest(indicators.sma_200);

  const getRSISentiment = (val: number | null) => {
    if (val === null) return { label: 'Neutral', color: 'text-slate-400' };
    if (val > 70) return { label: 'Overbought (>70)', color: 'text-rose-400' };
    if (val < 30) return { label: 'Oversold (<30)', color: 'text-emerald-400' };
    return { label: 'Neutral (30-70)', color: 'text-cyan-400' };
  };

  const rsiInfo = getRSISentiment(rsi);

  const getMACDSentiment = (hist: number | null) => {
    if (hist === null) return { label: 'Neutral', color: 'text-slate-400' };
    if (hist > 0) return { label: 'Bullish Momentum', color: 'text-emerald-400' };
    return { label: 'Bearish Momentum', color: 'text-rose-400' };
  };

  const macdInfo = getMACDSentiment(macdHist);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* RSI Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-mono text-slate-400">RSI (14 Period)</span>
          <span className={`text-xs font-mono font-semibold ${rsiInfo.color}`}>{rsiInfo.label}</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-2">
          {rsi !== null ? rsi.toFixed(2) : 'N/A'}
        </div>
        <div className="w-full bg-dark-900 h-2 rounded-full overflow-hidden border border-dark-600">
          <div
            className={`h-full transition-all ${
              rsi !== null && rsi > 70 ? 'bg-rose-500' : rsi !== null && rsi < 30 ? 'bg-emerald-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(Math.max(rsi ?? 50, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* MACD Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-mono text-slate-400">MACD (12, 26, 9)</span>
          <span className={`text-xs font-mono font-semibold ${macdInfo.color}`}>{macdInfo.label}</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1">
          {macdHist !== null ? (macdHist > 0 ? `+${macdHist.toFixed(2)}` : macdHist.toFixed(2)) : 'N/A'}
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>MACD: {macd !== null ? macd.toFixed(2) : '-'}</span>
          <span>Signal: {macdSignal !== null ? macdSignal.toFixed(2) : '-'}</span>
        </div>
      </div>

      {/* Moving Averages Summary */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
        <div className="text-xs uppercase font-mono text-slate-400 mb-2">Moving Averages (SMA)</div>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-amber-400">SMA 20:</span>
            <span className="text-white font-semibold">{sma20 !== null ? `₹${sma20.toFixed(2)}` : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-400">SMA 50:</span>
            <span className="text-white font-semibold">{sma50 !== null ? `₹${sma50.toFixed(2)}` : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-400">SMA 200:</span>
            <span className="text-white font-semibold">{sma200 !== null ? `₹${sma200.toFixed(2)}` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
