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
export const tasteAnalysisBatchSize = 16;

export const getUnratedMoviesFromPool = (
  ratedMovieIds: readonly string[],
  pool: readonly (typeof catalogMovies)[number][]
) => {
  const ratedIdSet = new Set(ratedMovieIds);
  return pool.filter((movie) => !ratedIdSet.has(movie.id));
};

export const getAdditionalBatchCount = () =>
  Math.ceil(additionalRatingMovies.length / tasteAnalysisBatchSize);

export const getAdditionalRatingBatchByIndex = (batchIndex: number) => {
  const safeBatchIndex = Math.max(0, batchIndex);
  const start = safeBatchIndex * tasteAnalysisBatchSize;
  return additionalRatingMovies.slice(start, start + tasteAnalysisBatchSize);
};

export const getUnratedMoviesFromAdditionalBatch = (
  ratedMovieIds: readonly string[],
  batchIndex: number
) => getUnratedMoviesFromPool(ratedMovieIds, getAdditionalRatingBatchByIndex(batchIndex));

export const getNextAdditionalBatchIndex = (ratedMovieIds: readonly string[]) => {
  const totalBatchCount = getAdditionalBatchCount();

  for (let index = 0; index < totalBatchCount; index += 1) {
    if (getUnratedMoviesFromAdditionalBatch(ratedMovieIds, index).length > 0) {
      return index;
    }
  }

  return null;
};

export const getFollowingAdditionalBatchIndex = (
  ratedMovieIds: readonly string[],
  currentBatchIndex: number
) => {
  const totalBatchCount = getAdditionalBatchCount();

  for (let index = currentBatchIndex + 1; index < totalBatchCount; index += 1) {
    if (getUnratedMoviesFromAdditionalBatch(ratedMovieIds, index).length > 0) {
      return index;
    }
  }

  return null;
};

export const hasAdditionalTasteAnalysisMovies = (ratedMovieIds: readonly string[]) =>
  getNextAdditionalBatchIndex(ratedMovieIds) !== null;
