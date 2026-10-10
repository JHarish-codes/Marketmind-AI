import pandas as pd
import numpy as np

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).fillna(0)
    loss = (-delta.where(delta < 0, 0)).fillna(0)

    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.round(2)

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    macd_signal = macd.ewm(span=signal, adjust=False).mean()
    macd_hist = macd - macd_signal
    return macd.round(2), macd_signal.round(2), macd_hist.round(2)

def compute_all_indicators(df: pd.DataFrame) -> dict:
    """Computes technical indicators for a stock history DataFrame."""
    if df.empty or "Close" not in df.columns or len(df) < 5:
        return {}

    close = df["Close"]

    rsi = calculate_rsi(close, 14)
    macd, macd_signal, macd_hist = calculate_macd(close, 12, 26, 9)

    sma_20 = close.rolling(window=20).mean().round(2)
    sma_50 = close.rolling(window=50).mean().round(2)
    sma_200 = close.rolling(window=200).mean().round(2)

    ema_12 = close.ewm(span=12, adjust=False).mean().round(2)
    ema_26 = close.ewm(span=26, adjust=False).mean().round(2)

    def clean_series(s: pd.Series):
        return [None if pd.isna(x) else float(x) for x in s]

    return {
        "rsi": clean_series(rsi),
        "macd": clean_series(macd),
        "macd_signal": clean_series(macd_signal),
        "macd_hist": clean_series(macd_hist),
        "sma_20": clean_series(sma_20),
        "sma_50": clean_series(sma_50),
        "sma_200": clean_series(sma_200),
        "ema_12": clean_series(ema_12),
        "ema_26": clean_series(ema_26)
    }
