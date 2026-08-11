import type { CatalogMovie } from '@/types/recommendation';

export type LibraryMovieSource = 'want_to_watch';

export interface LibraryMovieRecord {
  movieId: string;
  rating: null | number;
  reviewText: string;
  savedAt: string;
  source: LibraryMovieSource;
}

export interface LibraryMovieDetails {
  rating: null | number;
  reviewText: string;
}

export interface LibraryStateSnapshot {
  movies: LibraryMovieRecord[];
  userId: string;
}

export interface ResolvedLibraryMovieRecord extends LibraryMovieRecord {
  movie: CatalogMovie;
}
