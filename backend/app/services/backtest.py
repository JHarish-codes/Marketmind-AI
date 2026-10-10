import pandas as pd
import numpy as np
from app.services.stock_data import fetch_stock_history
from app.services.indicators import calculate_rsi
from app.schemas import BacktestRequest, BacktestResult, BacktestTradeLog

def run_backtest(req: BacktestRequest) -> BacktestResult:
    df, _ = fetch_stock_history(req.symbol, req.period)
    
    if df.empty or len(df) < 10:
        raise ValueError(f"Insufficient historical data for symbol '{req.symbol}' to perform backtest.")

    df = df.copy().sort_values("Date").reset_index(drop=True)
    initial_cash = req.initial_capital
    cost_factor = 1.0 - (req.transaction_cost_pct / 100.0)

    cash = initial_cash
    shares = 0.0
    
    benchmark_initial_price = df.loc[0, "Close"]
    benchmark_shares = initial_cash / benchmark_initial_price
    
    trade_logs = []
    equity_curve = []

    # Calculate indicators needed for strategies
    df["SMA_Fast"] = df["Close"].rolling(window=req.fast_period).mean()
    df["SMA_Slow"] = df["Close"].rolling(window=req.slow_period).mean()
    df["RSI"] = calculate_rsi(df["Close"], 14)

    completed_trades = []  # list of tuples (buy_price, sell_price)

    last_buy_price = 0.0

    for i in range(len(df)):
        date_str = df.loc[i, "Date"]
        close_p = float(df.loc[i, "Close"])
        
        # Strategy evaluation logic
        should_buy = False
        should_sell = False
        buy_reason = ""
        sell_reason = ""

        if req.strategy == "buy_hold":
            if i == 0:
                should_buy = True
                buy_reason = "Initial Buy & Hold Entry"
        elif req.strategy == "ma_crossover":
            if i >= req.slow_period:
                prev_fast = df.loc[i - 1, "SMA_Fast"]
                prev_slow = df.loc[i - 1, "SMA_Slow"]
                curr_fast = df.loc[i, "SMA_Fast"]
                curr_slow = df.loc[i, "SMA_Slow"]

                if not (pd.isna(prev_fast) or pd.isna(prev_slow) or pd.isna(curr_fast) or pd.isna(curr_slow)):
                    if prev_fast <= prev_slow and curr_fast > curr_slow:
                        should_buy = True
                        buy_reason = f"Bullish Crossover: Fast SMA ({req.fast_period}) crossed above Slow SMA ({req.slow_period})"
                    elif prev_fast >= prev_slow and curr_fast < curr_slow:
                        should_sell = True
                        sell_reason = f"Bearish Crossover: Fast SMA ({req.fast_period}) crossed below Slow SMA ({req.slow_period})"
        elif req.strategy == "rsi":
            rsi_val = df.loc[i, "RSI"]
            if not pd.isna(rsi_val):
                if rsi_val < req.rsi_oversold:
                    should_buy = True
                    buy_reason = f"RSI Oversold ({rsi_val:.1f} < {req.rsi_oversold})"
                elif rsi_val > req.rsi_overbought:
                    should_sell = True
                    sell_reason = f"RSI Overbought ({rsi_val:.1f} > {req.rsi_overbought})"

        # Execute order if signal triggered
        if should_buy and cash > 0 and shares == 0:
            invest_amount = cash * cost_factor
            shares = invest_amount / close_p
            last_buy_price = close_p
            cash = 0.0
            trade_logs.append(BacktestTradeLog(
                date=date_str,
                action="BUY",
                price=close_p,
                shares=round(shares, 4),
                value=round(invest_amount, 2),
                reason=buy_reason
            ))

        elif should_sell and shares > 0:
            sell_amount = (shares * close_p) * cost_factor
            completed_trades.append((last_buy_price, close_p))
            cash = sell_amount
            trade_logs.append(BacktestTradeLog(
                date=date_str,
                action="SELL",
                price=close_p,
                shares=round(shares, 4),
                value=round(sell_amount, 2),
                reason=sell_reason
            ))
            shares = 0.0

        current_portfolio_value = cash + (shares * close_p)
        current_benchmark_value = benchmark_shares * close_p
        
        equity_curve.append({
            "date": date_str,
            "portfolio_value": round(current_portfolio_value, 2),
            "benchmark_value": round(current_benchmark_value, 2)
        })

    final_capital = cash + (shares * df.iloc[-1]["Close"])
    total_return_pct = round(((final_capital - initial_cash) / initial_cash) * 100.0, 2)
    benchmark_return_pct = round(((current_benchmark_value - initial_cash) / initial_cash) * 100.0, 2)

    # Calculate Max Drawdown
    portfolio_values = np.array([e["portfolio_value"] for e in equity_curve])
    running_max = np.maximum.accumulate(portfolio_values)
    drawdowns = (portfolio_values - running_max) / running_max
    max_drawdown_pct = round(float(np.abs(np.min(drawdowns)) * 100.0), 2) if len(drawdowns) > 0 else 0.0

    # Win rate calculation
    winning_trades = sum(1 for buy, sell in completed_trades if sell > buy)
    total_completed = len(completed_trades)
    win_rate_pct = round((winning_trades / total_completed) * 100.0, 2) if total_completed > 0 else 0.0

    return BacktestResult(
        symbol=req.symbol,
        strategy=req.strategy,
        initial_capital=initial_cash,
        final_capital=round(final_capital, 2),
        total_return_pct=total_return_pct,
        benchmark_return_pct=benchmark_return_pct,
        max_drawdown_pct=max_drawdown_pct,
        win_rate_pct=win_rate_pct,
        total_trades=len(trade_logs),
        equity_curve=equity_curve,
        trade_logs=trade_logs
    )
