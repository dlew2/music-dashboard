import { useState } from 'react';
import type { NewsItem, GearItem, DiscoveryItem } from '../types';

type SectionType = 'music-news' | 'gear-radar' | 'discovery-pick';
type Item = NewsItem | GearItem | DiscoveryItem;

interface Props {
  type: SectionType;
  title: string;
  subtitle: string;
  emoji: string;
}

function NewsCard({ item }: { item: NewsItem | GearItem }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-2">{item.title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
        >Read more &rarr;</a>
      )}
    </div>
  );
}

function DiscoveryCard({ item }: { item: DiscoveryItem }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-lg shrink-0">
          &#127925;
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{item.artist}</h4>
          {item.album && <p className="text-xs text-gray-400 mt-0.5">{item.album}</p>}
          <span className="inline-block mt-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{item.genre}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{item.why}</p>
    </div>
  );
}

export default function ClaudeSection({ type, title, subtitle, emoji }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function fetchData() {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Error ${res.status}`);
      setItems(json.data);
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{emoji} {title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={fetchData}
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </>
          ) : status === 'done' ? 'Refresh' : 'Fetch latest'}
        </button>
      </div>

      {status === 'idle' && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">{emoji}</p>
          <p className="text-gray-400 text-sm">Click "Fetch latest" to search the web with Claude</p>
        </div>
      )}

      {status === 'loading' && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Claude is searching the web...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 rounded-2xl p-5 text-sm text-red-600 border border-red-100">
          <strong>Error:</strong> {error}
        </div>
      )}

      {status === 'done' && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) =>
            type === 'discovery-pick'
              ? <DiscoveryCard key={i} item={item as DiscoveryItem} />
              : <NewsCard key={i} item={item as NewsItem | GearItem} />
          )}
        </div>
      )}
    </section>
  );
}
