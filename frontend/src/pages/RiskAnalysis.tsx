import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Activity, TrendingDown, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { RiskAnalysis as RiskAnalysisType } from '../types';

export const RiskAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState('1y');
  const [riskData, setRiskData] = useState<RiskAnalysisType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customDrop, setCustomDrop] = useState(-10);

  const loadRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRiskAnalysis(symbol, period);
      setRiskData(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate risk metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, [symbol, period]);

  const estImpactPct = (customDrop * (riskData?.beta ?? 1)).toFixed(2);
  const estPortVal = (100000 * (1 + (parseFloat(estImpactPct) / 100))).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-600">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-bold text-lg text-white font-mono">Portfolio & Asset Risk Analytics</h2>
              <p className="text-xs text-slate-400">Volatility, Drawdown, VaR, and Stress Testing</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g. TCS.NS)"
              className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 w-36"
            />
            <button
              onClick={loadRisk}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
            >
              Analyze
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        ) : riskData ? (
          <>
            {/* Key Risk Gauges */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 font-mono">
              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Annual Volatility</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {riskData.annualized_volatility_pct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Standard Deviation</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">
                  {riskData.sharpe_ratio}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Risk-Adjusted Return</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Max Historical DD</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">
                  -{riskData.max_drawdown_pct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Peak-to-Trough Loss</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Beta Coefficient</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  {riskData.beta}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Market Sensitivity</div>
              </div>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-4">
                <div className="text-[10px] uppercase text-slate-400">Daily VaR (95%)</div>
                <div className="text-2xl font-bold text-slate-200 mt-1">
                  {riskData.daily_var_95}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Value at Risk</div>
              </div>
            </div>

            {/* Stress Test Simulator */}
            <div className="mt-6 pt-6 border-t border-dark-600/50">
              <h3 className="font-bold text-sm text-white font-mono mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Hypothetical Market Crash Stress Simulator</span>
              </h3>

              <div className="bg-dark-900 border border-dark-600 rounded-xl p-6 font-mono space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <span>Simulated Broad Market Drop:</span>
                    <span className="font-bold text-rose-400">{customDrop}%</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="-1"
                    value={customDrop}
                    onChange={(e) => setCustomDrop(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>-1% (Minor Dip)</span>
                    <span>-20% (Bear Market)</span>
                    <span>-40% (Black Swan Crisis)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-600 text-xs">
                  <div className="bg-dark-800 p-4 rounded-lg border border-dark-600">
                    <span className="text-slate-400">Estimated Portfolio Impact:</span>
                    <div className="text-xl font-bold text-rose-400 mt-1">{estImpactPct}%</div>
                    <p className="text-[10px] text-slate-500 mt-1">Factor based on asset Beta ({riskData.beta})</p>
                  </div>
                  <div className="bg-dark-800 p-4 rounded-lg border border-dark-600">
                    <span className="text-slate-400">Simulated Portfolio Value (from ₹1,00,000):</span>
                    <div className="text-xl font-bold text-white mt-1">₹{estPortVal}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Remaining capital after shock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Pre-configured Scenarios Table */}
            <div className="mt-6">
              <h3 className="font-bold text-sm text-white font-mono mb-3">Pre-Configured Stress Scenarios</h3>
              <div className="overflow-x-auto bg-dark-900 border border-dark-600 rounded-xl font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="border-b border-dark-600 text-slate-400 uppercase bg-dark-800">
                    <tr>
                      <th className="p-3">Scenario Name</th>
                      <th className="p-3">Market Shift</th>
                      <th className="p-3">Asset Impact %</th>
                      <th className="p-3">Simulated Value (₹1,00,000)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-600/50">
                    {riskData.stress_tests.map((st, idx) => (
                      <tr key={idx} className="hover:bg-dark-800/50">
                        <td className="p-3 font-semibold text-white">{st.scenario}</td>
                        <td className="p-3 text-rose-400">{st.market_drop_pct}%</td>
                        <td className="p-3 text-rose-400 font-bold">{st.estimated_portfolio_impact}%</td>
                        <td className="p-3 text-white">₹{st.estimated_portfolio_value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
