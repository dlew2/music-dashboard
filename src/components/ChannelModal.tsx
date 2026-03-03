import { useState } from 'react';
import type { Channel } from '../types';

interface Props {
  channels: Channel[];
  onAdd: (channel: Channel) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

function extractChannelId(input: string): string | null {
  input = input.trim();
  // Direct UC... ID
  if (/^UC[\w-]{22}$/.test(input)) return input;
  // URL containing /channel/UC...
  const m = input.match(/\/channel\/(UC[\w-]{22})/);
  if (m) return m[1];
  return null;
}

export default function ChannelModal({ channels, onAdd, onRemove, onClose }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd() {
    const channelId = extractChannelId(input);
    if (!channelId) {
      setError('Please enter a YouTube channel ID (starts with UC...) or a channel URL containing /channel/UC...');
      return;
    }
    if (channels.some(c => c.youtubeId === channelId)) {
      setError('This channel is already added.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=1`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.status !== 'ok') throw new Error('Could not fetch channel. Check the channel ID.');

      const name = data.feed?.title ?? 'Unknown Channel';
      onAdd({
        id: crypto.randomUUID(),
        name,
        youtubeId: channelId,
      });
      setInput('');
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch channel info.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Manage Channels</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-sm">&#x2715;</button>
        </div>

        {/* Add channel */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Channel</label>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Channel ID (UC...) or URL"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {loading ? '...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <p className="text-gray-400 text-xs mt-2">
            Find your channel ID in YouTube Studio &rarr; Settings &rarr; Channel &rarr; Advanced
          </p>
        </div>

        {/* Channel list */}
        {channels.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Channels</label>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {channels.map(ch => (
                <li key={ch.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-800 truncate pr-3">{ch.name}</span>
                  <button
                    onClick={() => onRemove(ch.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold shrink-0 transition-colors"
                  >Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {channels.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No channels yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
