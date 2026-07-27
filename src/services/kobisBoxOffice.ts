import { catalogMovies } from '@/data/catalog';
import type { TrendingMovie } from '@/types/home';

type KobisBoxOfficeMovie = {
  rank: number;
  movieCd: string;
  movieNm: string;
  openDt: null | string;
  audiCnt: number;
  audiAcc: number;
  posterUrl: null | string;
};

type KobisBoxOfficeResponse = {
  boxOfficeDate: string;
  movies: KobisBoxOfficeMovie[];
};

const KOBIS_BOX_OFFICE_ENDPOINT = '/.netlify/functions/kobis-boxoffice';

const fallbackPosterUrl = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img" aria-label="Movie poster placeholder">
    <rect width="400" height="500" fill="#e9e8e4"/>
    <rect x="28" y="28" width="344" height="444" fill="#f7f6f2" stroke="#cbc9c1" stroke-width="2"/>
    <path d="M110 184h180v132H110z" fill="#15171c"/>
    <path d="m134 208 50 42-50 42zm82 0 50 42-50 42z" fill="#ffffff"/>
    <text x="200" y="364" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#15171c">KOBIS</text>
    <text x="200" y="396" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#686b73">BOX OFFICE</text>
  </svg>
`)}`;

const normalizeMovieTitle = (title: string) => title.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '');

const createCatalogMovieIndex = (movies: typeof catalogMovies) =>
  movies.reduce((index, movie) => {
    const title = normalizeMovieTitle(movie.title);
    index.set(title, [...(index.get(title) ?? []), movie]);
    return index;
  }, new Map<string, typeof catalogMovies>());

const catalogMoviesByTitle = createCatalogMovieIndex(catalogMovies);

const formatAudienceCount = (count: number) => new Intl.NumberFormat('ko-KR').format(count);

const formatBoxOfficeDate = (value: string) => {
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(4, 6)}.${value.slice(6, 8)}`;
};

const getReleaseYear = (releaseDate: null | string) => {
  const match = typeof releaseDate === 'string' ? /^(\d{4})-\d{2}-\d{2}$/.exec(releaseDate) : null;
  return match ? Number(match[1]) : null;
};

const findCatalogMovie = (movie: KobisBoxOfficeMovie) => {
  const candidates = catalogMoviesByTitle.get(normalizeMovieTitle(movie.movieNm)) ?? [];

  if (candidates.length === 1) {
    return candidates[0];
  }

  const releaseYear = getReleaseYear(movie.openDt);
  const sameYearCandidates = releaseYear ? candidates.filter((candidate) => candidate.releaseYear === releaseYear) : [];

  return sameYearCandidates.length === 1 ? sameYearCandidates[0] : null;
};

const toTrendingMovie = (movie: KobisBoxOfficeMovie, boxOfficeDate: string): TrendingMovie => {
  const catalogMovie = findCatalogMovie(movie);
  const rating = catalogMovie?.voteAverage;

  return {
    id: `kobis-daily-${movie.movieCd}`,
    rank: movie.rank,
    title: movie.movieNm,
    audienceLabel: `일일 관객 ${formatAudienceCount(movie.audiCnt)}명 · 누적 ${formatAudienceCount(movie.audiAcc)}명`,
    sourceLabel: `KOBIS 일별 박스오피스 (${formatBoxOfficeDate(boxOfficeDate)})`,
    genres: catalogMovie?.genres ?? [],
    cast: [],
    rating: typeof rating === 'number' ? Math.round(rating * 10) / 10 : null,
    posterUrl: movie.posterUrl ?? catalogMovie?.posterUrl ?? fallbackPosterUrl,
    posterAlt: `${movie.movieNm} 포스터`,
    similarMovies: []
  };
};

const isKobisBoxOfficeResponse = (value: unknown): value is KobisBoxOfficeResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<KobisBoxOfficeResponse>;

  return (
    typeof response.boxOfficeDate === 'string' &&
    Array.isArray(response.movies) &&
    response.movies.every(
      (movie) =>
        movie &&
        Number.isFinite(movie.rank) &&
        typeof movie.movieCd === 'string' &&
        typeof movie.movieNm === 'string' &&
        (typeof movie.openDt === 'string' || movie.openDt === null) &&
        Number.isFinite(movie.audiCnt) &&
        Number.isFinite(movie.audiAcc) &&
        (typeof movie.posterUrl === 'string' || movie.posterUrl === null)
    )
  );
};

export const loadKobisBoxOfficeMovies = async (): Promise<TrendingMovie[]> => {
  const response = await fetch(KOBIS_BOX_OFFICE_ENDPOINT, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`KOBIS box office request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  if (!isKobisBoxOfficeResponse(payload) || payload.movies.length === 0) {
    throw new Error('KOBIS box office response is invalid.');
  }

  return payload.movies.map((movie) => toTrendingMovie(movie, payload.boxOfficeDate));
};
