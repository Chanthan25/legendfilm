export interface Drama {
  id: string;
  title: string;
  genre: string[];
  year: number;
  episodes: number;
  poster: string;
  summary: string;
  trailerUrl: string;
  rating: number;
  country: string;
  channel_id?: string;
  channel_name?: string;
  channel_avatar?: string;
  channel_subscribers?: string;
  created_at?: string;
  profiles?: any;
}

export interface Review {
  id: string;
  dramaId: string;
  drama_id?: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  likes: number;
  pros: string[];
  cons: string[];
  worthWatching: boolean;
  finalOpinion: string;
  profiles?: any;
}
