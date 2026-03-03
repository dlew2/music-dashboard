import GuitarTeachers from './components/GuitarTeachers';
import RssSection from './components/RssSection';
import DiscoveryPick from './components/DiscoveryPick';

const MUSIC_NEWS_FEEDS = [
  { name: 'Guitar World',   url: 'https://www.guitarworld.com/rss' },
  { name: 'Premier Guitar', url: 'https://www.premierguitar.com/feeds/feed.rss' },
  { name: 'Pitchfork',      url: 'https://pitchfork.com/feed/feed-news/rss/' },
];

const GEAR_RADAR_FEEDS = [
  { name: 'Guitar World',   url: 'https://www.guitarworld.com/feeds.xml' },
  { name: 'Premier Guitar', url: 'https://www.premierguitar.com/feeds/feed.rss' },
  { name: 'MusicRadar',     url: 'https://www.musicradar.com/feeds/news' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-gray-900">&#127928; Music Dashboard</span>
            <span className="text-xs font-semibold text-gray-400 hidden sm:block">Personal music intel</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-14">
        <GuitarTeachers />

        <RssSection
          title="Music News"
          subtitle="Latest music and guitar news from around the web"
          emoji="&#128240;"
          feeds={MUSIC_NEWS_FEEDS}
        />

        <RssSection
          title="Gear Radar"
          subtitle="New guitars, pedals, amps &amp; interfaces"
          emoji="&#127901;"
          feeds={GEAR_RADAR_FEEDS}
        />

        <DiscoveryPick />
      </main>

      <footer className="border-t border-gray-200 bg-white py-5 text-center">
        <span className="text-xs text-gray-400">Music Dashboard &middot; Built with Vite + React</span>
      </footer>
    </div>
  );
}
