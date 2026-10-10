from fastapi import APIRouter, Query, HTTPException
from typing import List
from datetime import datetime
from app.schemas import StockQuoteResponse, StockDataPoint, TechnicalIndicators
from app.services.stock_data import fetch_stock_history, get_company_name, get_currency, COMPANY_NAMES
from app.services.indicators import compute_all_indicators

router = APIRouter(prefix="/api/stocks", tags=["Stocks"])

POPULAR_STOCKS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE"},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "exchange": "NSE"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "exchange": "NSE"},
    {"symbol": "WIPRO.NS", "name": "Wipro Ltd", "exchange": "NSE"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE"},
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "exchange": "NASDAQ"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
]

@router.get("/search")
def search_stocks(q: str = Query(default="", min_length=0)):
    if not q:
        return POPULAR_STOCKS
    q_lower = q.lower()
    matches = [
        item for item in POPULAR_STOCKS
        if q_lower in item["symbol"].lower() or q_lower in item["name"].lower()
    ]
    if not matches and len(q) >= 2:
        symbol = q.upper()
        matches.append({"symbol": symbol, "name": get_company_name(symbol), "exchange": "GLOBAL"})
    return matches

@router.get("/{symbol}", response_model=StockQuoteResponse)
def get_stock_detail(symbol: str, period: str = "1y"):
    symbol_upper = symbol.upper()
    df, source = fetch_stock_history(symbol_upper, period)
    
    if df.empty or len(df) == 0:
        raise HTTPException(status_code=404, detail=f"Stock data not found for symbol '{symbol_upper}'")

    current_price = float(df.iloc[-1]["Close"])
    prev_price = float(df.iloc[-2]["Close"]) if len(df) > 1 else current_price
    change = round(current_price - prev_price, 2)
    percent_change = round((change / prev_price * 100.0) if prev_price > 0 else 0.0, 2)

    day_high = float(df.iloc[-1]["High"])
    day_low = float(df.iloc[-1]["Low"])
    volume = int(df.iloc[-1]["Volume"])

    history = [
        StockDataPoint(
            timestamp=str(row["Date"]),
            open=float(row["Open"]),
            high=float(row["High"]),
            low=float(row["Low"]),
            close=float(row["Close"]),
            volume=int(row["Volume"])
        ) for _, row in df.iterrows()
    ]

    indicators_dict = compute_all_indicators(df)
    indicators = TechnicalIndicators(**indicators_dict) if indicators_dict else None

    return StockQuoteResponse(
        symbol=symbol_upper,
        company_name=get_company_name(symbol_upper),
        currency=get_currency(symbol_upper),
        current_price=current_price,
        change=change,
        percent_change=percent_change,
        day_high=day_high,
        day_low=day_low,
        volume=volume,
        data_source=source,
        last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        history=history,
        indicators=indicators
    )
