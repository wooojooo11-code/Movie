import { catalogMovies } from '@/data/catalog';

const primaryRatingMovieIds = [
  'movie_1',
  'movie_5',
  'movie_10',
  'movie_17',
  'movie_2',
  'movie_8',
  'movie_18',
  'movie_21',
  'movie_3',
  'movie_15',
  'movie_19',
  'movie_22',
  'movie_4',
  'movie_16',
  'movie_20',
  'movie_24'
];

const primaryIdSet = new Set(primaryRatingMovieIds);

export const primaryRatingMovies = primaryRatingMovieIds
  .map((movieId) => catalogMovies.find((movie) => movie.id === movieId))
  .filter((movie): movie is (typeof catalogMovies)[number] => Boolean(movie));

export const additionalRatingMovies = catalogMovies.filter((movie) => !primaryIdSet.has(movie.id));
export const ratingMovies = [...primaryRatingMovies, ...additionalRatingMovies];
export const initialTasteAnalysisCount = primaryRatingMovies.length;

export const getUnratedMoviesFromPool = (
  ratedMovieIds: readonly string[],
  pool: readonly (typeof catalogMovies)[number][]
) => {
  const ratedIdSet = new Set(ratedMovieIds);
  return pool.filter((movie) => !ratedIdSet.has(movie.id));
};

export const hasAdditionalTasteAnalysisMovies = (ratedMovieIds: readonly string[]) =>
  additionalRatingMovies.some((movie) => !ratedMovieIds.includes(movie.id));
