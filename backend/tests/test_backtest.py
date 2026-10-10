import pytest
from app.schemas import BacktestRequest
from app.services.backtest import run_backtest

def test_backtest_buy_hold():
    req = BacktestRequest(
        symbol="RELIANCE.NS",
        strategy="buy_hold",
        period="6m",
        initial_capital=100000.0,
        transaction_cost_pct=0.1
    )
    result = run_backtest(req)
    assert result.symbol == "RELIANCE.NS"
    assert result.initial_capital == 100000.0
    assert result.final_capital > 0
    assert len(result.equity_curve) > 0
    assert len(result.trade_logs) >= 1

def test_backtest_ma_crossover():
    req = BacktestRequest(
        symbol="TCS.NS",
        strategy="ma_crossover",
        period="1y",
        initial_capital=100000.0,
        fast_period=10,
        slow_period=20
    )
    result = run_backtest(req)
    assert result.strategy == "ma_crossover"
    assert isinstance(result.total_return_pct, float)
    assert isinstance(result.max_drawdown_pct, float)
    assert len(result.equity_curve) > 0

def test_backtest_rsi():
    req = BacktestRequest(
        symbol="AAPL",
        strategy="rsi",
        period="1y",
        initial_capital=50000.0,
        rsi_oversold=35.0,
        rsi_overbought=65.0
    )
    result = run_backtest(req)
    assert result.strategy == "rsi"
    assert len(result.equity_curve) > 0
