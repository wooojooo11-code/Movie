export interface TrendingMovie {
  id: string;
  rank: number;
  title: string;
  genre: string;
  averageRating: number;
  posterUrl: string;
  posterAlt: string;
}

export interface PopularList {
  id: string;
  title: string;
  saveCount: number;
  averageRating: number;
}
