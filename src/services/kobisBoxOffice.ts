import { catalogMovies } from '@/data/catalog';
import type { TrendingMovie } from '@/types/home';

type KobisBoxOfficeMovie = {
  rank: number;
  movieCd: string;
  movieNm: string;
  audiCnt: number;
  audiAcc: number;
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

const normalizeMovieTitle = (title: string) => title.toLocaleLowerCase('ko-KR').replace(/[\s\W_]+/gu, '');

const catalogMovieByTitle = new Map(catalogMovies.map((movie) => [normalizeMovieTitle(movie.title), movie]));

const formatAudienceCount = (count: number) => new Intl.NumberFormat('ko-KR').format(count);

const formatBoxOfficeDate = (value: string) => {
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(4, 6)}.${value.slice(6, 8)}`;
};

const toTrendingMovie = (movie: KobisBoxOfficeMovie, boxOfficeDate: string): TrendingMovie => {
  const catalogMovie = catalogMovieByTitle.get(normalizeMovieTitle(movie.movieNm));
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
    posterUrl: catalogMovie?.posterUrl ?? fallbackPosterUrl,
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
        typeof movie.rank === 'number' &&
        typeof movie.movieCd === 'string' &&
        typeof movie.movieNm === 'string' &&
        typeof movie.audiCnt === 'number' &&
        typeof movie.audiAcc === 'number'
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
