import GuitarTeachers from './components/GuitarTeachers';
import ClaudeSection from './components/ClaudeSection';

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

        <ClaudeSection
          type="music-news"
          title="Music News"
          subtitle="Latest music and guitar news from around the web"
          emoji="&#128240;"
        />

        <ClaudeSection
          type="gear-radar"
          title="Gear Radar"
          subtitle="New guitars, pedals, amps &amp; interfaces"
          emoji="&#127901;"
        />

        <ClaudeSection
          type="discovery-pick"
          title="Discovery Pick"
          subtitle="Artists and albums worth your ears"
          emoji="&#10024;"
        />
      </main>

      <footer className="border-t border-gray-200 bg-white py-5 text-center">
        <span className="text-xs text-gray-400">Music Dashboard &middot; Powered by Claude &middot; Built with Vite + React</span>
      </footer>
    </div>
  );
}
