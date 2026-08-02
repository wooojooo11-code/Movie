import { catalogMovies } from '@/data/catalog';
import type { CommunityMovieReference } from '@/types/community';
import type { CatalogMovie } from '@/types/recommendation';

export interface CommunityMovieDetail extends CommunityMovieReference {
  overview: string;
  backdropPath: null | string;
  genres: string[];
  runtimeMinutes: null | number;
  watchProvidersKr: CatalogMovie['watchProvidersKr'];
}

/** 앱에 포함된 카탈로그 한 건을 커뮤니티에서 쓰는 가벼운 형태로 바꿉니다. */
const toMovieReference = (movie: (typeof catalogMovies)[number]): CommunityMovieReference => ({
  id: movie.id,
  title: movie.title,
  posterPath: movie.posterUrl,
  releaseYear: movie.releaseYear
});

const normalizeQuery = (value: string) => value.trim().toLocaleLowerCase('ko-KR');

const matchesQuery = (movie: (typeof catalogMovies)[number], query: string) => {
  const searchableText = [movie.title, ...movie.genres, ...movie.tags].join(' ').toLocaleLowerCase('ko-KR');
  return searchableText.includes(query);
};

/**
 * 커뮤니티는 외부 TMDB 검색을 호출하지 않습니다.
 * 앱에 저장된 영화 카탈로그만 검색하므로 추천·리스트 화면과 같은 영화 집합을 사용합니다.
 */
export const searchCommunityMovies = (query: string): CommunityMovieReference[] => {
  const normalizedQuery = normalizeQuery(query);
  if (normalizedQuery.length < 2) return [];

  return catalogMovies
    .filter((movie) => matchesQuery(movie, normalizedQuery))
    .slice(0, 20)
    .map(toMovieReference);
};

/**
 * 새 글은 카탈로그 ID(movie_*)로 찾습니다.
 * 이전 버전에서 저장된 숫자형 ID는 앱 카탈로그 안의 tmdbMovieId와만 대조해 읽기 호환을 유지합니다.
 */
export const getCommunityMovieDetail = (movieId: string): CommunityMovieDetail => {
  const movie = catalogMovies.find(
    (candidate) => candidate.id === movieId || String(candidate.tmdbMovieId) === movieId
  );

  if (!movie) {
    throw new Error('앱 영화 데이터에서 해당 영화를 찾지 못했습니다.');
  }

  return {
    ...toMovieReference(movie),
    overview: movie.overview,
    backdropPath: null,
    genres: movie.genres,
    runtimeMinutes: movie.runtimeMinutes ?? null,
    watchProvidersKr: movie.watchProvidersKr
  };
};
