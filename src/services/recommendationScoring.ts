import { RECOMMENDATION_SCORING_CONFIG, type RecommendationScoreWeights } from '@/config/recommendationScoring';
import { movieCreditsById } from '@/data/movieCredits';
import type {
  CatalogMovie,
  CollaborativeRecommendationSignal,
  RecommendationScoreBreakdown,
  StoredRatingRecord
} from '@/types/recommendation';

export interface ScoreResult {
  rawScore: number;
  reasons: string[];
}

interface GenrePreference {
  affinity: number;
  ratingAdjustmentAverage: number;
}

export interface PersonalPreferenceModel {
  genrePreferences: ReadonlyMap<string, GenrePreference>;
  mainGenres: readonly string[];
  preferredGenres: ReadonlySet<string>;
}

export interface PeoplePreferenceModel {
  dislikedActors: ReadonlySet<string>;
  favoriteActors: ReadonlySet<string>;
  favoriteDirectors: ReadonlySet<string>;
}

export interface FinalRecommendationScoreInput {
  configuredPreset?: boolean;
  hasSituation: boolean;
  rawScores: RecommendationScoreBreakdown;
}

export interface FinalRecommendationScoreResult {
  breakdown: RecommendationScoreBreakdown;
  finalScore: number;
  maximums: RecommendationScoreBreakdown;
}

const { scoreRange } = RECOMMENDATION_SCORING_CONFIG;

export const clampRecommendationScore = (value: number) =>
  Math.max(scoreRange.min, Math.min(scoreRange.max, Number.isFinite(value) ? value : scoreRange.min));

const normalizeName = (value: string) => value.trim().toLocaleLowerCase();

/** 별점을 요구사항의 -2~+2 구간 보정값으로 변환합니다. */
export const getPersonalRatingAdjustment = (rating: null | number) => {
  const adjustment = RECOMMENDATION_SCORING_CONFIG.personalPreference.ratingAdjustment;

  if (rating == null || rating < 0) return adjustment.neutral;
  if (rating <= 1.5) return adjustment.veryLow;
  if (rating <= 2.5) return adjustment.low;
  if (rating <= 3.5) return adjustment.neutral;
  if (rating <= 4.5) return adjustment.high;
  return adjustment.perfect;
};

/** 현재 평가 기록을 장르별 선호도와 상위 3개 메인 장르로 미리 집계합니다. */
export const buildPersonalPreferenceModel = (
  ratings: readonly StoredRatingRecord[],
  movieById: Readonly<Record<string, CatalogMovie>>
): PersonalPreferenceModel => {
  const affinityByGenre = new Map<string, number>();
  const ratingAdjustmentsByGenre = new Map<string, number[]>();
  const decisionAdjustment = RECOMMENDATION_SCORING_CONFIG.personalPreference.decisionAdjustment;

  for (const record of ratings) {
    if (record.input.status === 'not_seen') continue;
    const movie = movieById[record.input.movieId];
    if (!movie) continue;

    const ratingAdjustment = getPersonalRatingAdjustment(record.input.rating);
    const affinityAdjustment = decisionAdjustment[record.input.status] + ratingAdjustment;

    for (const genre of movie.genres) {
      affinityByGenre.set(genre, (affinityByGenre.get(genre) ?? 0) + affinityAdjustment);
      ratingAdjustmentsByGenre.set(genre, [
        ...(ratingAdjustmentsByGenre.get(genre) ?? []),
        ratingAdjustment
      ]);
    }
  }

  const genrePreferences = new Map<string, GenrePreference>();
  for (const [genre, affinity] of affinityByGenre) {
    const adjustments = ratingAdjustmentsByGenre.get(genre) ?? [];
    genrePreferences.set(genre, {
      affinity,
      ratingAdjustmentAverage:
        adjustments.length > 0
          ? adjustments.reduce((total, value) => total + value, 0) / adjustments.length
          : 0
    });
  }

  const preferredGenres = new Set(
    [...genrePreferences]
      .filter(([, preference]) => preference.affinity > 0)
      .map(([genre]) => genre)
  );
  const mainGenres = [...preferredGenres]
    .sort(
      (left, right) =>
        (genrePreferences.get(right)?.affinity ?? 0) - (genrePreferences.get(left)?.affinity ?? 0) ||
        left.localeCompare(right, 'ko-KR')
    )
    .slice(0, RECOMMENDATION_SCORING_CONFIG.personalPreference.mainGenreCount);

  return { genrePreferences, mainGenres, preferredGenres };
};

/** 기본 70점에 메인/일반 선호 장르 일치와 해당 장르의 별점 보정을 합산합니다. */
export const calculatePersonalPreferenceScore = (
  movie: CatalogMovie,
  model: PersonalPreferenceModel
): ScoreResult => {
  const config = RECOMMENDATION_SCORING_CONFIG.personalPreference;
  const mainGenreSet = new Set(model.mainGenres);
  let rawScore = config.baseScore;
  const mainMatches: string[] = [];
  const preferredMatches: string[] = [];

  for (const genre of new Set(movie.genres)) {
    if (mainGenreSet.has(genre)) {
      rawScore += config.mainGenreMatchScore;
      mainMatches.push(genre);
    } else if (model.preferredGenres.has(genre)) {
      rawScore += config.preferredGenreMatchScore;
      preferredMatches.push(genre);
    }

    rawScore += model.genrePreferences.get(genre)?.ratingAdjustmentAverage ?? 0;
  }

  const reasons = [
    ...(mainMatches.length > 0 ? [`메인 선호 장르 ${mainMatches.join('·')}와 일치해요.`] : []),
    ...(preferredMatches.length > 0 ? [`선호 장르 ${preferredMatches.join('·')}와 일치해요.`] : [])
  ];

  return { rawScore: clampRecommendationScore(rawScore), reasons };
};

/** Supabase가 집계한 후보별 유사 사용자 원점수를 0~100 범위로 제한합니다. */
export const calculateSimilarUserScore = (
  movieId: string,
  signalByMovieId: ReadonlyMap<string, CollaborativeRecommendationSignal>
): ScoreResult => {
  const signal = signalByMovieId.get(movieId);
  if (!signal) {
    return {
      rawScore: RECOMMENDATION_SCORING_CONFIG.similarUser.noSignalScore,
      reasons: []
    };
  }

  return {
    rawScore: clampRecommendationScore(signal.score),
    reasons: [
      `취향이 비슷한 사용자 ${signal.similarUserCount}명이 좋아한 영화예요.`
    ]
  };
};

/** TMDB 평균 평점과 최대 4,000개의 평가 수를 사용해 품질 원점수를 계산합니다. */
export const calculateTmdbQualityScore = (movie: CatalogMovie): ScoreResult => {
  const config = RECOMMENDATION_SCORING_CONFIG.tmdbQuality;
  const voteAverage = Math.max(0, movie.voteAverage ?? 0);
  const voteCount = Math.max(0, movie.voteCount ?? 0);
  const voteCountAdjustment =
    (Math.min(voteCount, config.maximumVoteCount) / config.maximumVoteCount) *
    config.maximumVoteCountAdjustment;
  const rawScore = clampRecommendationScore(config.baseScore + voteAverage + voteCountAdjustment);

  return {
    rawScore,
    reasons:
      rawScore >= config.highQualityReasonThreshold
        ? ['TMDB 이용자 평가가 높은 영화예요.']
        : []
  };
};

/** 평가·보관함·리스트·기존 노출 기록이 없는 영화에만 새로움 100점을 부여합니다. */
export const calculateNoveltyScore = (
  movieId: string,
  encounteredMovieIds: ReadonlySet<string>
): ScoreResult => {
  const isNew = !encounteredMovieIds.has(movieId);
  return {
    rawScore: isNew
      ? RECOMMENDATION_SCORING_CONFIG.novelty.newMovieScore
      : RECOMMENDATION_SCORING_CONFIG.novelty.encounteredMovieScore,
    reasons: isNew ? ['아직 평가하거나 저장하지 않은 새로운 영화예요.'] : []
  };
};

const getActorsForSelectedCharacters = (movieId: string, characters: readonly string[]) => {
  const credits = movieCreditsById[movieId];
  if (!credits) return [];

  return characters
    .map((character) => {
      const index = credits.characters.indexOf(character);
      return index >= 0 ? credits.cast[index] : null;
    })
    .filter((actor): actor is string => Boolean(actor));
};

/** 좋아요/싫어요 상세평가에서 선호 감독·배우와 아쉬웠던 배우를 집계합니다. */
export const buildPeoplePreferenceModel = (
  ratings: readonly StoredRatingRecord[]
): PeoplePreferenceModel => {
  const directorCounts = new Map<string, number>();
  const actorCounts = new Map<string, number>();
  const dislikedActorCounts = new Map<string, number>();

  for (const record of ratings) {
    const credits = movieCreditsById[record.input.movieId];
    if (!credits) continue;
    const isLiked = record.rawDecision === 'like' || record.input.status === 'like';
    const isDisliked = record.rawDecision === 'dislike' || record.input.status === 'dislike';

    if (isLiked && credits.director) {
      const director = normalizeName(credits.director);
      directorCounts.set(director, (directorCounts.get(director) ?? 0) + 1);
    }

    const selectedActors = getActorsForSelectedCharacters(
      record.input.movieId,
      record.input.favoriteCharacters
    ).map(normalizeName);
    const targetCounts = isLiked ? actorCounts : isDisliked ? dislikedActorCounts : null;
    if (!targetCounts) continue;

    for (const actor of selectedActors) {
      targetCounts.set(actor, (targetCounts.get(actor) ?? 0) + 1);
    }
  }

  return {
    favoriteDirectors: new Set([...directorCounts].filter(([, count]) => count > 0).map(([name]) => name)),
    favoriteActors: new Set([...actorCounts].filter(([, count]) => count > 0).map(([name]) => name)),
    dislikedActors: new Set(
      [...dislikedActorCounts].filter(([, count]) => count > 0).map(([name]) => name)
    )
  };
};

/** 감독 일치 +10, 선호 주연 배우 +2, 아쉬웠던 주연 배우 -2 규칙을 적용합니다. */
export const calculatePeopleScore = (
  movie: CatalogMovie,
  model: PeoplePreferenceModel
): ScoreResult => {
  const config = RECOMMENDATION_SCORING_CONFIG.people;
  const credits = movieCreditsById[movie.id];
  let rawScore = config.baseScore;
  const reasons: string[] = [];

  if (credits?.director && model.favoriteDirectors.has(normalizeName(credits.director))) {
    rawScore += config.directorMatchScore;
    reasons.push(`좋아하는 감독 ${credits.director}의 작품이에요.`);
  }

  const leadActors = (credits?.cast ?? []).slice(0, config.leadCastLimit);
  const likedActors = leadActors.filter((actor) => model.favoriteActors.has(normalizeName(actor)));
  const dislikedActors = leadActors.filter((actor) => model.dislikedActors.has(normalizeName(actor)));
  rawScore += likedActors.length * config.likedActorMatchScore;
  rawScore += dislikedActors.length * config.dislikedActorMatchScore;

  if (likedActors.length > 0) {
    reasons.push(`좋아하는 배우 ${likedActors.slice(0, 2).join('·')}가 출연해요.`);
  }

  return { rawScore: clampRecommendationScore(rawScore), reasons };
};

const scaleRawScore = (rawScore: number, maximum: number) =>
  clampRecommendationScore(rawScore) * maximum / scoreRange.max;

/** 상황 유무에 맞는 config 배점을 선택해 여섯 원점수를 정확히 100점 만점으로 합산합니다. */
export const calculateFinalRecommendationScore = ({
  configuredPreset = false,
  hasSituation,
  rawScores
}: FinalRecommendationScoreInput): FinalRecommendationScoreResult => {
  const weights: RecommendationScoreWeights = configuredPreset
    ? RECOMMENDATION_SCORING_CONFIG.weights.configuredPreset
    : hasSituation
      ? RECOMMENDATION_SCORING_CONFIG.weights.withSituation
      : RECOMMENDATION_SCORING_CONFIG.weights.withoutSituation;
  const maximums: RecommendationScoreBreakdown = { ...weights };
  const breakdown: RecommendationScoreBreakdown = {
    personalPreference: scaleRawScore(rawScores.personalPreference, weights.personalPreference),
    similarUser: scaleRawScore(rawScores.similarUser, weights.similarUser),
    situation: scaleRawScore(rawScores.situation, weights.situation),
    tmdbQuality: scaleRawScore(rawScores.tmdbQuality, weights.tmdbQuality),
    novelty: scaleRawScore(rawScores.novelty, weights.novelty),
    people: scaleRawScore(rawScores.people, weights.people)
  };
  const finalScore = clampRecommendationScore(
    Object.values(breakdown).reduce((total, value) => total + value, 0)
  );

  return { breakdown, finalScore, maximums };
};
