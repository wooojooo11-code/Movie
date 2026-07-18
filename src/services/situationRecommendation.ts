import { getSituationPreset, manualSituationRule, type SituationRule } from '@/data/situations';
import type {
  ActiveSituation,
  CatalogMovie,
  RecommendedCatalogMovie,
  SituationViewingTime
} from '@/types/recommendation';

interface SituationRankingOptions {
  activeSituation: ActiveSituation;
  catalogMovies: readonly CatalogMovie[];
  hasTasteProfile: boolean;
  likedMovieIds: readonly string[];
  movies: readonly RecommendedCatalogMovie[];
}

interface RuleMatch {
  exactMatch: boolean;
  score: number;
}

const normalizeText = (value: string) => value.trim().toLocaleLowerCase();

const normalizeScores = (values: readonly number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return values.map(() => 0.5);
  }

  return values.map((value) => (value - min) / (max - min));
};

const getCatalogQuality = (movie: CatalogMovie, fallbackIndex: number, total: number) => {
  const voteAverage = movie.voteAverage ?? 0;
  const voteCount = movie.voteCount ?? 0;

  if (voteAverage > 0 && voteCount > 0) {
    return voteAverage * Math.log10(voteCount + 1);
  }

  return total - fallbackIndex;
};

const getRuleMatch = (movie: CatalogMovie, rule: SituationRule): RuleMatch => {
  const genreIds = new Set(movie.genreIds ?? []);
  const tags = new Set(movie.tags);
  const contextTags = new Set(movie.contextTags ?? []);
  const searchText = normalizeText(
    [movie.title, movie.overview, ...movie.characters].filter(Boolean).join(' ')
  );
  const characters = new Set(movie.characters.map(normalizeText));
  const matchedGenres = (rule.genreIds ?? []).filter((genreId) => genreIds.has(genreId)).length;
  const matchedTags = (rule.tags ?? []).filter((tag) => tags.has(tag)).length;
  const matchedContextTags = (rule.contextTags ?? []).filter((tag) => contextTags.has(tag)).length;
  const matchedText = (rule.textIncludes ?? []).filter((term) => searchText.includes(normalizeText(term)));
  const matchedCharacters = (rule.characterIncludes ?? []).filter((character) =>
    characters.has(normalizeText(character))
  );

  return {
    exactMatch: matchedText.length > 0 || matchedCharacters.length > 0,
    score:
      matchedGenres * 2 +
      matchedTags * 1.5 +
      matchedContextTags * 2.5 +
      matchedText.length * 6 +
      matchedCharacters.length * 8
  };
};

const timeMatches = (movie: CatalogMovie, viewingTime: SituationViewingTime, expanded = false) => {
  const runtime = movie.runtimeMinutes;

  if (typeof runtime !== 'number' || runtime <= 0) {
    return false;
  }

  if (viewingTime === 'under_90') {
    return runtime <= (expanded ? 105 : 90);
  }

  if (viewingTime === 'around_120') {
    return runtime >= (expanded ? 76 : 91) && runtime <= (expanded ? 149 : 134);
  }

  return runtime >= (expanded ? 120 : 135);
};

const filterByViewingTime = (
  movies: readonly RecommendedCatalogMovie[],
  viewingTime: SituationViewingTime,
  collectionCounts: ReadonlyMap<number, number>
) => {
  if (viewingTime === 'series') {
    const seriesMovies = movies.filter(
      (movie) => movie.collectionId != null && (collectionCounts.get(movie.collectionId) ?? 0) >= 2
    );

    return seriesMovies.length > 0 ? seriesMovies : [...movies];
  }

  const strictMatches = movies.filter((movie) => timeMatches(movie, viewingTime));

  if (strictMatches.length > 0) {
    return strictMatches;
  }

  const expandedMatches = movies.filter((movie) => timeMatches(movie, viewingTime, true));
  return expandedMatches.length > 0 ? expandedMatches : [...movies];
};

const getSituationRule = (activeSituation: ActiveSituation) => {
  if (activeSituation.kind === 'manual') {
    return manualSituationRule(activeSituation.selection);
  }

  if (activeSituation.kind === 'preset') {
    return getSituationPreset(activeSituation.presetId)?.rule ?? null;
  }

  return null;
};

export const rankSituationMovies = ({
  activeSituation,
  catalogMovies,
  hasTasteProfile,
  likedMovieIds,
  movies
}: SituationRankingOptions): RecommendedCatalogMovie[] => {
  const collectionCounts = new Map<number, number>();

  for (const movie of catalogMovies) {
    if (movie.collectionId != null) {
      collectionCounts.set(movie.collectionId, (collectionCounts.get(movie.collectionId) ?? 0) + 1);
    }
  }

  const likedCollectionIds = new Set(
    catalogMovies
      .filter((movie) => likedMovieIds.includes(movie.id) && movie.collectionId != null)
      .map((movie) => movie.collectionId as number)
  );
  const candidates =
    activeSituation.kind === 'manual'
      ? filterByViewingTime(movies, activeSituation.selection.viewingTime, collectionCounts)
      : [...movies];
  const rule = getSituationRule(activeSituation);
  const explicitMovieOrder = new Map((rule?.tmdbMovieIds ?? []).map((tmdbMovieId, index) => [tmdbMovieId, index]));
  const scopedCandidates =
    explicitMovieOrder.size > 0
      ? candidates.filter((movie) => explicitMovieOrder.has(movie.tmdbMovieId))
      : candidates;
  const tasteScores = normalizeScores(scopedCandidates.map((movie) => movie.recommendationScore));
  const qualityScores = normalizeScores(
    scopedCandidates.map((movie, index) => getCatalogQuality(movie, index, scopedCandidates.length))
  );
  const ruleMatches = scopedCandidates.map((movie) =>
    rule ? getRuleMatch(movie, rule) : { exactMatch: false, score: 0 }
  );
  const situationScores = normalizeScores(ruleMatches.map((match) => match.score));

  return scopedCandidates
    .map((movie, index) => {
      const collectionBoost =
        activeSituation.kind === 'manual' &&
        activeSituation.selection.viewingTime === 'series' &&
        movie.collectionId != null &&
        likedCollectionIds.has(movie.collectionId)
          ? 0.04
          : 0;
      const combinedScore = rule
        ? hasTasteProfile
          ? tasteScores[index] * 0.7 + situationScores[index] * 0.3 + collectionBoost
          : situationScores[index] * 0.8 + qualityScores[index] * 0.2 + collectionBoost
        : hasTasteProfile
          ? tasteScores[index]
          : qualityScores[index];

      return {
        movie: {
          ...movie,
          recommendationScore: combinedScore
        },
        exactMatch: ruleMatches[index].exactMatch,
        index
      };
    })
    .sort((left, right) => {
      if (explicitMovieOrder.size > 0) {
        return (explicitMovieOrder.get(left.movie.tmdbMovieId) ?? Infinity) -
          (explicitMovieOrder.get(right.movie.tmdbMovieId) ?? Infinity);
      }

      if (left.exactMatch !== right.exactMatch) {
        return left.exactMatch ? -1 : 1;
      }

      if (right.movie.recommendationScore !== left.movie.recommendationScore) {
        return right.movie.recommendationScore - left.movie.recommendationScore;
      }

      return left.index - right.index;
    })
    .map(({ movie }) => movie);
};
