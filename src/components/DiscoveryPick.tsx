import { useState, useEffect } from 'react';
import type { DiscoveryItem } from '../types';

const CACHE_KEY = 'discovery_pick_cache_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const PROMPT = `Suggest 3 guitar artists or albums that a serious guitar enthusiast with eclectic taste should discover. Mix genres — include at least one hidden gem, one emerging artist, and one overlooked classic. Return ONLY a valid JSON array with objects containing: artist (string), album (string or null), genre (string), why (exactly 2 sentences, plain text only — no markdown, no asterisks, no bullet symbols). No other text.`;

function loadCache(): DiscoveryItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  } catch {}
  return null;
}

function saveCache(data: DiscoveryItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
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

export default function DiscoveryPick() {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setItems(cached);
      setStatus('done');
    }
  }, []);

  async function fetchData() {
    setStatus('loading');
    setError('');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT }] }],
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? `Gemini error ${res.status}`);
      const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed: DiscoveryItem[] = JSON.parse(text.replace(/```json|```/g, '').trim());
      setItems(parsed);
      setStatus('done');
      saveCache(parsed);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">&#10024; Discovery Pick</h2>
          <p className="text-sm text-gray-400 mt-0.5">Artists and albums worth your ears</p>
        </div>
        <button
          onClick={fetchData}
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Thinking...
            </>
          ) : status === 'done' ? 'Refresh' : 'Get recommendations'}
        </button>
      </div>

      {status === 'idle' && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">&#10024;</p>
          <p className="text-gray-400 text-sm">Click "Get recommendations" for AI-powered picks from Gemini</p>
        </div>
      )}

      {status === 'loading' && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Gemini is thinking...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 rounded-2xl p-5 text-sm text-red-600 border border-red-100">
          <strong>Error:</strong> {error}
        </div>
      )}

      {status === 'done' && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => <DiscoveryCard key={i} item={item} />)}
        </div>
      )}
    </section>
  );
}
