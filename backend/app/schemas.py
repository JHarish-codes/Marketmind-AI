from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StockDataPoint(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class TechnicalIndicators(BaseModel):
    rsi: Optional[List[Optional[float]]] = None
    macd: Optional[List[Optional[float]]] = None
    macd_signal: Optional[List[Optional[float]]] = None
    macd_hist: Optional[List[Optional[float]]] = None
    sma_20: Optional[List[Optional[float]]] = None
    sma_50: Optional[List[Optional[float]]] = None
    sma_200: Optional[List[Optional[float]]] = None
    ema_12: Optional[List[Optional[float]]] = None
    ema_26: Optional[List[Optional[float]]] = None

class StockQuoteResponse(BaseModel):
    symbol: str
    company_name: str
    currency: str
    current_price: float
    change: float
    percent_change: float
    day_high: float
    day_low: float
    volume: int
    data_source: str  # "live", "delayed", "simulated"
    last_updated: str
    history: List[StockDataPoint]
    indicators: Optional[TechnicalIndicators] = None

class BacktestRequest(BaseModel):
    symbol: str = "RELIANCE.NS"
    strategy: str = "ma_crossover"  # "buy_hold", "ma_crossover", "rsi"
    period: str = "1y"  # "1m", "3m", "6m", "1y", "2y", "5y"
    initial_capital: float = 100000.0
    fast_period: int = 20
    slow_period: int = 50
    rsi_oversold: float = 30.0
    rsi_overbought: float = 70.0
    transaction_cost_pct: float = 0.1  # 0.1%

class BacktestTradeLog(BaseModel):
    date: str
    action: str  # "BUY" or "SELL"
    price: float
    shares: float
    value: float
    reason: str

class BacktestResult(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float
    final_capital: float
    total_return_pct: float
    benchmark_return_pct: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    equity_curve: List[dict]  # [{"date": "...", "portfolio_value": ..., "benchmark_value": ...}]
    trade_logs: List[BacktestTradeLog]

class OrderRequest(BaseModel):
    symbol: str
    action: str  # "BUY" or "SELL"
    shares: float = Field(gt=0, description="Number of shares to buy or sell")

class PositionSchema(BaseModel):
    symbol: str
    shares: float
    avg_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float

class TransactionSchema(BaseModel):
    id: int
    symbol: str
    action: str
    shares: float
    price: float
    total_amount: float
    timestamp: str

class PortfolioSummaryResponse(BaseModel):
    cash_balance: float
    total_invested: float
    portfolio_value: float
    total_net_worth: float
    total_pnl: float
    total_pnl_pct: float
    currency: str
    positions: List[PositionSchema]
    recent_transactions: List[TransactionSchema]

class StressTestResult(BaseModel):
    scenario: str
    market_drop_pct: float
    estimated_portfolio_impact: float
    estimated_portfolio_value: float

class RiskAnalysisResponse(BaseModel):
    symbol: str
    annualized_volatility_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    beta: float
    daily_var_95: float  # Value at Risk 95%
    stress_tests: List[StressTestResult]

class NewsItem(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    summary: str
    sentiment: str  # "Bullish", "Bearish", "Neutral"
    score: float
