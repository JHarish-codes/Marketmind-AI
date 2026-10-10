import axios from 'axios';
import {
  StockQuote,
  StockSearchMatch,
  BacktestRequest,
  BacktestResult,
  RiskAnalysis,
  PortfolioSummary,
  NewsItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // Stocks API
  searchStocks: async (query: string): Promise<StockSearchMatch[]> => {
    const res = await axios.get(`${API_BASE}/stocks/search`, { params: { q: query } });
    return res.data;
  },

  getStockQuote: async (symbol: string, period: string = '1y'): Promise<StockQuote> => {
    const res = await axios.get(`${API_BASE}/stocks/${encodeURIComponent(symbol)}`, { params: { period } });
    return res.data;
  },

  // Backtest API
  runBacktest: async (req: BacktestRequest): Promise<BacktestResult> => {
    const res = await axios.post(`${API_BASE}/backtest/run`, req);
    return res.data;
  },

  // Risk API
  getRiskAnalysis: async (symbol: string, period: string = '1y'): Promise<RiskAnalysis> => {
    const res = await axios.get(`${API_BASE}/risk/${encodeURIComponent(symbol)}`, { params: { period } });
    return res.data;
  },

  // Trading API
  getPortfolio: async (): Promise<PortfolioSummary> => {
    const res = await axios.get(`${API_BASE}/trading/portfolio`);
    return res.data;
  },

  placeOrder: async (symbol: string, action: 'BUY' | 'SELL', shares: number): Promise<{ status: string; message: string }> => {
    const res = await axios.post(`${API_BASE}/trading/order`, { symbol, action, shares });
    return res.data;
  },

  // News API
  getNews: async (symbol: string = 'ALL'): Promise<NewsItem[]> => {
    const res = await axios.get(`${API_BASE}/news`, { params: { symbol } });
    return res.data;
  }
};
