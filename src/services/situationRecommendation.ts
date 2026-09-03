import { RECOMMENDATION_SCORING_CONFIG } from '@/config/recommendationScoring';
import {
  getSituationPreset,
  moodRules,
  reasonRules,
  specialDayRules,
  type SituationRule,
  weatherRules
} from '@/data/situations';
import { trueStoryTmdbMovieIds } from '@/data/trueStories';
import {
  buildPeoplePreferenceModel,
  buildPersonalPreferenceModel,
  calculateFinalRecommendationScore,
  calculateNoveltyScore,
  calculatePeopleScore,
  calculatePersonalPreferenceScore,
  calculateSimilarUserScore,
  calculateTmdbQualityScore,
  clampRecommendationScore
} from '@/services/recommendationScoring';
import type {
  ActiveSituation,
  CatalogMovie,
  CollaborativeRecommendationSignal,
  RecommendationImpression,
  RecommendationScoreBreakdown,
  RecommendedCatalogMovie,
  SituationPresetId,
  SituationViewingTime,
  StoredRatingRecord
} from '@/types/recommendation';

interface SituationRankingOptions {
  activeSituation: ActiveSituation;
  catalogMovies: readonly CatalogMovie[];
  collaborativeSignals?: readonly CollaborativeRecommendationSignal[];
  encounteredMovieIds?: readonly string[];
  hasTasteProfile?: boolean;
  impressions?: readonly RecommendationImpression[];
  likedMovieIds?: readonly string[];
  movies: readonly RecommendedCatalogMovie[];
  ratings?: readonly StoredRatingRecord[];
}

interface RuleMatch {
  matched: boolean;
  score: number;
}

export interface SituationScore {
  isStrongMatch: boolean;
  reasons: string[];
  score: number;
}

interface RankedSituationMovie {
  index: number;
  movie: RecommendedCatalogMovie;
  qualityRawScore: number;
}

const normalizeText = (value: string) => value.trim().toLocaleLowerCase();

const isTrueStoryMovie = (movie: CatalogMovie) =>
  movie.contextTags?.includes('true_story') || trueStoryTmdbMovieIds.has(movie.tmdbMovieId);

const countMatchingTags = (movie: CatalogMovie, tags: readonly string[]) => {
  const movieTags = new Set(movie.tags);
  return tags.filter((tag) => movieTags.has(tag)).length;
};

const hasMatchingGenre = (movie: CatalogMovie, genreIds: readonly number[]) => {
  const movieGenreIds = new Set(movie.genreIds ?? []);
  return genreIds.some((genreId) => movieGenreIds.has(genreId));
};

const matchesConfiguredPreset = (movie: CatalogMovie, presetId: SituationPresetId) => {
  if (presetId === 'after_breakup') {
    return (
      hasMatchingGenre(movie, [28, 10749]) ||
      countMatchingTags(movie, ['감동', '여운']) >= 1
    );
  }

  if (presetId === 'offline_rest') {
    return (
      hasMatchingGenre(movie, [16, 18]) ||
      countMatchingTags(movie, ['영상미', '감성적인 음악', '여운']) >= 1
    );
  }

  if (presetId === 'before_travel') {
    return hasMatchingGenre(movie, [12]);
  }

  if (presetId === 'cleaning') {
    return hasMatchingGenre(movie, [35]);
  }

  if (presetId === 'before_confession') {
    return hasMatchingGenre(movie, [10749]);
  }

  if (presetId === 'winter_vibes') {
    return movie.contextTags?.includes('winter') === true;
  }

  if (presetId === 'sunday_night') {
    return (
      countMatchingTags(movie, ['감동', '여운', '감성적인 음악']) >= 1 &&
      !hasMatchingGenre(movie, [28, 53, 27, 80, 10752])
    );
  }

  return false;
};

/** 장르 일치 +2, 태그·키워드 일치 +1.5 규칙으로 한 상황 규칙의 0~100 일치율을 계산합니다. */
const getRuleMatch = (movie: CatalogMovie, rule: SituationRule): RuleMatch => {
  const config = RECOMMENDATION_SCORING_CONFIG.situation;
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
  const keywordRuleCount =
    (rule.tags?.length ?? 0) +
    (rule.contextTags?.length ?? 0) +
    (rule.textIncludes?.length ?? 0) +
    (rule.characterIncludes?.length ?? 0);
  const keywordMatches = tagMatches + contextTagMatches + textMatches + characterMatches;
  const maximumScore =
    (rule.genreIds?.length ?? 0) * config.genreMatchScore +
    keywordRuleCount * config.keywordMatchScore;
  const matchedScore =
    genreMatches * config.genreMatchScore + keywordMatches * config.keywordMatchScore;

  return {
    matched: matchedScore > 0,
    score:
      maximumScore > 0
        ? clampRecommendationScore((matchedScore / maximumScore) * 100)
        : 0
  };
};

const scopePresetCandidates = (
  candidates: readonly RecommendedCatalogMovie[],
  activeSituation: ActiveSituation
) => {
  if (activeSituation.kind !== 'preset') {
    return [...candidates];
  }

  return candidates.filter((movie) =>
    matchesConfiguredPreset(movie, activeSituation.presetId)
  );
};

const timeMatches = (movie: CatalogMovie, viewingTime: SituationViewingTime, expanded = false) => {
  const runtime = movie.runtimeMinutes;
  if (typeof runtime !== 'number' || runtime <= 0) return false;

  if (viewingTime === 'under_90') return runtime <= (expanded ? 105 : 90);
  if (viewingTime === 'around_120') {
    return runtime >= (expanded ? 76 : 91) && runtime <= (expanded ? 149 : 134);
  }
  return runtime >= (expanded ? 120 : 135);
};

/** 관람 시간은 가산점 대신 후보 필터로 적용하고, 후보가 없을 때만 범위를 완화합니다. */
const filterByViewingTime = (
  movies: readonly RecommendedCatalogMovie[],
  viewingTime: SituationViewingTime,
  collectionCounts: ReadonlyMap<number, number>
) => {
  if (viewingTime === 'any') return [...movies];

  if (viewingTime === 'series') {
    const seriesMovies = movies.filter(
      (movie) => movie.collectionId != null && (collectionCounts.get(movie.collectionId) ?? 0) >= 2
    );
    return seriesMovies.length > 0 ? seriesMovies : [...movies];
  }

  const strictMatches = movies.filter((movie) => timeMatches(movie, viewingTime));
  if (strictMatches.length > 0) return strictMatches;

  const expandedMatches = movies.filter((movie) => timeMatches(movie, viewingTime, true));
  return expandedMatches.length > 0 ? expandedMatches : [...movies];
};

const getManualSituationScore = (
  movie: CatalogMovie,
  activeSituation: Extract<ActiveSituation, { kind: 'manual' }>
): SituationScore => {
  const selection = activeSituation.selection;
  const importance = RECOMMENDATION_SCORING_CONFIG.situation.importance;
  const reasonCount = selection.reason?.length ?? 0;
  const categoryRules = [
    ...(selection.mood
      ? [{ label: '현재 기분', rule: moodRules[selection.mood], weight: importance.mood, isReason: false }]
      : []),
    ...(selection.weather
      ? [{ label: '오늘 날씨', rule: weatherRules[selection.weather], weight: importance.weather, isReason: false }]
      : []),
    ...(selection.specialDay
      ? [{ label: '특별한 날', rule: specialDayRules[selection.specialDay], weight: importance.specialDay, isReason: false }]
      : []),
    ...(selection.reason ?? []).map((reason) => ({
      label: '보고 싶은 이유',
      rule: reasonRules[reason],
      weight: importance.reason / Math.max(1, reasonCount),
      isReason: true
    }))
  ];
  const totalWeight = categoryRules.reduce((total, category) => total + category.weight, 0);
  const matches = categoryRules.map(({ label, rule, weight, isReason }) => ({
    label,
    weight: totalWeight > 0 ? weight / totalWeight : 0,
    isReason,
    ...getRuleMatch(movie, rule)
  }));

  return {
    isStrongMatch:
      matches.some((match) => match.isReason && match.matched) ||
      matches.filter((match) => match.matched).length >= 2,
    reasons: matches
      .filter((match) => match.matched)
      .sort((left, right) => right.weight - left.weight)
      .slice(0, 2)
      .map((match) => `선택한 ${match.label}과 잘 맞아요.`),
    score: clampRecommendationScore(
      matches.reduce((total, match) => total + match.score * match.weight, 0)
    )
  };
};

/** 직접 선택 또는 프리셋 상황을 영화 메타데이터와 비교해 0~100 상황 적합도를 반환합니다. */
export const calculateSituationScore = (
  movie: CatalogMovie,
  activeSituation: ActiveSituation
): SituationScore => {
  if (activeSituation.kind === 'manual') return getManualSituationScore(movie, activeSituation);

  if (activeSituation.kind === 'preset') {
    const preset = getSituationPreset(activeSituation.presetId);
    const match = preset ? getRuleMatch(movie, preset.rule) : { matched: false, score: 0 };
    return {
      isStrongMatch: match.matched,
      reasons: match.matched ? [`‘${preset?.label}’ 상황과 높은 일치도를 보여요.`] : [],
      score: match.score
    };
  }

  // 상황 배점은 최종 config에서 제거되므로 중립 원점수 100을 반환합니다.
  return { isStrongMatch: false, reasons: [], score: 100 };
};

const mergeReasons = (...reasonGroups: readonly string[][]) =>
  [...new Set(reasonGroups.flat().filter(Boolean))].slice(0, 6);

export const rankSituationMovies = ({
  activeSituation,
  catalogMovies,
  collaborativeSignals = [],
  encounteredMovieIds = [],
  impressions = [],
  movies,
  ratings = []
}: SituationRankingOptions): RecommendedCatalogMovie[] => {
  const collectionCounts = new Map<number, number>();
  for (const movie of catalogMovies) {
    if (movie.collectionId != null) {
      collectionCounts.set(movie.collectionId, (collectionCounts.get(movie.collectionId) ?? 0) + 1);
    }
  }

  const trueStoryOnly =
    activeSituation.kind === 'manual' && activeSituation.selection.reason?.includes('true_story');
  const situationCandidates = trueStoryOnly ? movies.filter(isTrueStoryMovie) : [...movies];
  const candidates =
    activeSituation.kind === 'manual' && activeSituation.selection.viewingTime
      ? filterByViewingTime(situationCandidates, activeSituation.selection.viewingTime, collectionCounts)
      : situationCandidates;
  const presetRule =
    activeSituation.kind === 'preset' ? getSituationPreset(activeSituation.presetId)?.rule : null;
  const explicitMovieIds = new Set(presetRule?.tmdbMovieIds ?? []);
  const presetCandidates =
    explicitMovieIds.size > 0
      ? candidates.filter((movie) => explicitMovieIds.has(movie.tmdbMovieId))
      : candidates;
  const fixedCatalogFallback =
    explicitMovieIds.size > 0
      ? catalogMovies
          .filter((movie) => explicitMovieIds.has(movie.tmdbMovieId))
          .map((movie) => ({ ...movie, genreIds: movie.genreIds ?? [], recommendationScore: 0 }))
      : [];
  const presetScopedCandidates =
    explicitMovieIds.size > 0 && presetCandidates.length === 0
      ? fixedCatalogFallback
      : presetCandidates;
  const scopedCandidates = scopePresetCandidates(presetScopedCandidates, activeSituation);
  const movieById = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie])) as Record<
    string,
    CatalogMovie
  >;
  const preferenceModel = buildPersonalPreferenceModel(ratings, movieById);
  const peopleModel = buildPeoplePreferenceModel(ratings);
  const collaborativeSignalByMovieId = new Map(
    collaborativeSignals.map((signal) => [signal.movieId, signal])
  );
  const hasSituation = activeSituation.kind !== 'none';
  const configuredPreset = activeSituation.kind === 'preset';
  const encounteredIds = new Set([
    ...encounteredMovieIds,
    ...impressions.map((impression) => impression.movieId)
  ]);

  const rankedMovies: RankedSituationMovie[] = scopedCandidates
    .map((movie, index) => {
      const personalPreference = configuredPreset
        ? { rawScore: 0, reasons: [] }
        : calculatePersonalPreferenceScore(movie, preferenceModel);
      const similarUser = configuredPreset
        ? { rawScore: 0, reasons: [] }
        : encounteredIds.has(movie.id)
          ? { rawScore: 0, reasons: [] }
          : calculateSimilarUserScore(movie.id, collaborativeSignalByMovieId);
      const baseSituation = calculateSituationScore(movie, activeSituation);
      const tmdbQuality = calculateTmdbQualityScore(movie);
      const novelty = configuredPreset
        ? { rawScore: 0, reasons: [] }
        : calculateNoveltyScore(movie.id, encounteredIds);
      const people = configuredPreset
        ? { rawScore: 0, reasons: [] }
        : calculatePeopleScore(movie, peopleModel);
      const rawScores: RecommendationScoreBreakdown = {
        personalPreference: personalPreference.rawScore,
        similarUser: similarUser.rawScore,
        situation: baseSituation.score,
        tmdbQuality: tmdbQuality.rawScore,
        novelty: novelty.rawScore,
        people: people.rawScore
      };
      const finalScore = calculateFinalRecommendationScore({
        configuredPreset,
        hasSituation,
        rawScores
      });
      const timeReason =
        activeSituation.kind === 'manual' &&
        activeSituation.selection.viewingTime &&
        activeSituation.selection.viewingTime !== 'any' &&
        typeof movie.runtimeMinutes === 'number'
          ? [`선택한 관람 시간에 맞는 ${movie.runtimeMinutes}분 영화예요.`]
          : [];
      return {
        index,
        qualityRawScore: tmdbQuality.rawScore,
        movie: {
          ...movie,
          recommendationReasons: mergeReasons(
            personalPreference.reasons,
            similarUser.reasons,
            baseSituation.reasons,
            timeReason,
            people.reasons,
            novelty.reasons,
            tmdbQuality.reasons
          ),
          recommendationScore: finalScore.finalScore,
          recommendationRawScores: rawScores,
          recommendationScoreBreakdown: finalScore.breakdown,
          recommendationScoreMaximums: finalScore.maximums
        }
      };
    })
    .sort((left, right) =>
      right.movie.recommendationScore - left.movie.recommendationScore ||
      right.qualityRawScore - left.qualityRawScore ||
      left.index - right.index
    );

  return rankedMovies.map(({ movie }) => movie);
};
