export interface TrendingMovieSimilarPreview {
  id: string;
  title: string;
  posterUrl: string;
  posterAlt: string;
}

export interface TrendingMovie {
  id: string;
  rank: number;
  title: string;
  audienceLabel: string;
  sourceLabel: string;
  genres: string[];
  cast: string[];
  rating: number;
  posterUrl: string;
  posterAlt: string;
  similarMovies: TrendingMovieSimilarPreview[];
}

export interface PopularListMoviePreview {
  id: string;
  title: string;
  releaseYear: number;
  genres: string[];
  summaryTags: string[];
  posterUrl: string;
  posterAlt: string;
}

export interface PopularList {
  id: string;
  title: string;
  saveCount: number;
  averageRating: number;
  moviePreviews: PopularListMoviePreview[];
}
