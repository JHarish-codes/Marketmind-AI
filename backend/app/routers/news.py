from fastapi import APIRouter
from typing import List
from app.schemas import NewsItem
from app.services.news import get_financial_news

router = APIRouter(prefix="/api/news", tags=["News"])

@router.get("", response_model=List[NewsItem])
def get_news(symbol: str = "ALL"):
    return get_financial_news(symbol)
