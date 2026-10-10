import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

COMPANY_NAMES = {
    "RELIANCE.NS": "Reliance Industries Ltd",
    "TCS.NS": "Tata Consultancy Services Ltd",
    "INFY.NS": "Infosys Ltd",
    "HDFCBANK.NS": "HDFC Bank Ltd",
    "TATAMOTORS.NS": "Tata Motors Ltd",
    "ICICIBANK.NS": "ICICI Bank Ltd",
    "WIPRO.NS": "Wipro Ltd",
    "SBIN.NS": "State Bank of India",
    "AAPL": "Apple Inc.",
    "NVDA": "NVIDIA Corporation",
    "TSLA": "Tesla Inc.",
    "MSFT": "Microsoft Corporation",
    "AMZN": "Amazon.com Inc.",
    "GOOGL": "Alphabet Inc."
}

BASE_PRICES = {
    "RELIANCE.NS": 2850.0,
    "TCS.NS": 4120.0,
    "INFY.NS": 1820.0,
    "HDFCBANK.NS": 1640.0,
    "TATAMOTORS.NS": 980.0,
    "ICICIBANK.NS": 1210.0,
    "WIPRO.NS": 540.0,
    "SBIN.NS": 810.0,
    "AAPL": 225.0,
    "NVDA": 130.0,
    "TSLA": 240.0,
    "MSFT": 445.0,
    "AMZN": 185.0,
    "GOOGL": 175.0
}

def get_currency(symbol: str) -> str:
    return "INR" if symbol.endswith(".NS") or symbol.endswith(".BO") else "USD"

def get_company_name(symbol: str) -> str:
    return COMPANY_NAMES.get(symbol.upper(), f"{symbol.upper()} Corp")

def generate_simulated_history(symbol: str, days: int = 365) -> pd.DataFrame:
    """Generates realistic synthetic OHLCV data when live market API is unavailable."""
    symbol_upper = symbol.upper()
    base_price = BASE_PRICES.get(symbol_upper, 500.0)
    
    # Deterministic random seed based on symbol name
    seed = sum(ord(c) for c in symbol_upper)
    np.random.seed(seed)
    
    end_date = datetime.now()
    dates = [end_date - timedelta(days=i) for i in range(days)]
    dates.reverse()
    
    # Filter weekends
    trading_dates = [d for d in dates if d.weekday() < 5]
    n = len(trading_dates)
    
    # Geometric Brownian Motion for close prices
    returns = np.random.normal(loc=0.0005, scale=0.015, size=n)
    price_path = base_price * np.exp(np.cumsum(returns))
    
    records = []
    for i, date in enumerate(trading_dates):
        close_p = round(float(price_path[i]), 2)
        daily_vol = close_p * np.random.uniform(0.008, 0.025)
        high_p = round(close_p + abs(daily_vol * np.random.uniform(0.3, 1.0)), 2)
        low_p = round(close_p - abs(daily_vol * np.random.uniform(0.3, 1.0)), 2)
        open_p = round(low_p + (high_p - low_p) * np.random.uniform(0.2, 0.8), 2)
        
        # Ensure high is highest and low is lowest
        high_p = max(high_p, open_p, close_p)
        low_p = min(low_p, open_p, close_p)
        volume = int(np.random.uniform(500000, 5000000))
        
        records.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Open": open_p,
            "High": high_p,
            "Low": low_p,
            "Close": close_p,
            "Volume": volume
        })
        
    df = pd.DataFrame(records)
    return df

def fetch_stock_history(symbol: str, period: str = "1y") -> tuple[pd.DataFrame, str]:
    """
    Fetches stock history using yfinance if available, falling back to simulated generator.
    Returns (DataFrame, source_tag).
    """
    days_map = {"1m": 30, "3m": 90, "6m": 180, "1y": 365, "2y": 730, "5y": 1825}
    days = days_map.get(period.lower(), 365)
    
    try:
        import yfinance as yf
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        if not df.empty and len(df) > 5:
            df = df.reset_index()
            # Format Date column
            if "Date" in df.columns:
                df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
            elif "Datetime" in df.columns:
                df["Date"] = pd.to_datetime(df["Datetime"]).dt.strftime("%Y-%m-%d")
            
            # Select essential columns
            cols = ["Date", "Open", "High", "Low", "Close", "Volume"]
            df = df[[c for c in cols if c in df.columns]]
            df = df.round(2)
            return df, "live"
    except Exception as e:
        logger.warning(f"Failed to fetch yfinance data for {symbol}: {e}. Falling back to simulation.")
        
    df_sim = generate_simulated_history(symbol, days=days)
    return df_sim, "simulated"
