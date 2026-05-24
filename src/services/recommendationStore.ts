import { computed, reactive, readonly, ref } from 'vue';

import { catalogLists, catalogMovies } from '@/data/catalog';
import { getNextAdditionalBatchIndex, primaryRatingMovies, ratingMovies } from '@/data/rating';
import {
  applyRatingToProfile,
  createEmptyUserPreferenceProfile,
  recommendLists,
  recommendMovies,
  type RatingInput
} from '@/services/movie_recommendation_algorithm';
import {
  localRecommendationRepository,
  remoteRecommendationRepository
} from '@/services/recommendationRepository';
import type {
  CatalogMovie,
  MoodContext,
  RatingFeedbackPayload,
  RatedCatalogMovieRecord,
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  RecommendationStateSnapshot,
  StoredRatingRecord
} from '@/types/recommendation';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const GENRE_NAME_TO_TMDB_ID: Record<string, number> = {
  ??: 28,
  ?????: 16,
  ??: 12,
  ???: 35,
  ???: 18,
  ??: 27,
  ????: 9648,
  ??: 9648,
  ???: 10749,
  ???: 53,
  SF: 878
};
const CONTEXT_WEIGHTS: Record<MoodContext, Record<number, number>> = {
  normal: {},
  after_exam: {
    28: 2.0,
    878: 1.8,
    35: 1.5,
    9648: 0.8,
    10749: 0.5
  },
  bed_time: {
    10749: 2.0,
    9648: 1.6,
    35: 1.0,
    878: 0.5,
    28: 0.2
  },
  with_friends: {
    35: 2.0,
    9648: 1.8,
    28: 1.3,
    878: 0.8,
    10749: 0.3
  },
  after_academy: {
    35: 2.0,
    28: 1.5,
    10749: 1.2,
    878: 0.6,
    9648: 0.1
  }
};

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie])) as Record<
  string,
  CatalogMovie
>;

const resolveGenreIds = (movie: CatalogMovie) => {
  if (movie.genreIds?.length) {
    return movie.genreIds;
  }

  return movie.genres
    .map((genre) => GENRE_NAME_TO_TMDB_ID[genre])
    .filter((genreId): genreId is number => typeof genreId === 'number');
};

const buildProfileFromRatings = (userId: string, ratings: StoredRatingRecord[]) =>
  ratings.reduce((profile, ratingRecord) => {
    const movie = movieMap[ratingRecord.input.movieId];

    if (!movie) {
      return profile;
    }

    return applyRatingToProfile(profile, movie, ratingRecord.input);
  }, createEmptyUserPreferenceProfile(userId));

const normalizeStoredRatings = (ratings: RecommendationStateSnapshot['ratings']) =>
  (ratings ?? []).map((rating) => ({
    rawDecision: rating.rawDecision ?? rating.input.status,
    detailCompleted: rating.detailCompleted ?? rating.input.status !== 'like',
    input: rating.input,
    questionText: rating.questionText ?? '',
    reviewText: rating.reviewText ?? ''
  }));

const loadSnapshot = (userId: string): RecommendationStateSnapshot => {
  const saved = localRecommendationRepository.load(userId);

  if (!saved) {
    return {
      userId,
      profile: createEmptyUserPreferenceProfile(userId),
      ratings: [],
      dismissedRecommendationMovieIds: []
    };
  }

  const normalizedRatings = normalizeStoredRatings(saved.ratings);

  return {
    userId,
    profile: buildProfileFromRatings(userId, normalizedRatings),
    ratings: normalizedRatings,
    dismissedRecommendationMovieIds: saved.dismissedRecommendationMovieIds ?? []
  };
};

const getAnsweredAtTime = (record: StoredRatingRecord) => {
  const timestamp = new Date(record.input.answeredAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const shouldReplaceRatingRecord = (current: StoredRatingRecord, candidate: StoredRatingRecord) => {
  const currentTime = getAnsweredAtTime(current);
  const candidateTime = getAnsweredAtTime(candidate);

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }

  if (candidate.detailCompleted !== current.detailCompleted) {
    return candidate.detailCompleted;
  }

  return false;
};

const mergeRatingRecords = (
  localRatings: readonly StoredRatingRecord[],
  remoteRatings: readonly StoredRatingRecord[]
) => {
  const mergedRatings = new Map<string, StoredRatingRecord>();

  for (const record of [...localRatings, ...remoteRatings]) {
    const existing = mergedRatings.get(record.input.movieId);

    if (!existing || shouldReplaceRatingRecord(existing, record)) {
      mergedRatings.set(record.input.movieId, record);
    }
  }

  return [...mergedRatings.values()].sort(
    (left, right) => getAnsweredAtTime(left) - getAnsweredAtTime(right)
  );
};

const mergeSnapshots = (
  localSnapshot: RecommendationStateSnapshot,
  remoteSnapshot: RecommendationStateSnapshot
): RecommendationStateSnapshot => {
  const mergedRatings = normalizeStoredRatings(
    mergeRatingRecords(localSnapshot.ratings, remoteSnapshot.ratings)
  );
  const dismissedRecommendationMovieIds = [
    ...new Set([
      ...localSnapshot.dismissedRecommendationMovieIds,
      ...remoteSnapshot.dismissedRecommendationMovieIds
    ])
  ];

  return {
    userId: localSnapshot.userId,
    profile: buildProfileFromRatings(localSnapshot.userId, mergedRatings),
    ratings: mergedRatings,
    dismissedRecommendationMovieIds
  };
};

const hasRatingRecordChanged = (left: StoredRatingRecord, right: StoredRatingRecord) =>
  left.rawDecision !== right.rawDecision ||
  left.detailCompleted !== right.detailCompleted ||
  left.input.status !== right.input.status ||
  left.input.rating !== right.input.rating ||
  left.input.favoriteCharacter !== right.input.favoriteCharacter ||
  left.input.answeredAt !== right.input.answeredAt ||
  left.reviewText !== right.reviewText ||
  left.questionText !== right.questionText ||
  left.input.reviewTags.length !== right.input.reviewTags.length ||
  left.input.reviewTags.some((tag, index) => tag !== right.input.reviewTags[index]);

const shouldResyncRemoteSnapshot = (
  remoteSnapshot: RecommendationStateSnapshot,
  mergedSnapshot: RecommendationStateSnapshot
) => {
  if (remoteSnapshot.ratings.length !== mergedSnapshot.ratings.length) {
    return true;
  }

  const remoteRatingsByMovieId = new Map(
    remoteSnapshot.ratings.map((record) => [record.input.movieId, record] as const)
  );

  for (const mergedRecord of mergedSnapshot.ratings) {
    const remoteRecord = remoteRatingsByMovieId.get(mergedRecord.input.movieId);

    if (!remoteRecord || hasRatingRecordChanged(remoteRecord, mergedRecord)) {
      return true;
    }
  }

  if (
    remoteSnapshot.dismissedRecommendationMovieIds.length !==
    mergedSnapshot.dismissedRecommendationMovieIds.length
  ) {
    return true;
  }

  const remoteDismissedIds = new Set(remoteSnapshot.dismissedRecommendationMovieIds);

  for (const movieId of mergedSnapshot.dismissedRecommendationMovieIds) {
    if (!remoteDismissedIds.has(movieId)) {
      return true;
    }
  }

  return false;
};

const initialSnapshot = loadSnapshot(FALLBACK_USER_ID);

const state = reactive<RecommendationStateSnapshot>({
  userId: initialSnapshot.userId,
  profile: initialSnapshot.profile,
  ratings: initialSnapshot.ratings,
  dismissedRecommendationMovieIds: initialSnapshot.dismissedRecommendationMovieIds
});

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');
const currentContext = ref<MoodContext>('normal');
let remoteSaveChain: Promise<void> = Promise.resolve();

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const applySnapshot = (snapshot: RecommendationStateSnapshot) => {
  state.userId = snapshot.userId;
  state.profile = snapshot.profile;
  state.ratings = snapshot.ratings;
  state.dismissedRecommendationMovieIds = snapshot.dismissedRecommendationMovieIds;
};

const runRemoteTask = async (task: () => Promise<void>, fallbackMessage: string) => {
  remoteSyncStatus.value = 'syncing';

  try {
    await task();
    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value = getErrorMessage(error, fallbackMessage);
    console.error('[recommendationStore] Supabase ratings sync failed.', error);
  }
};

const enqueueRemoteTask = (task: () => Promise<void>, fallbackMessage: string) => {
  remoteSaveChain = remoteSaveChain
    .catch(() => {
      // Previous failures already updated the error state.
    })
    .then(() => runRemoteTask(task, fallbackMessage));

  return remoteSaveChain;
};

const persistState = () => {
  const snapshot = {
    userId: state.userId,
    profile: state.profile,
    ratings: state.ratings,
    dismissedRecommendationMovieIds: state.dismissedRecommendationMovieIds
  };

  localRecommendationRepository.save(snapshot);
  remoteSyncErrorMessage.value = '';

  return enqueueRemoteTask(
    () => remoteRecommendationRepository.save(snapshot),
    '취향분석 결과를 Supabase ratings 테이블에 저장하지 못했어요.'
  );
};

const recomputeProfile = () => {
  state.profile = buildProfileFromRatings(state.userId, state.ratings);
};

const upsertRatingRecord = (record: StoredRatingRecord) => {
  const nextRatings = [...state.ratings];
  const existingIndex = nextRatings.findIndex((item) => item.input.movieId === record.input.movieId);

  if (existingIndex >= 0) {
    nextRatings.splice(existingIndex, 1, record);
  } else {
    nextRatings.push(record);
  }

  state.ratings = nextRatings;
  recomputeProfile();

  return persistState();
};

const ratedMovieIds = computed(() => state.ratings.map((rating) => rating.input.movieId));
const likedRatingRecords = computed(() => state.ratings.filter((rating) => rating.rawDecision === 'like'));
const pendingDetailedRatings = computed(() =>
  likedRatingRecords.value.filter((rating) => !rating.detailCompleted)
);
const primaryRatingMovieIds = new Set(primaryRatingMovies.map((movie) => movie.id));
const primaryUnratedMovies = computed(() =>
  primaryRatingMovies.filter((movie) => !ratedMovieIds.value.includes(movie.id))
);
const pendingPrimaryDetailedRatings = computed(() =>
  pendingDetailedRatings.value.filter((rating) => primaryRatingMovieIds.has(rating.input.movieId))
);
const nextAdditionalBatchIndex = computed(() => getNextAdditionalBatchIndex(ratedMovieIds.value));
const excludedRecommendationMovieIds = computed(() => [
  ...ratedMovieIds.value,
  ...state.dismissedRecommendationMovieIds
]);

const freshRecommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  const scoredMovies = recommendMovies(catalogMovies, state.profile, {
    excludeMovieIds: excludedRecommendationMovieIds.value,
    limit: 10
  });

  return scoredMovies.map((movie) => ({
    ...movieMap[movie.id],
    genreIds: resolveGenreIds(movieMap[movie.id]),
    recommendationScore: movie.recommendationScore
  }));
});

const rawRecommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  if (freshRecommendedMovies.value.length > 0) {
    return freshRecommendedMovies.value;
  }

  const scoredMovies = recommendMovies(catalogMovies, state.profile, {
    excludeMovieIds: state.dismissedRecommendationMovieIds,
    limit: 10
  });

  return scoredMovies.map((movie) => ({
    ...movieMap[movie.id],
    genreIds: resolveGenreIds(movieMap[movie.id]),
    recommendationScore: movie.recommendationScore
  }));
});

const isRecommendationFallbackMode = computed(
  () => freshRecommendedMovies.value.length === 0 && rawRecommendedMovies.value.length > 0
);

const recommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  const baseMovies = rawRecommendedMovies.value;
  const context = currentContext.value;

  if (context === 'normal') {
    return baseMovies;
  }

  const weights = CONTEXT_WEIGHTS[context];

  return [...baseMovies].sort((left, right) => {
    const leftGenreIds = left.genreIds?.length ? left.genreIds : resolveGenreIds(left);
    const rightGenreIds = right.genreIds?.length ? right.genreIds : resolveGenreIds(right);

    const leftMultiplier = leftGenreIds.reduce((maxWeight, genreId) => {
      const nextWeight = weights[genreId];
      return nextWeight ? Math.max(maxWeight, nextWeight) : maxWeight;
    }, 1);

    const rightMultiplier = rightGenreIds.reduce((maxWeight, genreId) => {
      const nextWeight = weights[genreId];
      return nextWeight ? Math.max(maxWeight, nextWeight) : maxWeight;
    }, 1);

    const leftScore = left.recommendationScore * leftMultiplier;
    const rightScore = right.recommendationScore * rightMultiplier;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.recommendationScore - left.recommendationScore;
  });
});

const recommendedLists = computed<RecommendedCatalogList[]>(() => {
  const scoredLists = recommendLists(catalogLists, catalogMovies, state.profile, 6);
  const listMap = Object.fromEntries(catalogLists.map((list) => [list.id, list])) as Record<
    string,
    (typeof catalogLists)[number]
  >;

  return scoredLists.map((list) => ({
    ...listMap[list.id],
    recommendationScore: list.recommendationScore,
    moviePreviews: list.movieIds
      .map((movieId) => movieMap[movieId])
      .filter((movie): movie is CatalogMovie => Boolean(movie))
      .slice(0, 3)
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        posterAlt: movie.posterAlt
      })),
    moviePreviewTitles: list.movieIds
      .map((movieId) => movieMap[movieId]?.title)
      .filter((title): title is string => Boolean(title))
      .slice(0, 3)
  }));
});

const ratedMoviesHistory = computed<RatedCatalogMovieRecord[]>(() =>
  [...state.ratings]
    .map((ratingRecord) => {
      const movie = movieMap[ratingRecord.input.movieId];

      if (!movie) {
        return null;
      }

      return {
        movie,
        ratingRecord
      };
    })
    .filter((entry): entry is RatedCatalogMovieRecord => Boolean(entry))
    .sort((left, right) => {
      const leftTime = new Date(left.ratingRecord.input.answeredAt).getTime();
      const rightTime = new Date(right.ratingRecord.input.answeredAt).getTime();

      return rightTime - leftTime;
    })
);

const getNextRatingMovie = () => {
  const ratedIds = new Set(ratedMovieIds.value);
  return ratingMovies.find((movie) => !ratedIds.has(movie.id)) ?? null;
};

const getPendingDetailMovie = () => {
  const pendingRecord = pendingDetailedRatings.value[0];

  if (!pendingRecord) {
    return null;
  }

  return movieMap[pendingRecord.input.movieId] ?? null;
};

const submitSwipeRating = (
  movie: CatalogMovie,
  input: RatingInput,
  options?: {
    rawDecision: StoredRatingRecord['rawDecision'];
    detailCompleted: boolean;
    feedback?: RatingFeedbackPayload;
  }
) =>
  upsertRatingRecord({
    rawDecision: options?.rawDecision ?? input.status,
    detailCompleted: options?.detailCompleted ?? input.status !== 'like',
    input,
    reviewText: options?.feedback?.reviewText ?? '',
    questionText: options?.feedback?.questionText ?? ''
  });

const dismissRecommendedMovie = (movieId: string) => {
  if (state.dismissedRecommendationMovieIds.includes(movieId)) {
    return Promise.resolve();
  }

  state.dismissedRecommendationMovieIds = [...state.dismissedRecommendationMovieIds, movieId];
  return persistState();
};

const setContext = (context: MoodContext) => {
  currentContext.value = context;
};

const resetDismissedRecommendations = () => {
  if (state.dismissedRecommendationMovieIds.length === 0) {
    return Promise.resolve();
  }

  state.dismissedRecommendationMovieIds = [];
  return persistState();
};

const resetTasteAnalysis = () => {
  state.profile = createEmptyUserPreferenceProfile(state.userId);
  state.ratings = [];
  state.dismissedRecommendationMovieIds = [];
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';
  localRecommendationRepository.clear(state.userId);

  void enqueueRemoteTask(
    () => remoteRecommendationRepository.clear(state.userId),
    '취향분석 초기화 내용을 Supabase ratings 테이블에 반영하지 못했어요.'
  );
};

const setActiveUser = async (userId: string) => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  const localSnapshot = loadSnapshot(normalizedUserId);
  applySnapshot(localSnapshot);
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const remoteSnapshot = await remoteRecommendationRepository.load(normalizedUserId);

    if (!remoteSnapshot) {
      return;
    }

    const normalizedRemoteSnapshot = {
      userId: normalizedUserId,
      profile: remoteSnapshot.profile,
      ratings: normalizeStoredRatings(remoteSnapshot.ratings),
      dismissedRecommendationMovieIds: remoteSnapshot.dismissedRecommendationMovieIds ?? []
    };
    const mergedSnapshot = mergeSnapshots(localSnapshot, normalizedRemoteSnapshot);

    applySnapshot(mergedSnapshot);
    localRecommendationRepository.save(mergedSnapshot);

    if (shouldResyncRemoteSnapshot(normalizedRemoteSnapshot, mergedSnapshot)) {
      void enqueueRemoteTask(
        () => remoteRecommendationRepository.save(mergedSnapshot),
        '최신 취향분석 결과를 Supabase ratings 테이블과 다시 맞추지 못했어요.'
      );
    }

    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value =
      'Supabase ratings 테이블에서 취향분석 기록을 불러오지 못했어요. 로컬에 저장된 기록은 그대로 사용할게요.';
    console.error('[recommendationStore] Failed to load ratings from Supabase.', error);
  }
};

export const recommendationStore = {
  state: readonly(state),
  catalogMovies,
  catalogLists,
  currentContext: readonly(currentContext),
  ratedMovieIds,
  pendingDetailedRatings,
  pendingPrimaryDetailedRatings,
  primaryUnratedMovies,
  nextAdditionalBatchIndex,
  shouldResumeTasteAnalysis: computed(() => primaryUnratedMovies.value.length > 0),
  ratedMoviesHistory,
  recommendedMovies,
  rawRecommendedMovies,
  isRecommendationFallbackMode,
  recommendedLists,
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  getNextRatingMovie,
  getPendingDetailMovie,
  setContext,
  submitSwipeRating,
  dismissRecommendedMovie,
  resetDismissedRecommendations,
  resetTasteAnalysis,
  setActiveUser
};

export const useRecommendationStore = () => recommendationStore;

