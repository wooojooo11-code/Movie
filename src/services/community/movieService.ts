import type { CommunityMovieReference } from '@/types/community';

export interface CommunityMovieDetail extends CommunityMovieReference {
  overview: string;
  backdropPath: null | string;
  genres: string[];
  runtimeMinutes: null | number;
}

const assertMovieResponse = (value: unknown): CommunityMovieDetail => {
  if (!value || typeof value !== 'object') throw new Error('영화 정보를 읽지 못했습니다.');
  const movie = value as Partial<CommunityMovieDetail>;
  if (!Number.isInteger(movie.id) || !movie.title) throw new Error('영화 정보 형식이 올바르지 않습니다.');
  return {
    id: movie.id, title: movie.title, posterPath: typeof movie.posterPath === 'string' ? movie.posterPath : null,
    overview: typeof movie.overview === 'string' ? movie.overview : '', backdropPath: typeof movie.backdropPath === 'string' ? movie.backdropPath : null,
    genres: Array.isArray(movie.genres) ? movie.genres.filter((genre): genre is string => typeof genre === 'string') : [],
    runtimeMinutes: Number.isInteger(movie.runtimeMinutes) ? movie.runtimeMinutes : null,
    releaseYear: Number.isInteger(movie.releaseYear) ? movie.releaseYear : null
  };
};

export const searchCommunityMovies = async (query: string, signal?: AbortSignal): Promise<CommunityMovieReference[]> => {
  const response = await fetch(`/.netlify/functions/tmdb-search-movies?query=${encodeURIComponent(query.trim())}`, { signal });
  if (!response.ok) throw new Error('영화 검색에 실패했습니다.');
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error('영화 검색 결과 형식이 올바르지 않습니다.');
  return payload.filter((movie): movie is CommunityMovieReference => Boolean(movie && typeof movie === 'object' && Number.isInteger((movie as CommunityMovieReference).id) && typeof (movie as CommunityMovieReference).title === 'string'));
};

export const fetchCommunityMovieDetail = async (movieId: string | number, signal?: AbortSignal) => {
  const response = await fetch(`/.netlify/functions/tmdb-movie-detail?id=${encodeURIComponent(String(movieId))}`, { signal });
  if (!response.ok) throw new Error('영화 정보를 불러오지 못했습니다.');
  return assertMovieResponse(await response.json());
};
