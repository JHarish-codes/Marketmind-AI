import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Portfolio, Position, Transaction
from app.schemas import OrderRequest
from app.services.trading import execute_order, get_portfolio_summary

# In-memory SQLite DB for testing
SQLALCHEMY_TEST_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_virtual_trading_buy_and_sell(db_session):
    # Initial state summary
    summary = get_portfolio_summary(db_session)
    assert summary.cash_balance == 100000.0
    assert summary.portfolio_value == 0.0

    # Execute BUY order
    buy_order = OrderRequest(symbol="RELIANCE.NS", action="BUY", shares=5.0)
    res_buy = execute_order(db_session, buy_order)
    assert res_buy["status"] == "success"

    # Check portfolio after buy
    summary_after_buy = get_portfolio_summary(db_session)
    assert summary_after_buy.cash_balance < 100000.0
    assert len(summary_after_buy.positions) == 1
    assert summary_after_buy.positions[0].symbol == "RELIANCE.NS"
    assert summary_after_buy.positions[0].shares == 5.0

    # Execute SELL order
    sell_order = OrderRequest(symbol="RELIANCE.NS", action="SELL", shares=2.0)
    res_sell = execute_order(db_session, sell_order)
    assert res_sell["status"] == "success"

    # Check portfolio after partial sell
    summary_after_sell = get_portfolio_summary(db_session)
    assert len(summary_after_sell.positions) == 1
    assert summary_after_sell.positions[0].shares == 3.0

def test_virtual_trading_insufficient_cash(db_session):
    # Try buying absurdly high number of shares
    huge_order = OrderRequest(symbol="AAPL", action="BUY", shares=100000.0)
    with pytest.raises(ValueError, match="Insufficient cash balance"):
        execute_order(db_session, huge_order)
