from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import OrderRequest, PortfolioSummaryResponse
from app.services.trading import execute_order, get_portfolio_summary

router = APIRouter(prefix="/api/trading", tags=["Virtual Trading"])

@router.get("/portfolio", response_model=PortfolioSummaryResponse)
def get_portfolio(db: Session = Depends(get_db)):
    try:
        return get_portfolio_summary(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/order")
def place_order(order: OrderRequest, db: Session = Depends(get_db)):
    try:
        res = execute_order(db, order)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
