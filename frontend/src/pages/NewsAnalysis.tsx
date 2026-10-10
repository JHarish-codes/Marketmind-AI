import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { NewsItem } from '../types';

export const NewsAnalysis: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getNews('ALL');
      setNews(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch financial news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-1">
          <Newspaper className="w-6 h-6 text-cyan-400" />
          <h2 className="font-bold text-lg text-white font-mono">Market News & Sentiment Analysis</h2>
        </div>
        <p className="text-xs text-slate-400">Automated NLP sentiment scoring on financial publications</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16 bg-dark-800 border border-dark-600 rounded-xl">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item, idx) => (
            <div key={idx} className="bg-dark-800 border border-dark-600 rounded-xl p-5 flex flex-col justify-between hover:border-dark-500 transition-colors">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-0.5 bg-dark-900 border border-dark-600 rounded">
                    {item.source} • {item.published_at}
                  </span>

                  <span className={`flex items-center space-x-1 text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    item.sentiment === 'Bullish'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : item.sentiment === 'Bearish'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                  }`}>
                    {item.sentiment === 'Bullish' ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : item.sentiment === 'Bearish' ? (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    ) : (
                      <Minus className="w-3 h-3 mr-0.5" />
                    )}
                    <span>{item.sentiment} ({item.score > 0 ? `+${item.score}` : item.score})</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-2 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.summary}</p>
              </div>

              <div className="pt-3 border-t border-dark-600/50 flex justify-end">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Read full story</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
