import { computed, reactive, readonly, ref } from 'vue';

import { catalogLists, catalogMovies } from '@/data/catalog';
import {
  buildAdditionalTasteAnalysisBatch,
  getPrimaryRatingMovies,
  maxTasteAnalysisGenreSelection,
  minTasteAnalysisGenreSelection,
  normalizeTasteAnalysisGenres
} from '@/data/rating';
import {
  applyRatingToProfile,
  createEmptyUserPreferenceProfile,
  recommendLists,
  recommendMovies,
  type RatingInput
} from '@/services/movie_recommendation_algorithm';
import {
  localRatingHistoryRepository,
  localRecommendationRepository,
  remoteRatingHistoryRepository,
  remoteRecommendationContextWeightsRepository,
  remoteRecommendationRepository
} from '@/services/recommendationRepository';
import type {
  AdditionalTasteAnalysisBatch,
  CatalogMovie,
  MoodContext,
  RecommendationContextWeights,
  RatingFeedbackPayload,
  RatedCatalogMovieRecord,
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  RecommendationStateSnapshot,
  StoredRatingRecord,
  TasteAnalysisGenre
} from '@/types/recommendation';
import { normalizeFavoriteCharacters } from '@/types/rating';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const GENRE_NAME_TO_TMDB_ID: Record<string, number> = {
  '액션': 28,
  '애니메이션': 16,
  '모험': 12,
  '코미디': 35,
  '드라마': 18,
  '공포': 27,
  '미스터리': 9648,
  '추리': 9648,
  '로맨스': 10749,
  '스릴러': 53,
  SF: 878
};
const DEFAULT_CONTEXT_WEIGHTS: RecommendationContextWeights = {
  normal: {},
  after_exam: {
    35: 1.5,
    28: 1.8,
    9648: 0.8,
    53: 0.8,
    10749: 0.5,
    878: 1.5
  },
  bed_time: {
    35: 1.0,
    28: 0.2,
    9648: 1.6,
    53: 1.6,
    10749: 2.0,
    878: 0.5
  },
  with_friends: {
    35: 2.0,
    28: 1.3,
    9648: 1.8,
    53: 1.8,
    10749: 0.3,
    878: 0.8
  },
  after_academy: {
    35: 2.0,
    28: 1.5,
    9648: 0.1,
    53: 0.1,
    10749: 1.2,
    878: 0.6
  }
};

const cloneDefaultContextWeights = (): RecommendationContextWeights => ({
  normal: { ...DEFAULT_CONTEXT_WEIGHTS.normal },
  after_exam: { ...DEFAULT_CONTEXT_WEIGHTS.after_exam },
  bed_time: { ...DEFAULT_CONTEXT_WEIGHTS.bed_time },
  with_friends: { ...DEFAULT_CONTEXT_WEIGHTS.with_friends },
  after_academy: { ...DEFAULT_CONTEXT_WEIGHTS.after_academy }
});

const mergeContextWeights = (
  remoteWeights: null | Partial<RecommendationContextWeights>
): RecommendationContextWeights => {
  const mergedWeights = cloneDefaultContextWeights();

  if (!remoteWeights) {
    return mergedWeights;
  }

  for (const context of Object.keys(mergedWeights) as MoodContext[]) {
    if (remoteWeights[context]) {
      mergedWeights[context] = {
        ...mergedWeights[context],
        ...remoteWeights[context]
      };
    }
  }

  return mergedWeights;
};

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie])) as Record<
  string,
  CatalogMovie
>;
const recommendationVisibleLimit = 10;
const recommendationPoolLimit = catalogMovies.length;

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

    return applyRatingToProfile(profile, movie, ratingRecord.input, {
      reviewText: ratingRecord.reviewText
    });
  }, createEmptyUserPreferenceProfile(userId));

const normalizeStoredRatings = (ratings: readonly StoredRatingRecord[] | undefined | null) =>
  (ratings ?? []).map((rating) => {
    const normalizedInput = rating.input as RatingInput & {
      favoriteCharacter?: null | string | string[];
      favoriteCharacters?: null | string | string[];
    };

    return {
      rawDecision: rating.rawDecision ?? rating.input.status,
      rawDirection: rating.rawDirection ?? null,
      detailCompleted: rating.detailCompleted ?? rating.input.status !== 'like',
      input: {
        ...rating.input,
        favoriteCharacters: normalizeFavoriteCharacters(
          normalizedInput.favoriteCharacters ?? normalizedInput.favoriteCharacter
        )
      },
      questionText: rating.questionText ?? '',
      reviewText: rating.reviewText ?? ''
    };
  });

const normalizeAdditionalTasteAnalysisBatches = (
  batches: RecommendationStateSnapshot['additionalTasteAnalysisBatches']
) =>
  (batches ?? [])
    .map((batch) => ({
      id: batch.id,
      movieIds: [
        ...new Set(
          (batch.movieIds ?? []).filter((movieId): movieId is string => typeof movieId === 'string')
        )
      ],
      createdAt:
        typeof batch.createdAt === 'string' && Number.isFinite(new Date(batch.createdAt).getTime())
          ? new Date(batch.createdAt).toISOString()
          : new Date(0).toISOString()
    }))
    .filter((batch) => batch.movieIds.length > 0);

const normalizeContext = (
  value: RecommendationStateSnapshot['currentContext'] | undefined
): MoodContext => {
  const allowedContexts: MoodContext[] = [
    'normal',
    'after_exam',
    'bed_time',
    'with_friends',
    'after_academy'
  ];

  return allowedContexts.includes(value as MoodContext) ? (value as MoodContext) : 'normal';
};

const normalizeContextUpdatedAt = (value: string | undefined) => {
  const timestamp = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date(0).toISOString();
};

const normalizeSelectedTasteAnalysisGenres = (value: readonly string[] | undefined) =>
  normalizeTasteAnalysisGenres(value ?? []);

const loadSnapshot = (userId: string): RecommendationStateSnapshot => {
  const saved = localRecommendationRepository.load(userId);

  if (!saved) {
    return {
      userId,
      profile: createEmptyUserPreferenceProfile(userId),
      ratings: [],
      additionalTasteAnalysisBatches: [],
      dismissedRecommendationMovieIds: [],
      selectedTasteAnalysisGenres: [],
      currentContext: 'normal',
      currentContextUpdatedAt: new Date(0).toISOString()
    };
  }

  const normalizedRatings = normalizeStoredRatings(saved.ratings);

  return {
    userId,
    profile: buildProfileFromRatings(userId, normalizedRatings),
    ratings: normalizedRatings,
      additionalTasteAnalysisBatches: normalizeAdditionalTasteAnalysisBatches(
        saved.additionalTasteAnalysisBatches
      ),
      dismissedRecommendationMovieIds: saved.dismissedRecommendationMovieIds ?? [],
      selectedTasteAnalysisGenres: normalizeSelectedTasteAnalysisGenres(
        saved.selectedTasteAnalysisGenres
      ),
      currentContext: normalizeContext(saved.currentContext),
      currentContextUpdatedAt: normalizeContextUpdatedAt(saved.currentContextUpdatedAt)
    };
};

const loadRatingHistory = (userId: string) => normalizeStoredRatings(localRatingHistoryRepository.load(userId));

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

const mergeAdditionalTasteAnalysisBatches = (
  localBatches: readonly AdditionalTasteAnalysisBatch[],
  remoteBatches: readonly AdditionalTasteAnalysisBatch[]
) => {
  const mergedBatches = new Map<string, AdditionalTasteAnalysisBatch>();

  for (const batch of [...localBatches, ...remoteBatches]) {
    if (!mergedBatches.has(batch.id)) {
      mergedBatches.set(batch.id, {
        id: batch.id,
        movieIds: [...batch.movieIds],
        createdAt: batch.createdAt
      });
    }
  }

  return [...mergedBatches.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
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
  const selectedTasteAnalysisGenres =
    remoteSnapshot.selectedTasteAnalysisGenres.length > 0
      ? remoteSnapshot.selectedTasteAnalysisGenres
      : localSnapshot.selectedTasteAnalysisGenres;
  const localContextTime = new Date(localSnapshot.currentContextUpdatedAt).getTime();
  const remoteContextTime = new Date(remoteSnapshot.currentContextUpdatedAt).getTime();
  const shouldUseRemoteContext = remoteContextTime > localContextTime;

  return {
    userId: localSnapshot.userId,
    profile: buildProfileFromRatings(localSnapshot.userId, mergedRatings),
    ratings: mergedRatings,
    additionalTasteAnalysisBatches: mergeAdditionalTasteAnalysisBatches(
      localSnapshot.additionalTasteAnalysisBatches,
      remoteSnapshot.additionalTasteAnalysisBatches
    ),
    dismissedRecommendationMovieIds,
    selectedTasteAnalysisGenres,
    currentContext: shouldUseRemoteContext ? remoteSnapshot.currentContext : localSnapshot.currentContext,
    currentContextUpdatedAt: shouldUseRemoteContext
      ? remoteSnapshot.currentContextUpdatedAt
      : localSnapshot.currentContextUpdatedAt
  };
};

const hasRatingRecordChanged = (left: StoredRatingRecord, right: StoredRatingRecord) =>
  left.rawDecision !== right.rawDecision ||
  left.rawDirection !== right.rawDirection ||
  left.detailCompleted !== right.detailCompleted ||
  left.input.status !== right.input.status ||
  left.input.rating !== right.input.rating ||
  left.input.favoriteCharacters.length !== right.input.favoriteCharacters.length ||
  left.input.favoriteCharacters.some(
    (favoriteCharacter, index) => favoriteCharacter !== right.input.favoriteCharacters[index]
  ) ||
  left.input.answeredAt !== right.input.answeredAt ||
  left.reviewText !== right.reviewText ||
  left.questionText !== right.questionText ||
  left.input.reviewTags.length !== right.input.reviewTags.length ||
  left.input.reviewTags.some((tag, index) => tag !== right.input.reviewTags[index]);

const hasRatingCollectionChanged = (
  leftRecords: readonly StoredRatingRecord[],
  rightRecords: readonly StoredRatingRecord[]
) => {
  if (leftRecords.length !== rightRecords.length) {
    return true;
  }

  const rightRatingsByMovieId = new Map(
    rightRecords.map((record) => [record.input.movieId, record] as const)
  );

  for (const leftRecord of leftRecords) {
    const rightRecord = rightRatingsByMovieId.get(leftRecord.input.movieId);

    if (!rightRecord || hasRatingRecordChanged(leftRecord, rightRecord)) {
      return true;
    }
  }

  return false;
};

const shouldResyncRemoteSnapshot = (
  remoteSnapshot: RecommendationStateSnapshot,
  mergedSnapshot: RecommendationStateSnapshot
) => {
  if (hasRatingCollectionChanged(remoteSnapshot.ratings, mergedSnapshot.ratings)) {
    return true;
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

  if (remoteSnapshot.currentContext !== mergedSnapshot.currentContext) {
    return true;
  }

  if (remoteSnapshot.currentContextUpdatedAt !== mergedSnapshot.currentContextUpdatedAt) {
    return true;
  }

  return false;
};

const shouldResyncRatingHistory = (
  remoteHistory: readonly StoredRatingRecord[],
  mergedHistory: readonly StoredRatingRecord[]
) => hasRatingCollectionChanged(remoteHistory, mergedHistory);

const initialSnapshot = loadSnapshot(FALLBACK_USER_ID);
const initialRatingHistory = loadRatingHistory(FALLBACK_USER_ID);

const state = reactive<RecommendationStateSnapshot>({
  userId: initialSnapshot.userId,
  profile: initialSnapshot.profile,
  ratings: initialSnapshot.ratings,
  additionalTasteAnalysisBatches: initialSnapshot.additionalTasteAnalysisBatches,
  dismissedRecommendationMovieIds: initialSnapshot.dismissedRecommendationMovieIds,
  selectedTasteAnalysisGenres: initialSnapshot.selectedTasteAnalysisGenres,
  currentContext: initialSnapshot.currentContext,
  currentContextUpdatedAt: initialSnapshot.currentContextUpdatedAt
});
const ratingHistoryState = reactive<{
  ratings: StoredRatingRecord[];
  userId: string;
}>({
  userId: initialSnapshot.userId,
  ratings: initialRatingHistory
});

const remoteSyncErrorMessage = ref('');
const remoteSyncStatus = ref<RemoteSyncStatus>('idle');
const currentContext = ref<MoodContext>(initialSnapshot.currentContext);
const currentContextUpdatedAt = ref(initialSnapshot.currentContextUpdatedAt);
const contextWeights = ref<RecommendationContextWeights>(cloneDefaultContextWeights());
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
  state.additionalTasteAnalysisBatches = snapshot.additionalTasteAnalysisBatches;
  state.dismissedRecommendationMovieIds = snapshot.dismissedRecommendationMovieIds;
  state.selectedTasteAnalysisGenres = snapshot.selectedTasteAnalysisGenres;
  state.currentContext = snapshot.currentContext;
  state.currentContextUpdatedAt = snapshot.currentContextUpdatedAt;
  currentContext.value = snapshot.currentContext;
  currentContextUpdatedAt.value = snapshot.currentContextUpdatedAt;
};

const applyRatingHistory = (userId: string, ratings: readonly StoredRatingRecord[]) => {
  ratingHistoryState.userId = userId;
  ratingHistoryState.ratings = [...normalizeStoredRatings(ratings)].sort(
    (left, right) => getAnsweredAtTime(left) - getAnsweredAtTime(right)
  );
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

const loadRemoteContextWeights = async () => {
  try {
    const remoteWeights = await remoteRecommendationContextWeightsRepository.load();
    contextWeights.value = mergeContextWeights(remoteWeights);
  } catch (error) {
    console.error('[recommendationStore] Failed to load recommendation context weights.', error);
    contextWeights.value = cloneDefaultContextWeights();
  }
};

const buildSnapshot = (): RecommendationStateSnapshot => ({
  userId: state.userId,
  profile: state.profile,
  ratings: state.ratings,
  additionalTasteAnalysisBatches: state.additionalTasteAnalysisBatches,
  dismissedRecommendationMovieIds: state.dismissedRecommendationMovieIds,
  selectedTasteAnalysisGenres: state.selectedTasteAnalysisGenres,
  currentContext: currentContext.value,
  currentContextUpdatedAt: currentContextUpdatedAt.value
});

const persistState = (options?: {
  historyRecords?: readonly StoredRatingRecord[];
  removeMovieIds?: readonly string[];
}) => {
  const snapshot = buildSnapshot();
  const historyRecords = normalizeStoredRatings(options?.historyRecords);
  const mergedHistory =
    historyRecords.length > 0
      ? normalizeStoredRatings(mergeRatingRecords(ratingHistoryState.ratings, historyRecords))
      : ratingHistoryState.ratings;

  localRecommendationRepository.save(snapshot);
  if (historyRecords.length > 0) {
    applyRatingHistory(snapshot.userId, mergedHistory);
    localRatingHistoryRepository.save(snapshot.userId, mergedHistory);
  }
  remoteSyncErrorMessage.value = '';

  return enqueueRemoteTask(
    async () => {
      if (options?.removeMovieIds?.length) {
        await remoteRecommendationRepository.deleteRatings(snapshot.userId, options.removeMovieIds);
      }

      await remoteRecommendationRepository.save(snapshot);

      if (historyRecords.length > 0) {
        await remoteRatingHistoryRepository.save(snapshot.userId, historyRecords);
      }
    },
    '평가 기록을 Supabase에 저장하지 못했어요.'
  );
};

const recomputeProfile = () => {
  state.profile = buildProfileFromRatings(state.userId, state.ratings);
};

const applyRatingRecords = (
  nextRatings: readonly StoredRatingRecord[],
  options?: {
    historyRecords?: readonly StoredRatingRecord[];
    removeMovieIds?: readonly string[];
  }
) => {
  state.ratings = [...nextRatings].sort(
    (left, right) => getAnsweredAtTime(left) - getAnsweredAtTime(right)
  );
  recomputeProfile();

  return persistState(options);
};

const upsertRatingRecord = (record: StoredRatingRecord) => {
  const nextRatings = [...state.ratings];
  const existingIndex = nextRatings.findIndex((item) => item.input.movieId === record.input.movieId);

  if (existingIndex >= 0) {
    nextRatings.splice(existingIndex, 1, record);
  } else {
    nextRatings.push(record);
  }

  return applyRatingRecords(nextRatings, {
    historyRecords: [record]
  });
};

const replaceRatingsForMovies = (
  movieIds: readonly string[],
  records: readonly StoredRatingRecord[]
) => {
  const movieIdSet = new Set(movieIds);
  const nextRatings = state.ratings.filter((rating) => !movieIdSet.has(rating.input.movieId));
  nextRatings.push(...records);

  return applyRatingRecords(nextRatings, {
    historyRecords: records,
    removeMovieIds: [...movieIdSet]
  });
};

const ratedMovieIds = computed(() => state.ratings.map((rating) => rating.input.movieId));
const selectedTasteAnalysisGenres = computed(() => state.selectedTasteAnalysisGenres);
const primaryRatingMovies = computed(() =>
  getPrimaryRatingMovies(selectedTasteAnalysisGenres.value)
);
const detailEligibleRatingRecords = computed(() =>
  state.ratings.filter((rating) => rating.rawDecision !== 'not_seen')
);
const pendingDetailedRatings = computed(() =>
  detailEligibleRatingRecords.value.filter((rating) => !rating.detailCompleted)
);
const primaryRatingMovieIds = computed(
  () => new Set(primaryRatingMovies.value.map((movie) => movie.id))
);
const primaryUnratedMovies = computed(() =>
  primaryRatingMovies.value.filter((movie) => !ratedMovieIds.value.includes(movie.id))
);
const pendingPrimaryDetailedRatings = computed(() =>
  pendingDetailedRatings.value.filter((rating) => primaryRatingMovieIds.value.has(rating.input.movieId))
);
const getTasteAnalysisSelectionSummary = (movieIds: readonly string[]) => {
  const movieIdSet = new Set(movieIds);

  return state.ratings.reduce(
    (summary, rating) => {
      if (!movieIdSet.has(rating.input.movieId)) {
        return summary;
      }

      if (rating.rawDecision === 'like') {
        summary.likeCount += 1;
      }

      if (rating.rawDecision === 'dislike' || rating.rawDecision === 'not_interested') {
        summary.dislikeCount += 1;
      }

      return summary;
    },
    {
      likeCount: 0,
      dislikeCount: 0
    }
  );
};

const isTasteAnalysisBatchComplete = (movieIds: readonly string[]) => {
  const movieIdSet = new Set(movieIds);
  return state.ratings.filter((rating) => movieIdSet.has(rating.input.movieId)).length >= movieIds.length;
};

const isPrimaryTasteAnalysisComplete = computed(() =>
  primaryRatingMovies.value.length > 0 &&
  isTasteAnalysisBatchComplete(primaryRatingMovies.value.map((movie) => movie.id))
);
const getAdditionalTasteAnalysisBatchMoviesByRecord = (batch: AdditionalTasteAnalysisBatch) =>
  batch.movieIds
    .map((movieId) => movieMap[movieId])
    .filter((movie): movie is CatalogMovie => Boolean(movie));

const getAdditionalTasteAnalysisBatchMovies = (batchIndex: number) => {
  const batch = state.additionalTasteAnalysisBatches[batchIndex];

  if (!batch) {
    return [];
  }

  return getAdditionalTasteAnalysisBatchMoviesByRecord(batch);
};

const additionalTasteAnalysisReservedMovieIds = computed(() =>
  state.additionalTasteAnalysisBatches.flatMap((batch) => batch.movieIds)
);

const activeAdditionalTasteAnalysisBatchIndex = computed(() => {
  const batchIndex = state.additionalTasteAnalysisBatches.findIndex((batch) => {
    return !isTasteAnalysisBatchComplete(batch.movieIds);
  });

  return batchIndex >= 0 ? batchIndex : null;
});

const canCreateAdditionalTasteAnalysisBatch = computed(
  () =>
      isPrimaryTasteAnalysisComplete.value &&
      buildAdditionalTasteAnalysisBatch(
        selectedTasteAnalysisGenres.value,
        ratedMovieIds.value,
        additionalTasteAnalysisReservedMovieIds.value
      ).length > 0
);

const hasAdditionalTasteAnalysisMovies = computed(
  () =>
    isPrimaryTasteAnalysisComplete.value &&
    (activeAdditionalTasteAnalysisBatchIndex.value !== null ||
      canCreateAdditionalTasteAnalysisBatch.value)
);
const shouldResumeTasteAnalysis = computed(
  () =>
    primaryRatingMovies.value.length > 0 &&
    (primaryUnratedMovies.value.length > 0 ||
      pendingDetailedRatings.value.length > 0 ||
      activeAdditionalTasteAnalysisBatchIndex.value !== null)
);
const resumeTasteAnalysisPath = computed(() => {
  if (primaryUnratedMovies.value.length > 0) {
    return '/rating';
  }

  if (activeAdditionalTasteAnalysisBatchIndex.value !== null) {
    return '/rating?mode=more';
  }

  if (pendingDetailedRatings.value.length > 0) {
    return '/rating?mode=detail';
  }

  if (hasAdditionalTasteAnalysisMovies.value) {
    return '/rating?mode=more';
  }

  return '/rating';
});

const excludedRecommendationMovieIds = computed(() => [
  ...ratedMovieIds.value,
  ...state.dismissedRecommendationMovieIds
]);

const mapScoredMoviesToCatalogMovies = (movies: ReturnType<typeof recommendMovies>) =>
  movies.map((movie) => ({
    ...movieMap[movie.id],
    genreIds: resolveGenreIds(movieMap[movie.id]),
    recommendationScore: movie.recommendationScore
  }));

const freshRecommendationPool = computed<RecommendedCatalogMovie[]>(() => {
  const scoredMovies = recommendMovies(catalogMovies, state.profile, {
    excludeMovieIds: excludedRecommendationMovieIds.value,
    limit: recommendationPoolLimit
  });

  return mapScoredMoviesToCatalogMovies(scoredMovies);
});

const fallbackRecommendationPool = computed<RecommendedCatalogMovie[]>(() => {
  if (freshRecommendationPool.value.length > 0) {
    return freshRecommendationPool.value;
  }

  const scoredMovies = recommendMovies(catalogMovies, state.profile, {
    excludeMovieIds: state.dismissedRecommendationMovieIds,
    limit: recommendationPoolLimit
  });

  return mapScoredMoviesToCatalogMovies(scoredMovies);
});

const rawRecommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  return fallbackRecommendationPool.value.slice(0, recommendationVisibleLimit);
});

const isRecommendationFallbackMode = computed(
  () => freshRecommendationPool.value.length === 0 && rawRecommendedMovies.value.length > 0
);

const contextAwareRecommendedMovies = computed<RecommendedCatalogMovie[]>(() => {
  const baseMovies = fallbackRecommendationPool.value;
  const context = currentContext.value;

  if (context === 'normal') {
    return baseMovies.slice(0, recommendationVisibleLimit);
  }

  const weights = contextWeights.value[context];

  return [...baseMovies]
    .sort((left, right) => {
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
    })
    .slice(0, recommendationVisibleLimit);
});

const recommendedMovies = computed<RecommendedCatalogMovie[]>(() => contextAwareRecommendedMovies.value);

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
  [...ratingHistoryState.ratings]
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

const getStoredRatingRecord = (movieId: string) => {
  const currentRecord = state.ratings.find((record) => record.input.movieId === movieId) ?? null;
  const historyRecord =
    ratingHistoryState.ratings.find((record) => record.input.movieId === movieId) ?? null;

  if (!currentRecord) {
    return historyRecord;
  }

  if (!historyRecord) {
    return currentRecord;
  }

  return shouldReplaceRatingRecord(historyRecord, currentRecord) ? currentRecord : historyRecord;
};

const getNextRatingMovie = (options?: { additionalBatchIndex?: null | number }) => {
  if (typeof options?.additionalBatchIndex === 'number') {
    const nextBatchMovie = getAdditionalTasteAnalysisBatchMovies(options.additionalBatchIndex).find(
      (movie) => !ratedMovieIds.value.includes(movie.id)
    );

    return nextBatchMovie ?? null;
  }

  return primaryUnratedMovies.value[0] ?? null;
};

const getPendingDetailMovie = () => {
  const pendingRecord = pendingDetailedRatings.value[0];

  if (!pendingRecord) {
    return null;
  }

  return movieMap[pendingRecord.input.movieId] ?? null;
};

const ensureAdditionalTasteAnalysisBatch = (requestedBatchIndex?: null | number) => {
  if (
    typeof requestedBatchIndex === 'number' &&
    requestedBatchIndex >= 0 &&
    requestedBatchIndex < state.additionalTasteAnalysisBatches.length
  ) {
    const requestedBatch = state.additionalTasteAnalysisBatches[requestedBatchIndex];

    if (requestedBatch && !isTasteAnalysisBatchComplete(requestedBatch.movieIds)) {
      return requestedBatchIndex;
    }
  }

  if (activeAdditionalTasteAnalysisBatchIndex.value != null) {
    return activeAdditionalTasteAnalysisBatchIndex.value;
  }

  const nextBatch = buildAdditionalTasteAnalysisBatch(
    selectedTasteAnalysisGenres.value,
    ratedMovieIds.value,
    additionalTasteAnalysisReservedMovieIds.value
  );

  if (nextBatch.length === 0) {
    return null;
  }

  const nextBatchRecord: AdditionalTasteAnalysisBatch = {
    id: `additional-batch-${Date.now()}`,
    movieIds: nextBatch.map((movie) => movie.id),
    createdAt: new Date().toISOString()
  };

  state.additionalTasteAnalysisBatches = [...state.additionalTasteAnalysisBatches, nextBatchRecord];
  void persistState();

  return state.additionalTasteAnalysisBatches.length - 1;
};

const submitSwipeRating = (
  movie: CatalogMovie,
  input: RatingInput,
  options?: {
    rawDecision: StoredRatingRecord['rawDecision'];
    rawDirection?: StoredRatingRecord['rawDirection'];
    detailCompleted: boolean;
    feedback?: RatingFeedbackPayload;
  }
) =>
  upsertRatingRecord({
    rawDecision: options?.rawDecision ?? input.status,
    rawDirection: options?.rawDirection ?? null,
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

const setTasteAnalysisGenres = (genres: readonly TasteAnalysisGenre[]) => {
  const normalizedGenres = normalizeSelectedTasteAnalysisGenres(genres);
  const hasSameSelection =
    normalizedGenres.length === state.selectedTasteAnalysisGenres.length &&
    normalizedGenres.every((genre, index) => genre === state.selectedTasteAnalysisGenres[index]);

  if (hasSameSelection) {
    return Promise.resolve();
  }

  state.selectedTasteAnalysisGenres = normalizedGenres;
  state.additionalTasteAnalysisBatches = [];
  return persistState();
};

const setContext = (context: MoodContext) => {
  if (currentContext.value === context) {
    return Promise.resolve();
  }

  currentContext.value = context;
  currentContextUpdatedAt.value = new Date().toISOString();
  state.currentContext = currentContext.value;
  state.currentContextUpdatedAt = currentContextUpdatedAt.value;

  return persistState();
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
  state.additionalTasteAnalysisBatches = [];
  state.dismissedRecommendationMovieIds = [];
  state.currentContext = currentContext.value;
  state.currentContextUpdatedAt = currentContextUpdatedAt.value;
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';
  localRecommendationRepository.save({
    userId: state.userId,
    profile: state.profile,
    ratings: [],
    additionalTasteAnalysisBatches: [],
    dismissedRecommendationMovieIds: [],
    selectedTasteAnalysisGenres: state.selectedTasteAnalysisGenres,
    currentContext: currentContext.value,
    currentContextUpdatedAt: currentContextUpdatedAt.value
  });

  void enqueueRemoteTask(
    () => remoteRecommendationRepository.clear(state.userId),
    '취향분석 초기화 내용을 Supabase ratings 테이블에 반영하지 못했어요.'
  );
};

const setActiveUser = async (userId: string) => {
  const normalizedUserId = userId || FALLBACK_USER_ID;
  const localSnapshot = loadSnapshot(normalizedUserId);
  const localRatingHistory = loadRatingHistory(normalizedUserId);
  applySnapshot(localSnapshot);
  applyRatingHistory(normalizedUserId, localRatingHistory);
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';

  try {
    const [remoteSnapshot, remoteRatingHistory] = await Promise.all([
      remoteRecommendationRepository.load(normalizedUserId),
      remoteRatingHistoryRepository.load(normalizedUserId)
    ]);
    const mergedRatingHistory = normalizeStoredRatings(
      mergeRatingRecords(localRatingHistory, remoteRatingHistory)
    );

    applyRatingHistory(normalizedUserId, mergedRatingHistory);
    localRatingHistoryRepository.save(normalizedUserId, mergedRatingHistory);

    if (!remoteSnapshot) {
      if (shouldResyncRatingHistory(remoteRatingHistory, mergedRatingHistory)) {
        void enqueueRemoteTask(
          () => remoteRatingHistoryRepository.save(normalizedUserId, mergedRatingHistory),
          '평가 이력을 Supabase와 다시 맞추지 못했어요.'
        );
      }

      return;
    }

    const normalizedRemoteSnapshot = {
      userId: normalizedUserId,
      profile: remoteSnapshot.profile,
      ratings: normalizeStoredRatings(remoteSnapshot.ratings),
      additionalTasteAnalysisBatches: normalizeAdditionalTasteAnalysisBatches(
        remoteSnapshot.additionalTasteAnalysisBatches
      ),
      dismissedRecommendationMovieIds: remoteSnapshot.dismissedRecommendationMovieIds ?? [],
      selectedTasteAnalysisGenres: normalizeSelectedTasteAnalysisGenres(
        remoteSnapshot.selectedTasteAnalysisGenres
      ),
      currentContext: normalizeContext(remoteSnapshot.currentContext),
      currentContextUpdatedAt: normalizeContextUpdatedAt(remoteSnapshot.currentContextUpdatedAt)
    };
    const mergedSnapshot = mergeSnapshots(localSnapshot, normalizedRemoteSnapshot);

    applySnapshot(mergedSnapshot);
    localRecommendationRepository.save(mergedSnapshot);
    applyRatingHistory(normalizedUserId, mergedRatingHistory);
    localRatingHistoryRepository.save(normalizedUserId, mergedRatingHistory);

    const shouldResyncRecommendation = shouldResyncRemoteSnapshot(
      normalizedRemoteSnapshot,
      mergedSnapshot
    );
    const shouldResyncHistory = shouldResyncRatingHistory(
      remoteRatingHistory,
      mergedRatingHistory
    );

    if (shouldResyncRecommendation || shouldResyncHistory) {
      void enqueueRemoteTask(
        async () => {
          if (shouldResyncRecommendation) {
            await remoteRecommendationRepository.save(mergedSnapshot);
          }

          if (shouldResyncHistory) {
            await remoteRatingHistoryRepository.save(normalizedUserId, mergedRatingHistory);
          }
        },
        '최신 평가 상태를 Supabase와 다시 맞추지 못했어요.'
      );
    }

    remoteSyncStatus.value = 'success';
  } catch (error) {
    remoteSyncStatus.value = 'error';
    remoteSyncErrorMessage.value =
      'Supabase에서 추천 상태를 불러오지 못했어요. 로컬에 저장된 기록은 그대로 사용할게요.';
    console.error('[recommendationStore] Failed to load ratings from Supabase.', error);
  }
};

export const recommendationStore = {
  state: readonly(state),
  catalogMovies,
  catalogLists,
  currentContext: readonly(currentContext),
  contextWeights: readonly(contextWeights),
  ratedMovieIds,
  selectedTasteAnalysisGenres,
  primaryRatingMovies,
  pendingDetailedRatings,
  pendingPrimaryDetailedRatings,
  primaryUnratedMovies,
  activeAdditionalTasteAnalysisBatchIndex,
  hasAdditionalTasteAnalysisMovies,
  shouldResumeTasteAnalysis,
  resumeTasteAnalysisPath,
  ratedMoviesHistory,
  contextAwareRecommendedMovies,
  recommendedMovies,
  rawRecommendedMovies,
  isRecommendationFallbackMode,
  recommendedLists,
  remoteSyncErrorMessage: readonly(remoteSyncErrorMessage),
  remoteSyncStatus: readonly(remoteSyncStatus),
  getAdditionalTasteAnalysisBatchMovies,
  ensureAdditionalTasteAnalysisBatch,
  getNextRatingMovie,
  getPendingDetailMovie,
  getStoredRatingRecord,
  replaceRatingsForMovies,
  setTasteAnalysisGenres,
  setContext,
  submitSwipeRating,
  dismissRecommendedMovie,
  resetDismissedRecommendations,
  resetTasteAnalysis,
  setActiveUser
};

void loadRemoteContextWeights();

export const useRecommendationStore = () => recommendationStore;

