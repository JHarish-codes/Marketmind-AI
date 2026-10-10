from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Portfolio, Position, Transaction
from app.schemas import OrderRequest, PortfolioSummaryResponse, PositionSchema, TransactionSchema
from app.services.stock_data import fetch_stock_history, get_company_name

def get_or_create_portfolio(db: Session) -> Portfolio:
    portfolio = db.query(Portfolio).first()
    if not portfolio:
        portfolio = Portfolio(cash_balance=100000.0, currency="INR")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio

def execute_order(db: Session, order: OrderRequest) -> dict:
    portfolio = get_or_create_portfolio(db)
    symbol_upper = order.symbol.upper()
    
    # Get current stock price
    df, _ = fetch_stock_history(symbol_upper, period="1d")
    if df.empty or "Close" not in df.columns:
        raise ValueError(f"Unable to fetch price data for symbol '{symbol_upper}' to execute trade.")
    
    current_price = float(df.iloc[-1]["Close"])
    total_cost = order.shares * current_price

    if order.action.upper() == "BUY":
        if portfolio.cash_balance < total_cost:
            raise ValueError(f"Insufficient cash balance (Available: ₹{portfolio.cash_balance:,.2f}, Required: ₹{total_cost:,.2f})")
        
        # Deduct cash
        portfolio.cash_balance -= total_cost

        # Update or create position
        position = db.query(Position).filter(Position.portfolio_id == portfolio.id, Position.symbol == symbol_upper).first()
        if position:
            new_total_shares = position.shares + order.shares
            new_avg_price = ((position.shares * position.avg_price) + total_cost) / new_total_shares
            position.shares = new_total_shares
            position.avg_price = new_avg_price
        else:
            position = Position(
                portfolio_id=portfolio.id,
                symbol=symbol_upper,
                shares=order.shares,
                avg_price=current_price
            )
            db.add(position)

        # Record transaction
        tx = Transaction(
            portfolio_id=portfolio.id,
            symbol=symbol_upper,
            action="BUY",
            shares=order.shares,
            price=current_price,
            total_amount=total_cost,
            notes=f"Bought {order.shares} shares of {get_company_name(symbol_upper)} at ₹{current_price:,.2f}"
        )
        db.add(tx)
        db.commit()
        return {"status": "success", "message": f"Successfully bought {order.shares} shares of {symbol_upper} at ₹{current_price:,.2f}"}

    elif order.action.upper() == "SELL":
        position = db.query(Position).filter(Position.portfolio_id == portfolio.id, Position.symbol == symbol_upper).first()
        if not position or position.shares < order.shares:
            avail = position.shares if position else 0.0
            raise ValueError(f"Insufficient position shares (Available: {avail}, Requested: {order.shares})")
        
        # Add cash
        portfolio.cash_balance += total_cost
        position.shares -= order.shares

        if position.shares <= 1e-6:
            db.delete(position)

        # Record transaction
        tx = Transaction(
            portfolio_id=portfolio.id,
            symbol=symbol_upper,
            action="SELL",
            shares=order.shares,
            price=current_price,
            total_amount=total_cost,
            notes=f"Sold {order.shares} shares of {get_company_name(symbol_upper)} at ₹{current_price:,.2f}"
        )
        db.add(tx)
        db.commit()
        return {"status": "success", "message": f"Successfully sold {order.shares} shares of {symbol_upper} at ₹{current_price:,.2f}"}
    else:
        raise ValueError("Invalid order action. Must be 'BUY' or 'SELL'.")

def get_portfolio_summary(db: Session) -> PortfolioSummaryResponse:
    portfolio = get_or_create_portfolio(db)
    positions_db = db.query(Position).filter(Position.portfolio_id == portfolio.id).all()
    transactions_db = db.query(Transaction).filter(Transaction.portfolio_id == portfolio.id).order_by(Transaction.timestamp.desc()).limit(15).all()

    position_schemas = []
    total_invested = 0.0
    total_market_value = 0.0

    for pos in positions_db:
        if pos.shares <= 0:
            continue
        df, _ = fetch_stock_history(pos.symbol, period="1d")
        curr_p = float(df.iloc[-1]["Close"]) if not df.empty else pos.avg_price
        
        invested = pos.shares * pos.avg_price
        mkt_val = pos.shares * curr_p
        pnl = mkt_val - invested
        pnl_pct = (pnl / invested * 100.0) if invested > 0 else 0.0

        total_invested += invested
        total_market_value += mkt_val

        position_schemas.append(PositionSchema(
            symbol=pos.symbol,
            shares=round(pos.shares, 4),
            avg_price=round(pos.avg_price, 2),
            current_price=round(curr_p, 2),
            market_value=round(mkt_val, 2),
            unrealized_pnl=round(pnl, 2),
            unrealized_pnl_pct=round(pnl_pct, 2)
        ))

    tx_schemas = [
        TransactionSchema(
            id=t.id,
            symbol=t.symbol,
            action=t.action,
            shares=round(t.shares, 4),
            price=round(t.price, 2),
            total_amount=round(t.total_amount, 2),
            timestamp=t.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        ) for t in transactions_db
    ]

    net_worth = portfolio.cash_balance + total_market_value
    total_pnl = net_worth - 100000.0  # relative to initial ₹1,00,000 capital
    total_pnl_pct = (total_pnl / 100000.0) * 100.0

    return PortfolioSummaryResponse(
        cash_balance=round(portfolio.cash_balance, 2),
        total_invested=round(total_invested, 2),
        portfolio_value=round(total_market_value, 2),
        total_net_worth=round(net_worth, 2),
        total_pnl=round(total_pnl, 2),
        total_pnl_pct=round(total_pnl_pct, 2),
        currency=portfolio.currency,
        positions=position_schemas,
        recent_transactions=tx_schemas
    )
