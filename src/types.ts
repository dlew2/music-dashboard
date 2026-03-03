export interface Channel {
  id: string;        // UUID
  name: string;      // Channel display name
  youtubeId: string; // YouTube channel ID (UC...)
}

export interface Video {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
}

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface DiscoveryItem {
  artist: string;
  album?: string;
  genre: string;
  why: string;
}
