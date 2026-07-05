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

export const tasteAnalysisBatchSize = 20;
export const minTasteAnalysisGenreSelection = 3;
export const maxTasteAnalysisGenreSelection = 4;
export const tasteAnalysisLikeSelectionTarget = 3;
export const tasteAnalysisDislikeSelectionTarget = 3;

const tasteAnalysisGenreAliases: Record<TasteAnalysisGenre, readonly string[]> = {
  액션: ['액션'],
  애니메이션: ['애니메이션'],
  로맨스: ['로맨스'],
  코미디: ['코미디'],
  추리: ['추리', '미스터리'],
  SF: ['SF']
};

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

const buildPrioritizedTasteAnalysisSequence = (selectedGenres: readonly string[]) => {
  const normalizedGenres = normalizeTasteAnalysisGenres(selectedGenres);
  const effectiveGenres =
    normalizedGenres.length > 0 ? normalizedGenres : [...tasteAnalysisGenreOptions];

  const usedMovieIds = new Set<string>();
  const prioritizedMovies: RatingMovie[] = [];
  const genrePools = effectiveGenres.map((genre) =>
    catalogMovies.filter((movie) =>
      tasteAnalysisGenreAliases[genre].some((alias) => movie.genres.includes(alias))
    )
  );

  let appendedInPass = true;

  while (appendedInPass) {
    appendedInPass = false;

    for (const pool of genrePools) {
      const nextMovie = pool.find((movie) => !usedMovieIds.has(movie.id));

      if (!nextMovie) {
        continue;
      }

      prioritizedMovies.push(nextMovie);
      usedMovieIds.add(nextMovie.id);
      appendedInPass = true;
    }
  }

  const fallbackMovies = catalogMovies.filter((movie) => !usedMovieIds.has(movie.id));
  return [...prioritizedMovies, ...fallbackMovies];
};

const buildBatchFromSequence = (
  selectedGenres: readonly string[],
  excludedMovieIds: readonly string[] = []
) => {
  const excludedMovieIdSet = new Set(excludedMovieIds);

  return buildPrioritizedTasteAnalysisSequence(selectedGenres)
    .filter((movie) => !excludedMovieIdSet.has(movie.id))
    .slice(0, tasteAnalysisBatchSize);
};

export const getPrimaryRatingMovies = (selectedGenres: readonly string[]) =>
  buildBatchFromSequence(selectedGenres);

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
  buildBatchFromSequence(selectedGenres, [
    ...getPrimaryRatingMovies(selectedGenres).map((movie) => movie.id),
    ...ratedMovieIds,
    ...reservedMovieIds
  ]);
