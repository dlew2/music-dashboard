import { useState, useEffect } from 'react';
import type { RssItem } from '../types';

interface FeedConfig {
  name: string;
  url: string;
  isJsonFeed?: boolean;
}

interface Props {
  title: string;
  subtitle: string;
  emoji: string;
  feeds: FeedConfig[];
  maxItems?: number;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

async function fetchFeed(feed: FeedConfig): Promise<RssItem[]> {
  if (feed.isJsonFeed) {
    const res = await fetch(feed.url);
    const data = await res.json();
    return (data.items ?? []).map((item: any) => ({
      title: item.title ?? '',
      link: item.url ?? item.external_url ?? '',
      pubDate: item.date_published ?? '',
      source: feed.name,
    }));
  }
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=10`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  if (data.status !== 'ok') return [];
  return (data.items ?? []).map((item: any) => ({
    title: item.title ?? '',
    link: item.link ?? '',
    pubDate: item.pubDate ?? '',
    source: feed.name,
  }));
}

function ArticleCard({ item }: { item: RssItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="block group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.source}</span>
        <span className="text-xs text-gray-400">{item.pubDate ? timeAgo(item.pubDate) : ''}</span>
      </div>
      <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
        {item.title}
      </h4>
    </a>
  );
}

export default function RssSection({ title, subtitle, emoji, feeds, maxItems = 6 }: Props) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [error, setError] = useState('');

  async function loadFeeds() {
    setStatus('loading');
    setError('');
    try {
      const results = await Promise.allSettled(feeds.map(fetchFeed));
      const all: RssItem[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') all.push(...r.value);
      }
      if (!all.length) throw new Error('No articles could be loaded');
      all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(all.slice(0, maxItems));
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? 'Failed to load feeds');
      setStatus('error');
    }
  }

  useEffect(() => { loadFeeds(); }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{emoji} {title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        {status === 'done' && (
          <button
            onClick={loadFeeds}
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {status === 'loading' && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading latest articles...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 rounded-2xl p-5 text-sm text-red-600 border border-red-100">
          <strong>Error:</strong> {error}
          <button onClick={loadFeeds} className="ml-3 underline">Retry</button>
        </div>
      )}

      {status === 'done' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => <ArticleCard key={i} item={item} />)}
        </div>
      )}
    </section>
  );
}
