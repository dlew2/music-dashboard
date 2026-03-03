import type { Video } from '../types';

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={video.link}
      target="_blank"
      rel="noreferrer"
      className="block group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {video.title}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">{timeAgo(video.pubDate)}</p>
        </div>
      </div>
    </a>
  );
}
