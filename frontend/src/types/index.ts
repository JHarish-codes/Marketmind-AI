export interface StockDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi?: (number | null)[];
  macd?: (number | null)[];
  macd_signal?: (number | null)[];
  macd_hist?: (number | null)[];
  sma_20?: (number | null)[];
  sma_50?: (number | null)[];
  sma_200?: (number | null)[];
  ema_12?: (number | null)[];
  ema_26?: (number | null)[];
}

export interface StockQuote {
  symbol: string;
  company_name: string;
  currency: string;
  current_price: number;
  change: number;
  percent_change: number;
  day_high: number;
  day_low: number;
  volume: number;
  data_source: 'live' | 'delayed' | 'simulated';
  last_updated: string;
  history: StockDataPoint[];
  indicators?: TechnicalIndicators;
}

export interface StockSearchMatch {
  symbol: string;
  name: string;
  exchange: string;
}

export interface BacktestRequest {
  symbol: string;
  strategy: 'buy_hold' | 'ma_crossover' | 'rsi';
  period: string;
  initial_capital: number;
  fast_period?: number;
  slow_period?: number;
  rsi_oversold?: number;
  rsi_overbought?: number;
  transaction_cost_pct?: number;
}

export interface BacktestTradeLog {
  date: string;
  action: 'BUY' | 'SELL';
  price: number;
  shares: number;
  value: number;
  reason: string;
}

export interface EquityCurvePoint {
  date: string;
  portfolio_value: number;
  benchmark_value: number;
}

export interface BacktestResult {
  symbol: string;
  strategy: string;
  initial_capital: number;
  final_capital: number;
  total_return_pct: number;
  benchmark_return_pct: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_trades: number;
  equity_curve: EquityCurvePoint[];
  trade_logs: BacktestTradeLog[];
}

export interface StressTestResult {
  scenario: string;
  market_drop_pct: number;
  estimated_portfolio_impact: number;
  estimated_portfolio_value: number;
}

export interface RiskAnalysis {
  symbol: string;
  annualized_volatility_pct: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  beta: number;
  daily_var_95: number;
  stress_tests: StressTestResult[];
}

export interface Position {
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export interface Transaction {
  id: number;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_amount: number;
  timestamp: string;
}

export interface PortfolioSummary {
  cash_balance: number;
  total_invested: number;
  portfolio_value: number;
  total_net_worth: number;
  total_pnl: number;
  total_pnl_pct: number;
  currency: string;
  positions: Position[];
  recent_transactions: Transaction[];
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  published_at: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number;
}
