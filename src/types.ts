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

export interface NewsItem {
  title: string;
  summary: string;
  url?: string;
}

export interface GearItem {
  title: string;
  summary: string;
  url?: string;
}

export interface DiscoveryItem {
  artist: string;
  album?: string;
  genre: string;
  why: string;
}
