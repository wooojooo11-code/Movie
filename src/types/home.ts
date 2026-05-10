export interface TrendingMovie {
  id: string;
  rank: number;
  title: string;
  audienceLabel: string;
  sourceLabel: string;
  posterUrl: string;
  posterAlt: string;
}

export interface PopularList {
  id: string;
  title: string;
  saveCount: number;
  averageRating: number;
}
