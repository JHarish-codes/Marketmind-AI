# MarketMind AI — Institutional Financial Analytics & Trading Terminal

MarketMind AI is a full-stack stock market analytics dashboard, algorithmic backtesting platform, risk management suite, and virtual paper trading terminal.

## Architecture

- **Backend**: Python, FastAPI, SQLAlchemy (SQLite), Pandas, NumPy, yfinance, Pytest.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.

## Core Features

1. **Stock Explorer**: Real-time & historical price lookup, OHLCV candlestick/line charts, technical indicators (RSI, MACD, SMA 20/50/200, EMA 12/26), data source status tagger.
2. **Strategy Backtesting**: Buy & Hold, Moving Average Crossover, and RSI Mean Reversion strategies with slippage/transaction cost modeling, max drawdown, win rate, equity curve charts, and trade execution logs.
3. **Risk Analysis**: Annualized volatility, Sharpe ratio, Max Drawdown, Beta, 95% Daily VaR, and interactive market crash stress test simulator.
4. **Virtual Trading**: ₹1,00,000 initial virtual cash, paper buy & sell order execution, position tracking with unrealized P&L, transaction logs persisted in SQLite (`marketmind.db`).
5. **News & Sentiment**: Financial news stream with NLP sentiment scoring (Bullish, Bearish, Neutral) and concise key takeaways.

## Getting Started

### 1. Backend Setup & Run

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup & Run

```powershell
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.
