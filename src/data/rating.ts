import { catalogMovies } from '@/data/catalog';
import type { TasteAnalysisGenre } from '@/types/recommendation';

type RatingMovie = (typeof catalogMovies)[number];

export const tasteAnalysisGenreOptions: TasteAnalysisGenre[] = [
  '액션',
  '애니메이션',
  '로맨스',
  '코미디',
  '추리',
  'SF'
];

const tasteAnalysisBatchGenres = [
  { genreId: 28 },
  { genreId: 10749 },
  { genreId: 53 },
  { genreId: 878 },
  { genreId: 35 }
] as const;
const moviesPerTasteAnalysisGenre = 2;

export const tasteAnalysisBatchSize =
  tasteAnalysisBatchGenres.length * moviesPerTasteAnalysisGenre;
export const minTasteAnalysisGenreSelection = 3;
export const maxTasteAnalysisGenreSelection = 4;
export const tasteAnalysisLikeSelectionTarget = 3;
export const tasteAnalysisDislikeSelectionTarget = 3;

const tasteAnalysisGenreSet = new Set<TasteAnalysisGenre>(tasteAnalysisGenreOptions);

export const normalizeTasteAnalysisGenres = (
  selectedGenres: readonly string[]
): TasteAnalysisGenre[] => {
  const dedupedGenres = new Set<TasteAnalysisGenre>();

  for (const genre of selectedGenres) {
    if (tasteAnalysisGenreSet.has(genre as TasteAnalysisGenre)) {
      dedupedGenres.add(genre as TasteAnalysisGenre);
      continue;
    }

    if (genre === '미스터리') {
      dedupedGenres.add('추리');
    }
  }

  return tasteAnalysisGenreOptions
    .filter((genre) => dedupedGenres.has(genre))
    .slice(0, maxTasteAnalysisGenreSelection);
};

const buildTasteAnalysisBatch = (
  _selectedGenres: readonly string[],
  excludedMovieIds: readonly string[] = []
) => {
  const usedMovieIds = new Set(excludedMovieIds);
  const prioritizedMovies: RatingMovie[] = [];
  const genrePools = tasteAnalysisBatchGenres.map(({ genreId }) =>
    catalogMovies.filter((movie) => movie.genreIds?.includes(genreId))
  );
  for (const pool of genrePools) {
    let addedForGenre = 0;

    for (const movie of pool) {
      if (usedMovieIds.has(movie.id)) {
        continue;
      }

      prioritizedMovies.push(movie);
      usedMovieIds.add(movie.id);
      addedForGenre += 1;

      if (addedForGenre === moviesPerTasteAnalysisGenre) {
        break;
      }
    }
  }

  const fallbackMovies = catalogMovies.filter((movie) => !usedMovieIds.has(movie.id));
  return [...prioritizedMovies, ...fallbackMovies].slice(
    0,
    tasteAnalysisBatchSize
  );
};

export const getPrimaryRatingMovies = (selectedGenres: readonly string[]) =>
  buildTasteAnalysisBatch(selectedGenres);

export const getUnratedMoviesFromPool = (
  ratedMovieIds: readonly string[],
  pool: readonly RatingMovie[]
) => {
  const ratedIdSet = new Set(ratedMovieIds);
  return pool.filter((movie) => !ratedIdSet.has(movie.id));
};

export const hasAdditionalTasteAnalysisMovies = (
  selectedGenres: readonly string[],
  ratedMovieIds: readonly string[],
  reservedMovieIds: readonly string[] = []
) =>
  buildAdditionalTasteAnalysisBatch(selectedGenres, ratedMovieIds, reservedMovieIds).length > 0;

export const buildAdditionalTasteAnalysisBatch = (
  selectedGenres: readonly string[],
  ratedMovieIds: readonly string[],
  reservedMovieIds: readonly string[] = []
): RatingMovie[] =>
  buildTasteAnalysisBatch(selectedGenres, [
    ...getPrimaryRatingMovies(selectedGenres).map((movie) => movie.id),
    ...ratedMovieIds,
    ...reservedMovieIds
  ]);
