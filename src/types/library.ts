import type { CatalogMovie } from '@/types/recommendation';

export type LibraryMovieSource = 'want_to_watch';

export interface LibraryMovieRecord {
  movieId: string;
  savedAt: string;
  source: LibraryMovieSource;
}

export interface LibraryStateSnapshot {
  movies: LibraryMovieRecord[];
  userId: string;
}

export interface ResolvedLibraryMovieRecord extends LibraryMovieRecord {
  movie: CatalogMovie;
}
