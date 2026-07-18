import { computed, reactive, readonly, ref } from 'vue';

import { catalogLists, catalogMovies } from '@/data/catalog';
import { getSituationPreset, isCompleteSituationSelection } from '@/data/situations';
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
  remoteRecommendationRepository
} from '@/services/recommendationRepository';
import { rankSituationMovies } from '@/services/situationRecommendation';
import type {
  ActiveSituation,
  AdditionalTasteAnalysisBatch,
  CatalogMovie,
  RatingResumeSurface,
  RatingFeedbackPayload,
  RatedCatalogMovieRecord,
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  RecommendationImpression,
  RecommendationStateSnapshot,
  SituationPresetId,
  SituationSelection,
  StoredRatingRecord,
  TasteAnalysisGenre
} from '@/types/recommendation';
import { normalizeFavoriteCharacters, requiresDetailedRatingFeedback } from '@/types/rating';

const FALLBACK_USER_ID = 'guest-user';

type RemoteSyncStatus = 'error' | 'idle' | 'success' | 'syncing';

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie])) as Record<
  string,
  CatalogMovie
>;
const recommendationVisibleLimit = 10;
const recommendationPoolLimit = catalogMovies.length;
const ratingResumeSurfacePathMap: Record<RatingResumeSurface, string> = {
  primary: '/rating',
  primary_completion: '/rating',
  detail: '/rating?mode=detail',
  detail_completion: '/rating?mode=detail',
  more: '/rating?mode=more',
  more_completion: '/rating?mode=more'
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

const normalizeRecommendationImpressions = (value: readonly RecommendationImpression[] | undefined) => {
  const impressionsByMovieId = new Map<string, RecommendationImpression>();

  for (const impression of value ?? []) {
    if (!impression || typeof impression.movieId !== 'string' || impression.movieId.length === 0) {
      continue;
    }

    const timestamp = new Date(impression.lastShownAt).getTime();

    if (!Number.isFinite(timestamp)) {
      continue;
    }

    const normalized: RecommendationImpression = {
      movieId: impression.movieId,
      lastShownAt: new Date(timestamp).toISOString(),
      showCount: Math.max(1, Math.floor(impression.showCount ?? 1))
    };
    const current = impressionsByMovieId.get(normalized.movieId);

    if (!current || new Date(normalized.lastShownAt).getTime() >= new Date(current.lastShownAt).getTime()) {
      impressionsByMovieId.set(normalized.movieId, normalized);
    }
  }

  return [...impressionsByMovieId.values()]
    .sort((left, right) => new Date(right.lastShownAt).getTime() - new Date(left.lastShownAt).getTime())
    .slice(0, 120);
};

const normalizeActiveSituation = (value: unknown): ActiveSituation => {
  if (!value || typeof value !== 'object' || !('kind' in value)) {
    return { kind: 'none' };
  }

  if (value.kind === 'preset' && 'presetId' in value && typeof value.presetId === 'string') {
    return getSituationPreset(value.presetId as SituationPresetId)
      ? { kind: 'preset', presetId: value.presetId as SituationPresetId }
      : { kind: 'none' };
  }

  if (
    value.kind === 'manual' &&
    'selection' in value &&
    isCompleteSituationSelection(value.selection as Partial<SituationSelection>)
  ) {
    return {
      kind: 'manual',
      selection: value.selection as SituationSelection
    };
  }

  return { kind: 'none' };
};

const normalizeActiveSituationUpdatedAt = (value: string | undefined) => {
  const timestamp = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date(0).toISOString();
};

const normalizeSelectedTasteAnalysisGenres = (value: readonly string[] | undefined) =>
  normalizeTasteAnalysisGenres(value ?? []);

const ratingResumeSurfaces: RatingResumeSurface[] = [
  'primary',
  'primary_completion',
  'detail',
  'detail_completion',
  'more',
  'more_completion'
];

const isRatingResumeSurface = (value: unknown): value is RatingResumeSurface =>
  ratingResumeSurfaces.includes(value as RatingResumeSurface);

const getLegacyRatingResumeSurface = (snapshot: Pick<
  RecommendationStateSnapshot,
  'additionalTasteAnalysisBatches' | 'ratings' | 'selectedTasteAnalysisGenres'
>): RatingResumeSurface => {
  const ratedMovieIdSet = new Set(snapshot.ratings.map((rating) => rating.input.movieId));
  const hasIncompleteAdditionalBatch = snapshot.additionalTasteAnalysisBatches.some((batch) =>
    batch.movieIds.some((movieId) => !ratedMovieIdSet.has(movieId))
  );

  if (hasIncompleteAdditionalBatch) {
    return 'more';
  }

  const primaryMovies = getPrimaryRatingMovies(snapshot.selectedTasteAnalysisGenres);
  const isPrimaryComplete =
    primaryMovies.length > 0 && primaryMovies.every((movie) => ratedMovieIdSet.has(movie.id));

  return isPrimaryComplete ? 'primary_completion' : 'primary';
};

const normalizeRatingResumeSurface = (
  value: unknown,
  snapshot: Pick<
    RecommendationStateSnapshot,
    'additionalTasteAnalysisBatches' | 'ratings' | 'selectedTasteAnalysisGenres'
  >
): RatingResumeSurface =>
  isRatingResumeSurface(value) ? value : getLegacyRatingResumeSurface(snapshot);

const loadSnapshot = (userId: string): RecommendationStateSnapshot => {
  const saved = localRecommendationRepository.load(userId);

  if (!saved) {
    return {
      userId,
      profile: createEmptyUserPreferenceProfile(userId),
      ratings: [],
      additionalTasteAnalysisBatches: [],
      ratingResumeSurface: 'primary',
      dismissedRecommendationMovieIds: [],
      recommendationImpressions: [],
      selectedTasteAnalysisGenres: [],
      activeSituation: { kind: 'none' },
      activeSituationUpdatedAt: new Date(0).toISOString()
    };
  }

  const normalizedRatings = normalizeStoredRatings(saved.ratings);
  const normalizedAdditionalTasteAnalysisBatches = normalizeAdditionalTasteAnalysisBatches(
    saved.additionalTasteAnalysisBatches
  );
  const normalizedSelectedTasteAnalysisGenres = normalizeSelectedTasteAnalysisGenres(
    saved.selectedTasteAnalysisGenres
  );
  const ratingResumeSurface = normalizeRatingResumeSurface(
    (saved as Partial<RecommendationStateSnapshot>).ratingResumeSurface,
    {
      ratings: normalizedRatings,
      additionalTasteAnalysisBatches: normalizedAdditionalTasteAnalysisBatches,
      selectedTasteAnalysisGenres: normalizedSelectedTasteAnalysisGenres
    }
  );

  return {
    userId,
    profile: buildProfileFromRatings(userId, normalizedRatings),
    ratings: normalizedRatings,
    additionalTasteAnalysisBatches: normalizedAdditionalTasteAnalysisBatches,
    ratingResumeSurface,
    dismissedRecommendationMovieIds: saved.dismissedRecommendationMovieIds ?? [],
    recommendationImpressions: normalizeRecommendationImpressions(saved.recommendationImpressions),
    selectedTasteAnalysisGenres: normalizedSelectedTasteAnalysisGenres,
    activeSituation: normalizeActiveSituation((saved as Partial<RecommendationStateSnapshot>).activeSituation),
    activeSituationUpdatedAt: normalizeActiveSituationUpdatedAt(
      (saved as Partial<RecommendationStateSnapshot>).activeSituationUpdatedAt
    )
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
  const localSituationTime = new Date(localSnapshot.activeSituationUpdatedAt).getTime();
  const remoteSituationTime = new Date(remoteSnapshot.activeSituationUpdatedAt).getTime();
  const shouldUseRemoteSituation = remoteSituationTime > localSituationTime;

  return {
    userId: localSnapshot.userId,
    profile: buildProfileFromRatings(localSnapshot.userId, mergedRatings),
    ratings: mergedRatings,
    additionalTasteAnalysisBatches: mergeAdditionalTasteAnalysisBatches(
      localSnapshot.additionalTasteAnalysisBatches,
      remoteSnapshot.additionalTasteAnalysisBatches
    ),
    ratingResumeSurface: localSnapshot.ratingResumeSurface,
    dismissedRecommendationMovieIds,
    recommendationImpressions: localSnapshot.recommendationImpressions,
    selectedTasteAnalysisGenres,
    activeSituation: shouldUseRemoteSituation
      ? remoteSnapshot.activeSituation
      : localSnapshot.activeSituation,
    activeSituationUpdatedAt: shouldUseRemoteSituation
      ? remoteSnapshot.activeSituationUpdatedAt
      : localSnapshot.activeSituationUpdatedAt
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

  if (JSON.stringify(remoteSnapshot.activeSituation) !== JSON.stringify(mergedSnapshot.activeSituation)) {
    return true;
  }

  if (remoteSnapshot.activeSituationUpdatedAt !== mergedSnapshot.activeSituationUpdatedAt) {
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
  ratingResumeSurface: initialSnapshot.ratingResumeSurface,
  dismissedRecommendationMovieIds: initialSnapshot.dismissedRecommendationMovieIds,
  recommendationImpressions: initialSnapshot.recommendationImpressions,
  selectedTasteAnalysisGenres: initialSnapshot.selectedTasteAnalysisGenres,
  activeSituation: initialSnapshot.activeSituation,
  activeSituationUpdatedAt: initialSnapshot.activeSituationUpdatedAt
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
const activeSituation = ref<ActiveSituation>(initialSnapshot.activeSituation);
const activeSituationUpdatedAt = ref(initialSnapshot.activeSituationUpdatedAt);
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
  state.ratingResumeSurface = snapshot.ratingResumeSurface;
  state.dismissedRecommendationMovieIds = snapshot.dismissedRecommendationMovieIds;
  state.recommendationImpressions = snapshot.recommendationImpressions;
  state.selectedTasteAnalysisGenres = snapshot.selectedTasteAnalysisGenres;
  state.activeSituation = snapshot.activeSituation;
  state.activeSituationUpdatedAt = snapshot.activeSituationUpdatedAt;
  activeSituation.value = snapshot.activeSituation;
  activeSituationUpdatedAt.value = snapshot.activeSituationUpdatedAt;
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

const buildSnapshot = (): RecommendationStateSnapshot => ({
  userId: state.userId,
  profile: state.profile,
  ratings: state.ratings,
  additionalTasteAnalysisBatches: state.additionalTasteAnalysisBatches,
  ratingResumeSurface: state.ratingResumeSurface,
  dismissedRecommendationMovieIds: state.dismissedRecommendationMovieIds,
  recommendationImpressions: state.recommendationImpressions,
  selectedTasteAnalysisGenres: state.selectedTasteAnalysisGenres,
  activeSituation: activeSituation.value,
  activeSituationUpdatedAt: activeSituationUpdatedAt.value
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
const likedMovieIds = computed(() =>
  state.ratings
    .filter((rating) => rating.rawDecision === 'like' || rating.input.status === 'like')
    .map((rating) => rating.input.movieId)
);
const selectedTasteAnalysisGenres = computed(() => state.selectedTasteAnalysisGenres);
const primaryRatingMovies = computed(() =>
  getPrimaryRatingMovies(selectedTasteAnalysisGenres.value)
);
const detailEligibleRatingRecords = computed(() =>
  state.ratings.filter((rating) =>
    requiresDetailedRatingFeedback(rating.rawDecision, rating.rawDirection)
  )
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
  if (primaryRatingMovies.value.length > 0) {
    return ratingResumeSurfacePathMap[state.ratingResumeSurface];
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
    genreIds: movieMap[movie.id].genreIds ?? [],
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

const fixedPresetRecommendationPool = computed<RecommendedCatalogMovie[] | null>(() => {
  if (activeSituation.value.kind !== 'preset') {
    return null;
  }

  const fixedMovieIds = getSituationPreset(activeSituation.value.presetId)?.rule.tmdbMovieIds ?? [];

  if (fixedMovieIds.length === 0) {
    return null;
  }

  // 명시적으로 고른 프랜차이즈/영화 묶음은 이미 평가한 작품도 다시 볼 수 있게 한다.
  // 단, 사용자가 직접 '관심 없음'으로 제외한 작품은 계속 숨긴다.
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
  return rankSituationMovies({
    activeSituation: activeSituation.value,
    catalogMovies,
    hasTasteProfile: state.profile.totalRatings > 0,
    impressions: state.recommendationImpressions,
    likedMovieIds: likedMovieIds.value,
    movies: fixedPresetRecommendationPool.value ?? fallbackRecommendationPool.value
  }).slice(0, recommendationVisibleLimit);
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
    detailCompleted:
      options?.detailCompleted ??
      !requiresDetailedRatingFeedback(options?.rawDecision ?? input.status, options?.rawDirection ?? null),
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
  state.ratingResumeSurface = 'primary';
  return persistState();
};

const setRatingResumeSurface = (surface: RatingResumeSurface) => {
  if (state.ratingResumeSurface === surface) {
    return;
  }

  state.ratingResumeSurface = surface;
  localRecommendationRepository.save(buildSnapshot());
};

const recordCurrentRecommendationImpressions = () => {
  const now = new Date().toISOString();
  const impressionsByMovieId = new Map(
    state.recommendationImpressions.map((impression) => [impression.movieId, impression] as const)
  );

  for (const movie of contextAwareRecommendedMovies.value) {
    const current = impressionsByMovieId.get(movie.id);
    impressionsByMovieId.set(movie.id, {
      movieId: movie.id,
      lastShownAt: now,
      showCount: (current?.showCount ?? 0) + 1
    });
  }

  state.recommendationImpressions = normalizeRecommendationImpressions(
    [...impressionsByMovieId.values()]
  );
};

const setActiveSituation = (nextSituation: ActiveSituation) => {
  if (JSON.stringify(activeSituation.value) === JSON.stringify(nextSituation)) {
    return Promise.resolve();
  }

  recordCurrentRecommendationImpressions();
  activeSituation.value = nextSituation;
  activeSituationUpdatedAt.value = new Date().toISOString();
  state.activeSituation = activeSituation.value;
  state.activeSituationUpdatedAt = activeSituationUpdatedAt.value;

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
  state.ratingResumeSurface = 'primary';
  state.dismissedRecommendationMovieIds = [];
  state.recommendationImpressions = [];
  state.activeSituation = activeSituation.value;
  state.activeSituationUpdatedAt = activeSituationUpdatedAt.value;
  remoteSyncErrorMessage.value = '';
  remoteSyncStatus.value = 'idle';
  localRecommendationRepository.save(buildSnapshot());

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
      ratingResumeSurface: localSnapshot.ratingResumeSurface,
      dismissedRecommendationMovieIds: remoteSnapshot.dismissedRecommendationMovieIds ?? [],
      recommendationImpressions: [],
      selectedTasteAnalysisGenres: normalizeSelectedTasteAnalysisGenres(
        remoteSnapshot.selectedTasteAnalysisGenres
      ),
      activeSituation: normalizeActiveSituation(remoteSnapshot.activeSituation),
      activeSituationUpdatedAt: normalizeActiveSituationUpdatedAt(
        remoteSnapshot.activeSituationUpdatedAt
      )
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
  activeSituation: readonly(activeSituation),
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
  setRatingResumeSurface,
  setTasteAnalysisGenres,
  setActiveSituation,
  submitSwipeRating,
  dismissRecommendedMovie,
  resetDismissedRecommendations,
  resetTasteAnalysis,
  setActiveUser
};

export const useRecommendationStore = () => recommendationStore;

