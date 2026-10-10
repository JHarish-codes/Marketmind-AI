from fastapi import APIRouter, HTTPException
from app.schemas import BacktestRequest, BacktestResult
from app.services.backtest import run_backtest

router = APIRouter(prefix="/api/backtest", tags=["Backtest"])

@router.post("/run", response_model=BacktestResult)
def execute_backtest(req: BacktestRequest):
    try:
        result = run_backtest(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
