from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import stocks, backtest, risk, trading, news

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MarketMind AI API",
    description="Stock market analytics, backtesting engine, risk dashboard & virtual trading terminal",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(stocks.router)
app.include_router(backtest.router)
app.include_router(risk.router)
app.include_router(trading.router)
app.include_router(news.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "MarketMind AI API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
