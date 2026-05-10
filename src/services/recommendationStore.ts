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
  RatingFeedbackPayload,
  RatedCatalogMovieRecord,
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  RecommendationStateSnapshot,
  StoredRatingRecord
} from '@/types/recommendation';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie])) as Record<
  string,
  CatalogMovie
>;

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
    detailCompleted:
      rating.detailCompleted ??
      (rating.input.status !== 'like' ||
        rating.input.rating != null ||
        rating.input.reviewTags.length > 0 ||
        Boolean(rating.input.favoriteCharacter)),
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

const initialSnapshot = loadSnapshot(FALLBACK_USER_ID);

const state = reactive<RecommendationStateSnapshot>({
  userId: initialSnapshot.userId,
  profile: initialSnapshot.profile,
  ratings: initialSnapshot.ratings,
  dismissedRecommendationMovieIds: initialSnapshot.dismissedRecommendationMovieIds
});

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');
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

const recommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  const scoredMovies = recommendMovies(catalogMovies, state.profile, {
    excludeMovieIds: excludedRecommendationMovieIds.value,
    limit: 10
  });

  return scoredMovies.map((movie) => ({
    ...movieMap[movie.id],
    recommendationScore: movie.recommendationScore
  }));
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
    return;
  }

  state.dismissedRecommendationMovieIds = [...state.dismissedRecommendationMovieIds, movieId];
  void persistState();
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
  applySnapshot(loadSnapshot(normalizedUserId));
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const remoteSnapshot = await remoteRecommendationRepository.load(normalizedUserId);

    if (!remoteSnapshot) {
      return;
    }

    const normalizedRatings = normalizeStoredRatings(remoteSnapshot.ratings);

    applySnapshot({
      userId: normalizedUserId,
      profile: buildProfileFromRatings(normalizedUserId, normalizedRatings),
      ratings: normalizedRatings,
      dismissedRecommendationMovieIds: state.dismissedRecommendationMovieIds
    });

    localRecommendationRepository.save({
      userId: normalizedUserId,
      profile: state.profile,
      ratings: state.ratings,
      dismissedRecommendationMovieIds: state.dismissedRecommendationMovieIds
    });
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
  ratedMovieIds,
  pendingDetailedRatings,
  pendingPrimaryDetailedRatings,
  primaryUnratedMovies,
  nextAdditionalBatchIndex,
  shouldResumeTasteAnalysis: computed(
    () => primaryUnratedMovies.value.length > 0 || pendingPrimaryDetailedRatings.value.length > 0
  ),
  ratedMoviesHistory,
  recommendedMovies,
  recommendedLists,
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  getNextRatingMovie,
  getPendingDetailMovie,
  submitSwipeRating,
  dismissRecommendedMovie,
  resetTasteAnalysis,
  setActiveUser
};

export const useRecommendationStore = () => recommendationStore;
