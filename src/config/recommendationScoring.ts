export type RecommendationScoreKey =
  | 'personalPreference'
  | 'similarUser'
  | 'situation'
  | 'tmdbQuality'
  | 'novelty'
  | 'people';

export type RecommendationScoreWeights = Record<RecommendationScoreKey, number>;

export const RECOMMENDATION_SCORING_CONFIG = {
  scoreRange: {
    min: 0,
    max: 100
  },
  personalPreference: {
    baseScore: 70,
    mainGenreCount: 3,
    mainGenreMatchScore: 10,
    preferredGenreMatchScore: 2,
    decisionAdjustment: {
      like: 1,
      dislike: -1,
      not_seen: 0
    },
    ratingAdjustment: {
      veryLow: -2,
      low: -1,
      neutral: 0,
      high: 1,
      perfect: 2
    }
  },
  similarUser: {
    noSignalScore: 0
  },
  situation: {
    genreMatchScore: 2,
    keywordMatchScore: 1.5,
    importance: {
      mood: 20,
      weather: 10,
      specialDay: 20,
      reason: 50
    },
    communityBlend: 0.25
  },
  tmdbQuality: {
    baseScore: 50,
    maximumVoteCount: 4000,
    maximumVoteCountAdjustment: 40,
    highQualityReasonThreshold: 80
  },
  novelty: {
    newMovieScore: 100,
    encounteredMovieScore: 0
  },
  people: {
    baseScore: 80,
    directorMatchScore: 10,
    likedActorMatchScore: 2,
    dislikedActorMatchScore: -2,
    leadCastLimit: 5
  },
  weights: {
    withoutSituation: {
      personalPreference: 30,
      similarUser: 30,
      situation: 0,
      tmdbQuality: 20,
      novelty: 10,
      people: 10
    },
    withSituation: {
      personalPreference: 28,
      similarUser: 28,
      situation: 16,
      tmdbQuality: 16,
      novelty: 6,
      people: 6
    }
  } satisfies Record<'withSituation' | 'withoutSituation', RecommendationScoreWeights>
} as const;

