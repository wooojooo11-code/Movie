const KOBIS_TMDB_DETAIL_ENDPOINT = '/.netlify/functions/tmdb-kobis-detail';

export interface KobisTmdbDetail {
  cast: string[];
  genres: string[];
  overview: string;
  posterUrl: null | string;
  releaseYear: null | number;
  runtimeMinutes: null | number;
  tmdbMovieId: number;
}

const isDetail = (value: unknown): value is KobisTmdbDetail => {
  if (!value || typeof value !== 'object') return false;
  const detail = value as Partial<KobisTmdbDetail>;

  return (
    Number.isInteger(detail.tmdbMovieId) &&
    (detail.releaseYear === null || Number.isInteger(detail.releaseYear)) &&
    (detail.runtimeMinutes === null || Number.isFinite(detail.runtimeMinutes)) &&
    typeof detail.overview === 'string' &&
    Array.isArray(detail.genres) &&
    detail.genres.every((genre) => typeof genre === 'string') &&
    Array.isArray(detail.cast) &&
    detail.cast.every((actor) => typeof actor === 'string') &&
    (detail.posterUrl === null || typeof detail.posterUrl === 'string')
  );
};

export const loadKobisTmdbDetail = async (title: string, releaseYear: null | number) => {
  const url = new URL(KOBIS_TMDB_DETAIL_ENDPOINT, window.location.origin);
  url.searchParams.set('title', title);

  if (releaseYear) url.searchParams.set('year', String(releaseYear));

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TMDB KOBIS detail request failed with status ${response.status}.`);

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('matched' in payload)) {
    throw new Error('TMDB KOBIS detail response is invalid.');
  }

  const result = payload as { matched?: unknown; movie?: unknown };
  return result.matched === true && isDetail(result.movie) ? result.movie : null;
};
