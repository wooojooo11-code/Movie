import {
  companionRules,
  getSituationPreset,
  moodRules,
  reasonRules,
  specialDayRules,
  type SituationRule,
  weatherRules
} from '@/data/situations';
import type {
  ActiveSituation,
  CatalogMovie,
  RecommendationImpression,
  RecommendedCatalogMovie,
  SituationViewingTime
} from '@/types/recommendation';

interface SituationRankingOptions {
  activeSituation: ActiveSituation;
  catalogMovies: readonly CatalogMovie[];
  hasTasteProfile: boolean;
  impressions: readonly RecommendationImpression[];
  likedMovieIds: readonly string[];
  movies: readonly RecommendedCatalogMovie[];
}

interface RuleMatch {
  matched: boolean;
  score: number;
}

interface SituationScore {
  isStrongMatch: boolean;
  reasons: string[];
  score: number;
}

const HOUR_MS = 60 * 60 * 1000;
const RECENT_RECOMMENDATION_HOURS = 7 * 24;
const RECENT_RECOMMENDATION_EXCLUSION_HOURS = 14 * 24;
const RECOMMENDATION_RESULT_COUNT = 10;
const SITUATION_FIRST_RESULT_COUNT = 7;
const TASTE_SAFE_RESULT_COUNT = 8;
const TASTE_SAFE_SCORE = 40;
const MAX_MOVIES_PER_PRIMARY_GENRE = 2;

const clampScore = (value: number) => Math.max(0, Math.min(100, value));
const normalizeText = (value: string) => value.trim().toLocaleLowerCase();

const normalizeScores = (values: readonly number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return values.map(() => 50);
  }

  return values.map((value) => ((value - min) / (max - min)) * 100);
};

const getQualityScore = (movie: CatalogMovie) =>
  clampScore((movie.voteAverage ?? 0) * 7 + Math.min((movie.voteCount ?? 0) / 100, 30));

const getRuleMatch = (movie: CatalogMovie, rule: SituationRule): RuleMatch => {
  const genreIds = new Set(movie.genreIds ?? []);
  const tags = new Set(movie.tags);
  const contextTags = new Set(movie.contextTags ?? []);
  const searchText = normalizeText(
    [movie.title, movie.overview, ...movie.characters].filter(Boolean).join(' ')
  );
  const characters = new Set(movie.characters.map(normalizeText));
  const genreMatches = (rule.genreIds ?? []).filter((genreId) => genreIds.has(genreId)).length;
  const tagMatches = (rule.tags ?? []).filter((tag) => tags.has(tag)).length;
  const contextTagMatches = (rule.contextTags ?? []).filter((tag) => contextTags.has(tag)).length;
  const textMatches = (rule.textIncludes ?? []).filter((term) =>
    searchText.includes(normalizeText(term))
  ).length;
  const characterMatches = (rule.characterIncludes ?? []).filter((character) =>
    characters.has(normalizeText(character))
  ).length;
  const maximumScore =
    (rule.genreIds?.length ?? 0) * 2 +
    (rule.tags?.length ?? 0) * 1.5 +
    (rule.contextTags?.length ?? 0) * 2.5 +
    (rule.textIncludes?.length ?? 0) * 6 +
    (rule.characterIncludes?.length ?? 0) * 8;
  const rawScore =
    genreMatches * 2 +
    tagMatches * 1.5 +
    contextTagMatches * 2.5 +
    textMatches * 6 +
    characterMatches * 8;

  return {
    matched: rawScore > 0,
    score: maximumScore > 0 ? clampScore((rawScore / maximumScore) * 100) : 0
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
  if (viewingTime === 'any') {
    return [...movies];
  }

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

const getManualSituationScore = (movie: CatalogMovie, activeSituation: Extract<ActiveSituation, { kind: 'manual' }>) => {
  const selection = activeSituation.selection;
  const categoryRules = [
    { label: '현재 기분', rule: moodRules[selection.mood], weight: 0.2 },
    { label: '누구와 보는지', rule: companionRules[selection.companion], weight: 0.15 },
    { label: '오늘 날씨', rule: weatherRules[selection.weather], weight: 0.1 },
    { label: '특별한 날', rule: specialDayRules[selection.specialDay], weight: 0.2 },
    { label: '보고 싶은 이유', rule: reasonRules[selection.reason], weight: 0.35 }
  ];
  const matches = categoryRules.map(({ label, rule, weight }) => ({
    label,
    weight,
    ...getRuleMatch(movie, rule)
  }));

  return {
    isStrongMatch:
      matches.some((match) => match.weight === 0.35 && match.matched) ||
      matches.filter((match) => match.matched).length >= 2,
    reasons: matches
      .filter((match) => match.matched)
      .sort((left, right) => right.weight - left.weight)
      .slice(0, 2)
      .map((match) => `선택한 ${match.label}과 잘 맞아요.`),
    score: matches.reduce((total, match) => total + match.score * match.weight, 0)
  } satisfies SituationScore;
};

const getSituationScore = (movie: CatalogMovie, activeSituation: ActiveSituation): SituationScore => {
  if (activeSituation.kind === 'manual') {
    return getManualSituationScore(movie, activeSituation);
  }

  if (activeSituation.kind === 'preset') {
    const preset = getSituationPreset(activeSituation.presetId);
    const match = preset ? getRuleMatch(movie, preset.rule) : { matched: false, score: 0 };

    return {
      isStrongMatch: match.matched,
      reasons: match.matched ? [`‘${preset?.label}’ 상황에 잘 맞아요.`] : [],
      score: match.score
    };
  }

  return { isStrongMatch: false, reasons: [], score: 50 };
};

const getNoveltyScore = (
  movie: CatalogMovie,
  impressionByMovieId: ReadonlyMap<string, RecommendationImpression>,
  preferenceScore: number
) => {
  const impression = impressionByMovieId.get(movie.id);
  const now = Date.now();
  const elapsedHours = impression ? (now - new Date(impression.lastShownAt).getTime()) / HOUR_MS : Infinity;
  let noveltyScore = !impression ? 100 : elapsedHours <= RECENT_RECOMMENDATION_HOURS ? 60 : 70;

  if (preferenceScore >= 35 && preferenceScore <= 65) {
    noveltyScore += 5;
  }

  return clampScore(noveltyScore);
};

const getRecommendationReasons = (
  movie: CatalogMovie,
  preferenceScore: number,
  situation: SituationScore,
  qualityScore: number,
  activeSituation: ActiveSituation
) => {
  const reasons = [...situation.reasons];

  if (preferenceScore >= 60) {
    reasons.push('평소 좋아한 장르와 키워드에 가까워요.');
  }

  if (activeSituation.kind === 'manual' && typeof movie.runtimeMinutes === 'number') {
    reasons.push(`선택한 시간에 맞는 ${movie.runtimeMinutes}분 영화예요.`);
  }

  if (qualityScore >= 75) {
    reasons.push('TMDB 평점과 평가 수가 안정적인 영화예요.');
  }

  return [...new Set(reasons)].slice(0, 3);
};

interface RankedSituationMovie {
  index: number;
  movie: RecommendedCatalogMovie;
  preferenceScore: number;
  situation: SituationScore;
}

const isRecentlyRecommended = (
  movie: CatalogMovie,
  impressionByMovieId: ReadonlyMap<string, RecommendationImpression>
) => {
  const impression = impressionByMovieId.get(movie.id);

  if (!impression) {
    return false;
  }

  const elapsedHours = (Date.now() - new Date(impression.lastShownAt).getTime()) / HOUR_MS;
  return elapsedHours >= 0 && elapsedHours <= RECENT_RECOMMENDATION_EXCLUSION_HOURS;
};

const getPrimaryGenreKey = (movie: CatalogMovie) => {
  const genreId = movie.genreIds?.[0];

  if (genreId != null) {
    return `genre:${genreId}`;
  }

  return movie.genres[0] ? `genre:${movie.genres[0]}` : `movie:${movie.id}`;
};

const canAddDiverseMovie = (
  entry: RankedSituationMovie,
  selectedCollectionIds: ReadonlySet<number>,
  selectedGenreCounts: ReadonlyMap<string, number>
) => {
  const collectionIsNew =
    entry.movie.collectionId == null || !selectedCollectionIds.has(entry.movie.collectionId);
  const primaryGenreCount = selectedGenreCounts.get(getPrimaryGenreKey(entry.movie)) ?? 0;

  return collectionIsNew && primaryGenreCount < MAX_MOVIES_PER_PRIMARY_GENRE;
};

const addCandidate = (
  entry: RankedSituationMovie,
  selected: RankedSituationMovie[],
  selectedIds: Set<string>,
  selectedCollectionIds: Set<number>,
  selectedGenreCounts: Map<string, number>
) => {
  selected.push(entry);
  selectedIds.add(entry.movie.id);

  if (entry.movie.collectionId != null) {
    selectedCollectionIds.add(entry.movie.collectionId);
  }

  const genreKey = getPrimaryGenreKey(entry.movie);
  selectedGenreCounts.set(genreKey, (selectedGenreCounts.get(genreKey) ?? 0) + 1);
};

const addFromCandidateGroup = (
  candidates: readonly RankedSituationMovie[],
  targetCount: number,
  selected: RankedSituationMovie[],
  selectedIds: Set<string>,
  selectedCollectionIds: Set<number>,
  selectedGenreCounts: Map<string, number>,
  allowDiversityFallback = false
) => {
  while (selected.length < targetCount) {
    const availableCandidates = candidates.filter((entry) => !selectedIds.has(entry.movie.id));
    const nextCandidate = availableCandidates.find((entry) =>
      canAddDiverseMovie(entry, selectedCollectionIds, selectedGenreCounts)
    );
    const candidate = nextCandidate ?? (allowDiversityFallback ? availableCandidates[0] : undefined);

    if (!candidate) {
      return;
    }

    addCandidate(candidate, selected, selectedIds, selectedCollectionIds, selectedGenreCounts);
  }
};

const applySituationDiversity = (
  rankedMovies: readonly RankedSituationMovie[],
  hasTasteProfile: boolean,
  impressionByMovieId: ReadonlyMap<string, RecommendationImpression>
) => {
  const resultCount = Math.min(RECOMMENDATION_RESULT_COUNT, rankedMovies.length);
  const freshMovies = rankedMovies.filter((entry) => !isRecentlyRecommended(entry.movie, impressionByMovieId));
  const candidatePool = freshMovies.length >= resultCount ? freshMovies : rankedMovies;
  const tasteSafeMovies = hasTasteProfile
    ? candidatePool.filter((entry) => entry.preferenceScore >= TASTE_SAFE_SCORE)
    : candidatePool;
  const strongSituationMovies = tasteSafeMovies.filter((entry) => entry.situation.isStrongMatch);
  const relaxedSituationMovies = tasteSafeMovies.filter((entry) => entry.situation.score > 0);
  const selected: RankedSituationMovie[] = [];
  const selectedIds = new Set<string>();
  const selectedCollectionIds = new Set<number>();
  const selectedGenreCounts = new Map<string, number>();
  const situationFirstTarget = Math.min(SITUATION_FIRST_RESULT_COUNT, resultCount);
  const tasteSafeTarget = hasTasteProfile
    ? Math.min(TASTE_SAFE_RESULT_COUNT, resultCount)
    : resultCount;

  addFromCandidateGroup(
    strongSituationMovies,
    situationFirstTarget,
    selected,
    selectedIds,
    selectedCollectionIds,
    selectedGenreCounts
  );
  addFromCandidateGroup(
    relaxedSituationMovies,
    situationFirstTarget,
    selected,
    selectedIds,
    selectedCollectionIds,
    selectedGenreCounts
  );
  addFromCandidateGroup(
    tasteSafeMovies,
    tasteSafeTarget,
    selected,
    selectedIds,
    selectedCollectionIds,
    selectedGenreCounts
  );
  addFromCandidateGroup(
    candidatePool,
    resultCount,
    selected,
    selectedIds,
    selectedCollectionIds,
    selectedGenreCounts,
    true
  );

  return [...selected, ...rankedMovies.filter((entry) => !selectedIds.has(entry.movie.id))];
};

export const rankSituationMovies = ({
  activeSituation,
  catalogMovies,
  hasTasteProfile,
  impressions,
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
  const presetRule =
    activeSituation.kind === 'preset' ? getSituationPreset(activeSituation.presetId)?.rule : null;
  const explicitMovieOrder = new Map(
    (presetRule?.tmdbMovieIds ?? []).map((tmdbMovieId, index) => [tmdbMovieId, index])
  );
  const presetCandidates =
    explicitMovieOrder.size > 0
      ? candidates.filter((movie) => explicitMovieOrder.has(movie.tmdbMovieId))
      : candidates;
  const fixedCatalogFallback =
    explicitMovieOrder.size > 0
      ? catalogMovies
          .filter((movie) => explicitMovieOrder.has(movie.tmdbMovieId))
          .map((movie) => ({
            ...movie,
            genreIds: movie.genreIds ?? [],
            recommendationScore: 0
          }))
      : [];
  // Fixed presets intentionally return their configured franchise or movie set.
  const scopedCandidates =
    explicitMovieOrder.size > 0 && presetCandidates.length === 0 ? fixedCatalogFallback : presetCandidates;
  const preferenceScores = normalizeScores(scopedCandidates.map((movie) => movie.recommendationScore));
  const impressionByMovieId = new Map(impressions.map((impression) => [impression.movieId, impression]));
  const rankedMovies = scopedCandidates
    .map((movie, index) => {
      const preferenceScore = hasTasteProfile ? preferenceScores[index] : 0;
      const situation = getSituationScore(movie, activeSituation);
      const qualityScore = getQualityScore(movie);
      const noveltyScore = getNoveltyScore(movie, impressionByMovieId, preferenceScore);
      const collectionBoost =
        activeSituation.kind === 'manual' &&
        activeSituation.selection.viewingTime === 'series' &&
        movie.collectionId != null &&
        likedCollectionIds.has(movie.collectionId)
          ? 3
          : 0;
      const finalScore = hasTasteProfile
        ? preferenceScore * 0.45 + situation.score * 0.35 + qualityScore * 0.1 + noveltyScore * 0.1
        : situation.score * 0.65 + qualityScore * 0.15 + noveltyScore * 0.2;

      return {
        index,
        preferenceScore,
        situation,
        movie: {
          ...movie,
          recommendationReasons: getRecommendationReasons(
            movie,
            preferenceScore,
            situation,
            qualityScore,
            activeSituation
          ),
          recommendationScore: clampScore(finalScore + collectionBoost),
          recommendationScoreBreakdown: {
            preference: preferenceScore,
            situation: situation.score,
            quality: qualityScore,
            novelty: noveltyScore
          }
        }
      } satisfies RankedSituationMovie;
    })
    .sort((left, right) => {
      if (explicitMovieOrder.size > 0) {
        return (explicitMovieOrder.get(left.movie.tmdbMovieId) ?? Infinity) -
          (explicitMovieOrder.get(right.movie.tmdbMovieId) ?? Infinity);
      }

      if (right.movie.recommendationScore !== left.movie.recommendationScore) {
        return right.movie.recommendationScore - left.movie.recommendationScore;
      }

      return left.index - right.index;
    });

  const orderedMovies =
    activeSituation.kind === 'none' || explicitMovieOrder.size > 0
      ? rankedMovies
      : applySituationDiversity(rankedMovies, hasTasteProfile, impressionByMovieId);

  return orderedMovies.map(({ movie }) => movie);
};
