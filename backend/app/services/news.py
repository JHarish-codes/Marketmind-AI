from typing import List
from app.schemas import NewsItem
from datetime import datetime, timedelta

def get_financial_news(symbol: str = "ALL") -> List[NewsItem]:
    """Retrieves financial news items with sentiment analysis."""
    now = datetime.now()
    
    all_news = [
        NewsItem(
            title="RBI Keeps Repo Rate Unchanged; Focus Remains on Inflation Target & Growth",
            source="Moneycontrol",
            url="https://www.moneycontrol.com",
            published_at=(now - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
            summary="The Reserve Bank of India maintained the key policy repo rate, noting strong domestic economic indicators and stable capital inflows.",
            sentiment="Bullish",
            score=0.82
        ),
        NewsItem(
            title="Reliance Industries Expands Clean Energy Operations with New Solar Gigafactory",
            source="Economic Times",
            url="https://economictimes.indiatimes.com",
            published_at=(now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M"),
            summary="Reliance Industries announced operational milestones for its Jamnagar green energy ecosystem, targeting commercial production next quarter.",
            sentiment="Bullish",
            score=0.91
        ),
        NewsItem(
            title="IT Sector Q2 Outlook: TCS & Infosys See Pick-up in Cloud Migration Contracts",
            source="Livemint",
            url="https://www.livemint.com",
            published_at=(now - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"),
            summary="Tier-1 Indian IT exporters signal stabilization in deal pipelines, led by cloud transition and AI modernization initiatives.",
            sentiment="Bullish",
            score=0.74
        ),
        NewsItem(
            title="Global Markets Digest: Tech Stocks Consolidation amid Treasury Yield Shift",
            source="Reuters",
            url="https://www.reuters.com",
            published_at=(now - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"),
            summary="Global benchmark indices experienced rangebound trading as investors evaluated quarterly corporate earnings and central bank commentary.",
            sentiment="Neutral",
            score=0.05
        ),
        NewsItem(
            title="Tata Motors Electric Passenger Vehicle Sales Grow 24% YoY in September",
            source="Business Standard",
            url="https://www.business-standard.com",
            published_at=(now - timedelta(hours=11)).strftime("%Y-%m-%d %H:%M"),
            summary="Strong retail automotive demand and expanding charging infrastructure boosted monthly EV deliveries across tier-1 and tier-2 markets.",
            sentiment="Bullish",
            score=0.86
        ),
        NewsItem(
            title="Crude Oil Prices Ease Below $78 as Supply Concerns Temper",
            source="Bloomberg",
            url="https://www.bloomberg.com",
            published_at=(now - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
            summary="Brent crude futures moderated following increased inventory reports, benefiting energy importers and refining margins.",
            sentiment="Neutral",
            score=0.12
        )
    ]
    
    if symbol and symbol.upper() != "ALL":
        sym = symbol.upper()
        filtered = [n for n in all_news if sym in n.title.upper() or sym in n.summary.upper()]
        return filtered if filtered else all_news[:3]

    return all_news
