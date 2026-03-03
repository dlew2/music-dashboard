import { useState, useEffect } from 'react';
import type { Channel, Video } from '../types';
import VideoCard from './VideoCard';
import ChannelModal from './ChannelModal';

const LS_KEY = 'music_dashboard_channels_v1';

function loadChannels(): Channel[] {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}

function saveChannels(channels: Channel[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(channels)); } catch {}
}

async function fetchVideos(channel: Channel): Promise<Video[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeId}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=3`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  if (data.status !== 'ok') return [];
  return (data.items ?? []).slice(0, 3).map((item: any) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    thumbnail: item.thumbnail ?? item.enclosure?.link ?? '',
    channelName: channel.name,
    channelId: channel.id,
  }));
}

export default function GuitarTeachers() {
  const [channels, setChannels] = useState<Channel[]>(loadChannels);
  const [videoMap, setVideoMap] = useState<Record<string, Video[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { saveChannels(channels); }, [channels]);

  useEffect(() => {
    channels.forEach(ch => {
      if (videoMap[ch.id]) return;
      setLoadingIds(s => new Set(s).add(ch.id));
      fetchVideos(ch).then(videos => {
        setVideoMap(m => ({ ...m, [ch.id]: videos }));
        setLoadingIds(s => { const n = new Set(s); n.delete(ch.id); return n; });
      }).catch(() => {
        setVideoMap(m => ({ ...m, [ch.id]: [] }));
        setLoadingIds(s => { const n = new Set(s); n.delete(ch.id); return n; });
      });
    });
  }, [channels]);

  function addChannel(ch: Channel) {
    setChannels(prev => [...prev, ch]);
  }

  function removeChannel(id: string) {
    setChannels(prev => prev.filter(c => c.id !== id));
    setVideoMap(m => { const n = { ...m }; delete n[id]; return n; });
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Guitar Teachers</h2>
          <p className="text-sm text-gray-400 mt-0.5">Latest videos from your channels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          Manage channels
        </button>
      </div>

      {channels.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">&#127928;</p>
          <p className="text-gray-500 text-sm font-medium">No channels yet</p>
          <p className="text-gray-400 text-sm mt-1">Add YouTube guitar teacher channels to see their latest videos</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >Add your first channel</button>
        </div>
      )}

      <div className="space-y-8">
        {channels.map(ch => (
          <div key={ch.id}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{ch.name}</h3>
            {loadingIds.has(ch.id) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0,1,2].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (videoMap[ch.id] ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No videos found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(videoMap[ch.id] ?? []).map((v, i) => <VideoCard key={i} video={v} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <ChannelModal
          channels={channels}
          onAdd={addChannel}
          onRemove={removeChannel}
          onClose={() => setShowModal(false)}
        />
      )}
    </section>
  );
}
