import { catalogMovies } from '@/data/catalog';

type RatingMovie = (typeof catalogMovies)[number];
type TasteAnalysisGenreGroupKey = 'action' | 'comedy' | 'mystery' | 'romance' | 'sf';

const ACTION_GENRE = '\uC561\uC158';
const COMEDY_GENRE = '\uCF54\uBBF8\uB514';
const MYSTERY_GENRE = '\uBBF8\uC2A4\uD130\uB9AC';
const ROMANCE_GENRE = '\uB85C\uB9E8\uC2A4';
const THRILLER_GENRE = '\uC2A4\uB9B4\uB7EC';

const genreDisplayOrder: TasteAnalysisGenreGroupKey[] = [
  'action',
  'mystery',
  'comedy',
  'romance',
  'sf'
];

// Assign scarcer groups first so later balanced batches stay possible.
const genreAssignmentOrder: TasteAnalysisGenreGroupKey[] = [
  'sf',
  'romance',
  'comedy',
  'action',
  'mystery'
];

const genreMatchers: Record<TasteAnalysisGenreGroupKey, (movie: RatingMovie) => boolean> = {
  action: (movie) => movie.genres.includes(ACTION_GENRE),
  comedy: (movie) => movie.genres.includes(COMEDY_GENRE),
  mystery: (movie) =>
    movie.genres.includes(MYSTERY_GENRE) || movie.genres.includes(THRILLER_GENRE),
  romance: (movie) => movie.genres.includes(ROMANCE_GENRE),
  sf: (movie) => movie.genres.includes('SF')
};

const createEmptyGroupedPools = (): Record<TasteAnalysisGenreGroupKey, RatingMovie[]> => ({
  action: [],
  comedy: [],
  mystery: [],
  romance: [],
  sf: []
});

const groupedRatingMoviePools = (() => {
  const groupedPools = createEmptyGroupedPools();
  const assignedMovieIds = new Set<string>();

  for (const groupKey of genreAssignmentOrder) {
    for (const movie of catalogMovies) {
      if (assignedMovieIds.has(movie.id) || !genreMatchers[groupKey](movie)) {
        continue;
      }

      groupedPools[groupKey].push(movie);
      assignedMovieIds.add(movie.id);
    }
  }

  return groupedPools;
})();

const genreQuotaPerBatch = 4;
const totalGenreGroupCount = genreDisplayOrder.length;
const balancedBatchCount = Math.min(
  ...genreDisplayOrder.map((groupKey) =>
    Math.floor(groupedRatingMoviePools[groupKey].length / genreQuotaPerBatch)
  )
);

const buildBatchAtIndex = (batchIndex: number) =>
  genreDisplayOrder.flatMap((groupKey) => {
    const start = batchIndex * genreQuotaPerBatch;
    return groupedRatingMoviePools[groupKey].slice(start, start + genreQuotaPerBatch);
  });

const ratingBatches = Array.from({ length: balancedBatchCount }, (_, batchIndex) =>
  buildBatchAtIndex(batchIndex)
).filter((batch) => batch.length === genreQuotaPerBatch * totalGenreGroupCount);

const additionalRatingBatches = ratingBatches.slice(1);

export const primaryRatingMovies = ratingBatches[0] ?? [];
export const ratingMovies = ratingBatches.flat();
export const initialTasteAnalysisCount = primaryRatingMovies.length;
export const tasteAnalysisBatchSize = genreQuotaPerBatch * totalGenreGroupCount;

export const getUnratedMoviesFromPool = (
  ratedMovieIds: readonly string[],
  pool: readonly RatingMovie[]
) => {
  const ratedIdSet = new Set(ratedMovieIds);
  return pool.filter((movie) => !ratedIdSet.has(movie.id));
};

export const getAdditionalBatchCount = () => additionalRatingBatches.length;

export const getAdditionalRatingBatchByIndex = (batchIndex: number) => {
  const safeBatchIndex = Math.max(0, batchIndex);
  return additionalRatingBatches[safeBatchIndex] ?? [];
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
