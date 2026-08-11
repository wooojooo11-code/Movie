import { catalogMovies } from '@/data/catalog';
import type { CatalogMovie } from '@/types/recommendation';

export type LibraryMovieSearchMatch = 'actor' | 'director' | 'title';
export type LibraryMovieSearchSort = 'actor' | 'director' | 'latest' | 'rating' | 'title';

export interface LibraryMovieSearchResult {
  cast: readonly string[];
  director: null | string;
  matchedOn: readonly LibraryMovieSearchMatch[];
  movie: CatalogMovie;
}

const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase('ko-KR');
const compareText = (left: string, right: string) => left.localeCompare(right, 'ko-KR');
const compareOptionalText = (left: null | string, right: null | string) => {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return compareText(left, right);
};
const hasMatch = (result: LibraryMovieSearchResult, match: LibraryMovieSearchMatch) =>
  result.matchedOn.includes(match);
const compareMatchFirst = (
  left: LibraryMovieSearchResult,
  right: LibraryMovieSearchResult,
  match: LibraryMovieSearchMatch
) => Number(hasMatch(right, match)) - Number(hasMatch(left, match));
const compareByTitle = (left: LibraryMovieSearchResult, right: LibraryMovieSearchResult) =>
  compareText(left.movie.title, right.movie.title);
const getMovieVoteAverage = (movie: CatalogMovie) => movie.voteAverage ?? -1;
const getMovieVoteCount = (movie: CatalogMovie) => movie.voteCount ?? -1;

const sortLibraryMovieSearchResults = (
  results: LibraryMovieSearchResult[],
  sort: LibraryMovieSearchSort
) =>
  results.sort((left, right) => {
    if (sort === 'actor') {
      return (
        compareMatchFirst(left, right, 'actor') ||
        compareOptionalText(left.cast[0] ?? null, right.cast[0] ?? null) ||
        compareByTitle(left, right)
      );
    }

    if (sort === 'director') {
      return (
        compareMatchFirst(left, right, 'director') ||
        compareOptionalText(left.director, right.director) ||
        compareByTitle(left, right)
      );
    }

    if (sort === 'latest') {
      return (
        right.movie.releaseYear - left.movie.releaseYear ||
        getMovieVoteAverage(right.movie) - getMovieVoteAverage(left.movie) ||
        compareByTitle(left, right)
      );
    }

    if (sort === 'rating') {
      return (
        getMovieVoteAverage(right.movie) - getMovieVoteAverage(left.movie) ||
        getMovieVoteCount(right.movie) - getMovieVoteCount(left.movie) ||
        right.movie.releaseYear - left.movie.releaseYear ||
        compareByTitle(left, right)
      );
    }

    return compareMatchFirst(left, right, 'title') || compareByTitle(left, right);
  });

export const searchLibraryMovies = async (
  query: string,
  options: { limit?: number; sort?: LibraryMovieSearchSort } = {}
): Promise<LibraryMovieSearchResult[]> => {
  const { limit = 12, sort = 'title' } = options;
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  const { movieCreditsById } = await import('@/data/movieCredits');

  const results = catalogMovies
    .map((movie) => {
      const credits = movieCreditsById[movie.id];
      const cast = credits?.cast ?? [];
      const director = credits?.director ?? null;
      const matchedOn: LibraryMovieSearchMatch[] = [];

      if (normalizeSearchText(movie.title).includes(normalizedQuery)) {
        matchedOn.push('title');
      }

      if (director && normalizeSearchText(director).includes(normalizedQuery)) {
        matchedOn.push('director');
      }

      if (cast.some((actor) => normalizeSearchText(actor).includes(normalizedQuery))) {
        matchedOn.push('actor');
      }

      return {
        movie,
        director,
        cast,
        matchedOn
      };
    })
    .filter((result) => result.matchedOn.length > 0);

  return sortLibraryMovieSearchResults(results, sort).slice(0, limit);
};
