from fastapi import APIRouter, HTTPException
from app.schemas import RiskAnalysisResponse
from app.services.risk import analyze_risk

router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])

@router.get("/{symbol}", response_model=RiskAnalysisResponse)
def get_risk_analysis(symbol: str, period: str = "1y"):
    try:
        res = analyze_risk(symbol.upper(), period)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
