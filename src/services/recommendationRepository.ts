import {
  getSupabaseRatingHistoryRelation,
  getSupabaseRecommendationContextRelation,
  getSupabaseRecommendationExclusionsRelation,
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabaseRatingHistoryUserColumn,
  supabaseRecommendationContextUserColumn,
  supabaseRecommendationExclusionsUserColumn,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import type {
  ActiveSituation,
  RecommendationStateSnapshot,
  StoredRatingRecord
} from '@/types/recommendation';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { normalizeFavoriteCharacters } from '@/types/rating';

const STORAGE_PREFIX = 'movielist:recommendation-state';
const RATING_HISTORY_STORAGE_PREFIX = 'movielist:rating-history';
const ALREADY_SEEN_REASON = 'already_seen';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;
const getRatingHistoryStorageKey = (userId: string) => `${RATING_HISTORY_STORAGE_PREFIX}:${userId}`;

export interface RecommendationRepository {
  load(userId: string): RecommendationStateSnapshot | null;
  save(snapshot: RecommendationStateSnapshot): void;
  clear(userId: string): void;
}

interface RatingHistorySnapshot {
  ratings: StoredRatingRecord[];
  userId: string;
}

interface SupabaseRatingRow {
  answered_at: null | string;
  detail_completed: boolean | null;
  favorite_character: string | null;
  movie_id: string;
  question_text: string | null;
  raw_direction: null | StoredRatingRecord['rawDirection'];
  rating: null | number;
  raw_decision: null | StoredRatingRecord['rawDecision'];
  review_tags: null | string[];
  review_text: null | string;
  status: RatingInput['status'];
  user_id?: string;
  [key: string]: boolean | null | number | string | string[] | undefined;
}

interface SupabaseRecommendationExclusionRow {
  movie_id: string;
  reason: null | string;
  user_id?: string;
  [key: string]: boolean | null | number | string | string[] | undefined;
}

interface SupabaseRecommendationContextRow {
  active_situation: ActiveSituation | null;
  active_situation_updated_at: null | string;
  current_context: null | string;
  updated_at: null | string;
  user_id?: string;
  [key: string]: unknown;
}

let hasRatingHistoryTable: boolean | null = null;
let supportsActiveSituationColumns: boolean | null = null;
let supportsRatingsRawDirectionColumn: boolean | null = null;
let supportsRatingHistoryRawDirectionColumn: boolean | null = null;

const isRemoteSyncEnabled = (userId: string) => isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getSupabaseErrorCode = (error: unknown) =>
  error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : '';

const getSupabaseErrorMessage = (error: unknown) =>
  error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message
    : '';

const isMissingSupabaseTableError = (error: unknown, tableName: string) =>
  getSupabaseErrorCode(error) === 'PGRST205' &&
  getSupabaseErrorMessage(error).includes(`'public.${tableName}'`);

const isMissingSupabaseColumnError = (error: unknown, tableName: string, columnName: string) =>
  (getSupabaseErrorCode(error) === '42703' || getSupabaseErrorCode(error) === 'PGRST204') &&
  getSupabaseErrorMessage(error).includes(columnName) &&
  getSupabaseErrorMessage(error).includes(tableName);

const buildSupabaseRatingSelectColumns = (userColumn: string, includeRawDirection: boolean) =>
  [
    userColumn,
    'movie_id',
    'status',
    'rating',
    'review_tags',
    'favorite_character',
    'answered_at',
    'raw_decision',
    ...(includeRawDirection ? ['raw_direction'] : []),
    'detail_completed',
    'review_text',
    'question_text'
  ].join(', ');

const getRowUserId = (
  row: SupabaseRatingRow | SupabaseRecommendationExclusionRow | SupabaseRecommendationContextRow,
  userColumn: string
) => {
  const value = row[userColumn];
  return typeof value === 'string' && value.length > 0 ? value : row.user_id ?? '';
};

const deserializeFavoriteCharacters = (value: null | string) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return normalizeFavoriteCharacters(parsed);
    }
  } catch {
    // Fall through to legacy single-value support.
  }

  return normalizeFavoriteCharacters(value);
};

const serializeFavoriteCharacters = (favoriteCharacters: readonly string[]) => {
  const normalized = normalizeFavoriteCharacters(favoriteCharacters);
  return normalized.length > 0 ? JSON.stringify(normalized) : null;
};

const normalizeSupabaseRatingRow = (
  row: SupabaseRatingRow,
  userColumn = supabaseRatingsUserColumn
): StoredRatingRecord => ({
  rawDecision: row.raw_decision ?? row.status,
  rawDirection: row.raw_direction ?? null,
  detailCompleted: row.detail_completed ?? row.status !== 'like',
  input: {
    movieId: row.movie_id,
    userId: getRowUserId(row, userColumn),
    status: row.status,
    rating: row.rating,
    reviewTags: (row.review_tags ?? []) as RatingInput['reviewTags'],
    favoriteCharacters: deserializeFavoriteCharacters(row.favorite_character),
    answeredAt: row.answered_at ?? new Date(0).toISOString()
  },
  reviewText: row.review_text ?? '',
  questionText: row.question_text ?? ''
});

const serializeSupabaseRatingRow = (
  userId: string,
  rating: StoredRatingRecord,
  userColumn = supabaseRatingsUserColumn,
  includeRawDirection = true
): Record<string, boolean | null | number | string | string[]> => {
  const row: Record<string, boolean | null | number | string | string[]> = {
    [userColumn]: userId,
    movie_id: rating.input.movieId,
    status: rating.input.status,
    rating: rating.input.rating,
    review_tags: [...rating.input.reviewTags],
    favorite_character: serializeFavoriteCharacters(rating.input.favoriteCharacters),
    answered_at: rating.input.answeredAt,
    raw_decision: rating.rawDecision,
    detail_completed: rating.detailCompleted,
    review_text: rating.reviewText,
    question_text: rating.questionText
  };

  if (includeRawDirection) {
    row.raw_direction = rating.rawDirection;
  }

  return row;
};

const serializeRecommendationExclusionRow = (userId: string, movieId: string) => ({
  [supabaseRecommendationExclusionsUserColumn]: userId,
  movie_id: movieId,
  reason: ALREADY_SEEN_REASON
});

const serializeRecommendationContextRow = (snapshot: RecommendationStateSnapshot) => ({
  [supabaseRecommendationContextUserColumn]: snapshot.userId,
  current_context: 'normal',
  updated_at: snapshot.activeSituationUpdatedAt,
  active_situation: snapshot.activeSituation,
  active_situation_updated_at: snapshot.activeSituationUpdatedAt
});

const serializeLegacyRecommendationContextRow = (snapshot: RecommendationStateSnapshot) => ({
  [supabaseRecommendationContextUserColumn]: snapshot.userId,
  current_context: 'normal',
  updated_at: snapshot.activeSituationUpdatedAt
});

export const localRecommendationRepository: RecommendationRepository = {
  load(userId) {
    if (!isClient()) {
      return null;
    }

    const raw = window.localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as RecommendationStateSnapshot;
    } catch {
      return null;
    }
  },
  save(snapshot) {
    if (!isClient()) {
      return;
    }

    window.localStorage.setItem(getStorageKey(snapshot.userId), JSON.stringify(snapshot));
  },
  clear(userId) {
    if (!isClient()) {
      return;
    }

    const existing = this.load(userId);

    if (!existing) {
      window.localStorage.removeItem(getStorageKey(userId));
      return;
    }

    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify({
        ...existing,
        profile: {
          userId,
          genreScores: {},
          tagScores: {},
          reviewTagScores: {},
          characterScores: {},
          totalRatings: 0
        },
        ratings: [],
        additionalTasteAnalysisBatches: [],
        ratingResumeSurface: existing.ratingResumeSurface ?? 'primary',
        dismissedRecommendationMovieIds: [],
        recommendationImpressions: existing.recommendationImpressions ?? [],
        selectedTasteAnalysisGenres: existing.selectedTasteAnalysisGenres ?? [],
        activeSituation: existing.activeSituation ?? { kind: 'none' },
        activeSituationUpdatedAt:
          existing.activeSituationUpdatedAt ?? new Date(0).toISOString()
      } satisfies RecommendationStateSnapshot)
    );
  }
};

const parseRatingHistorySnapshot = (userId: string, raw: string): RatingHistorySnapshot | null => {
  try {
    const parsed = JSON.parse(raw) as StoredRatingRecord[] | RatingHistorySnapshot | null;

    if (Array.isArray(parsed)) {
      return {
        userId,
        ratings: parsed
      };
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.ratings) &&
      typeof parsed.userId === 'string'
    ) {
      return {
        userId,
        ratings: parsed.ratings
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const localRatingHistoryRepository = {
  load(userId: string): StoredRatingRecord[] | null {
    if (!isClient()) {
      return null;
    }

    const raw = window.localStorage.getItem(getRatingHistoryStorageKey(userId));

    if (!raw) {
      return null;
    }

    return parseRatingHistorySnapshot(userId, raw)?.ratings ?? null;
  },
  save(userId: string, ratings: readonly StoredRatingRecord[]) {
    if (!isClient()) {
      return;
    }

    const snapshot: RatingHistorySnapshot = {
      userId,
      ratings: [...ratings]
    };

    window.localStorage.setItem(getRatingHistoryStorageKey(userId), JSON.stringify(snapshot));
  }
};

export const remoteRecommendationRepository = {
  async load(userId: string): Promise<RecommendationStateSnapshot | null> {
    if (!isRemoteSyncEnabled(userId)) {
      return null;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;
    const exclusionsRelation = getSupabaseRecommendationExclusionsRelation() as any;
    const contextRelation = getSupabaseRecommendationContextRelation() as any;

    if (!ratingsRelation || !exclusionsRelation || !contextRelation) {
      return null;
    }

    const shouldReadRatingsRawDirection = supportsRatingsRawDirectionColumn !== false;
    let {
      data: ratingsData,
      error: ratingsError
    } = await ratingsRelation
      .select(buildSupabaseRatingSelectColumns(supabaseRatingsUserColumn, shouldReadRatingsRawDirection))
      .eq(supabaseRatingsUserColumn, userId)
      .order('answered_at', { ascending: true });

    if (
      ratingsError &&
      shouldReadRatingsRawDirection &&
      isMissingSupabaseColumnError(ratingsError, 'ratings', 'raw_direction')
    ) {
      supportsRatingsRawDirectionColumn = false;
      ({
        data: ratingsData,
        error: ratingsError
      } = await ratingsRelation
        .select(buildSupabaseRatingSelectColumns(supabaseRatingsUserColumn, false))
        .eq(supabaseRatingsUserColumn, userId)
        .order('answered_at', { ascending: true }));
    } else if (!ratingsError && shouldReadRatingsRawDirection) {
      supportsRatingsRawDirectionColumn = true;
    }

    const { data: exclusionsData, error: exclusionsError } = await exclusionsRelation
      .select([supabaseRecommendationExclusionsUserColumn, 'movie_id', 'reason'].join(', '))
      .eq(supabaseRecommendationExclusionsUserColumn, userId)
      .eq('reason', ALREADY_SEEN_REASON);

    const shouldReadActiveSituation = supportsActiveSituationColumns !== false;
    let { data: contextData, error: contextError } = await contextRelation
      .select(
        [
          supabaseRecommendationContextUserColumn,
          'current_context',
          'updated_at',
          ...(shouldReadActiveSituation ? ['active_situation', 'active_situation_updated_at'] : [])
        ].join(', ')
      )
      .eq(supabaseRecommendationContextUserColumn, userId)
      .maybeSingle();

    if (
      contextError &&
      shouldReadActiveSituation &&
      (isMissingSupabaseColumnError(
        contextError,
        'recommendation_context_settings',
        'active_situation'
      ) ||
        isMissingSupabaseColumnError(
          contextError,
          'recommendation_context_settings',
          'active_situation_updated_at'
        ))
    ) {
      supportsActiveSituationColumns = false;
      ({ data: contextData, error: contextError } = await contextRelation
        .select([supabaseRecommendationContextUserColumn, 'current_context', 'updated_at'].join(', '))
        .eq(supabaseRecommendationContextUserColumn, userId)
        .maybeSingle());
    } else if (!contextError && shouldReadActiveSituation) {
      supportsActiveSituationColumns = true;
    }

    if (ratingsError) {
      throw ratingsError;
    }

    if (exclusionsError) {
      throw exclusionsError;
    }

    if (contextError) {
      throw contextError;
    }

    const contextRow = contextData as SupabaseRecommendationContextRow | null;

    return {
      userId,
      profile: {
        userId,
        genreScores: {},
        tagScores: {},
        reviewTagScores: {},
        characterScores: {},
        totalRatings: 0
      },
      ratings: ((ratingsData ?? []) as unknown as SupabaseRatingRow[]).map((row) =>
        normalizeSupabaseRatingRow(row, supabaseRatingsUserColumn)
      ),
      additionalTasteAnalysisBatches: [],
      ratingResumeSurface: 'primary',
      dismissedRecommendationMovieIds: ((exclusionsData ?? []) as unknown as SupabaseRecommendationExclusionRow[])
        .filter((row) => row.reason === ALREADY_SEEN_REASON)
        .map((row) => row.movie_id),
      recommendationImpressions: [],
      selectedTasteAnalysisGenres: [],
      activeSituation: contextRow?.active_situation ?? { kind: 'none' },
      activeSituationUpdatedAt:
        contextRow?.active_situation_updated_at ?? new Date(0).toISOString()
    };
  },
  async save(snapshot: RecommendationStateSnapshot): Promise<void> {
    if (!isRemoteSyncEnabled(snapshot.userId)) {
      return;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;
    const exclusionsRelation = getSupabaseRecommendationExclusionsRelation() as any;
    const contextRelation = getSupabaseRecommendationContextRelation() as any;

    if (!ratingsRelation || !exclusionsRelation || !contextRelation) {
      return;
    }

    const shouldWriteRatingsRawDirection = supportsRatingsRawDirectionColumn !== false;
    let ratingsPayload = snapshot.ratings.map((rating) =>
      serializeSupabaseRatingRow(
        snapshot.userId,
        rating,
        supabaseRatingsUserColumn,
        shouldWriteRatingsRawDirection
      )
    );
    const exclusionsPayload = snapshot.dismissedRecommendationMovieIds.map((movieId) =>
      serializeRecommendationExclusionRow(snapshot.userId, movieId)
    );

    if (ratingsPayload.length > 0) {
      let { error: ratingsSaveError } = await ratingsRelation.upsert(ratingsPayload, {
        onConflict: `${supabaseRatingsUserColumn},movie_id`
      });

      if (
        ratingsSaveError &&
        shouldWriteRatingsRawDirection &&
        isMissingSupabaseColumnError(ratingsSaveError, 'ratings', 'raw_direction')
      ) {
        supportsRatingsRawDirectionColumn = false;
        ratingsPayload = snapshot.ratings.map((rating) =>
          serializeSupabaseRatingRow(snapshot.userId, rating, supabaseRatingsUserColumn, false)
        );
        ({ error: ratingsSaveError } = await ratingsRelation.upsert(ratingsPayload, {
          onConflict: `${supabaseRatingsUserColumn},movie_id`
        }));
      } else if (!ratingsSaveError && shouldWriteRatingsRawDirection) {
        supportsRatingsRawDirectionColumn = true;
      }

      if (ratingsSaveError) {
        throw ratingsSaveError;
      }
    }

    const { error: exclusionsDeleteError } = await exclusionsRelation
      .delete()
      .eq(supabaseRecommendationExclusionsUserColumn, snapshot.userId)
      .eq('reason', ALREADY_SEEN_REASON);

    if (exclusionsDeleteError) {
      throw exclusionsDeleteError;
    }

    if (exclusionsPayload.length > 0) {
      const { error: exclusionsInsertError } = await exclusionsRelation.insert(exclusionsPayload);

      if (exclusionsInsertError) {
        throw exclusionsInsertError;
      }
    }

    const shouldWriteActiveSituation = supportsActiveSituationColumns !== false;
    let { error: contextSaveError } = await contextRelation.upsert(
      shouldWriteActiveSituation
        ? serializeRecommendationContextRow(snapshot)
        : serializeLegacyRecommendationContextRow(snapshot),
      {
        onConflict: supabaseRecommendationContextUserColumn
      }
    );

    if (
      contextSaveError &&
      shouldWriteActiveSituation &&
      (isMissingSupabaseColumnError(
        contextSaveError,
        'recommendation_context_settings',
        'active_situation'
      ) ||
        isMissingSupabaseColumnError(
          contextSaveError,
          'recommendation_context_settings',
          'active_situation_updated_at'
        ))
    ) {
      supportsActiveSituationColumns = false;
      ({ error: contextSaveError } = await contextRelation.upsert(
        serializeLegacyRecommendationContextRow(snapshot),
        {
          onConflict: supabaseRecommendationContextUserColumn
        }
      ));
    } else if (!contextSaveError && shouldWriteActiveSituation) {
      supportsActiveSituationColumns = true;
    }

    if (contextSaveError) {
      throw contextSaveError;
    }
  },
  async deleteRatings(userId: string, movieIds: readonly string[]): Promise<void> {
    if (!isRemoteSyncEnabled(userId) || movieIds.length === 0) {
      return;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;

    if (!ratingsRelation) {
      return;
    }

    const { error } = await ratingsRelation
      .delete()
      .eq(supabaseRatingsUserColumn, userId)
      .in('movie_id', [...new Set(movieIds)]);

    if (error) {
      throw error;
    }
  },
  async clear(userId: string): Promise<void> {
    if (!isRemoteSyncEnabled(userId)) {
      return;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;
    const exclusionsRelation = getSupabaseRecommendationExclusionsRelation() as any;

    if (!ratingsRelation || !exclusionsRelation) {
      return;
    }

    const { error: ratingsDeleteError } = await ratingsRelation.delete().eq(supabaseRatingsUserColumn, userId);

    if (ratingsDeleteError) {
      throw ratingsDeleteError;
    }

    const { error: exclusionsDeleteError } = await exclusionsRelation
      .delete()
      .eq(supabaseRecommendationExclusionsUserColumn, userId)
      .eq('reason', ALREADY_SEEN_REASON);

    if (exclusionsDeleteError) {
      throw exclusionsDeleteError;
    }
  }
};

export const remoteRatingHistoryRepository = {
  async load(userId: string): Promise<StoredRatingRecord[]> {
    if (!isRemoteSyncEnabled(userId)) {
      return [];
    }

    if (hasRatingHistoryTable === false) {
      return [];
    }

    const ratingHistoryRelation = getSupabaseRatingHistoryRelation() as any;

    if (!ratingHistoryRelation) {
      return [];
    }

    const shouldReadRatingHistoryRawDirection = supportsRatingHistoryRawDirectionColumn !== false;
    let { data, error } = await ratingHistoryRelation
      .select(
        buildSupabaseRatingSelectColumns(
          supabaseRatingHistoryUserColumn,
          shouldReadRatingHistoryRawDirection
        )
      )
      .eq(supabaseRatingHistoryUserColumn, userId)
      .order('answered_at', { ascending: true });

    if (error && isMissingSupabaseTableError(error, 'rating_history')) {
      hasRatingHistoryTable = false;
      return [];
    }

    if (
      error &&
      shouldReadRatingHistoryRawDirection &&
      isMissingSupabaseColumnError(error, 'rating_history', 'raw_direction')
    ) {
      supportsRatingHistoryRawDirectionColumn = false;
      ({ data, error } = await ratingHistoryRelation
        .select(buildSupabaseRatingSelectColumns(supabaseRatingHistoryUserColumn, false))
        .eq(supabaseRatingHistoryUserColumn, userId)
        .order('answered_at', { ascending: true }));
    } else if (!error && shouldReadRatingHistoryRawDirection) {
      supportsRatingHistoryRawDirectionColumn = true;
    }

    if (error && isMissingSupabaseTableError(error, 'rating_history')) {
      hasRatingHistoryTable = false;
      return [];
    }

    if (error) {
      throw error;
    }

    hasRatingHistoryTable = true;

    return ((data ?? []) as unknown as SupabaseRatingRow[]).map((row) =>
      normalizeSupabaseRatingRow(row, supabaseRatingHistoryUserColumn)
    );
  },
  async save(userId: string, ratings: readonly StoredRatingRecord[]): Promise<void> {
    if (!isRemoteSyncEnabled(userId) || ratings.length === 0) {
      return;
    }

    if (hasRatingHistoryTable === false) {
      return;
    }

    const ratingHistoryRelation = getSupabaseRatingHistoryRelation() as any;

    if (!ratingHistoryRelation) {
      return;
    }

    const shouldWriteRatingHistoryRawDirection = supportsRatingHistoryRawDirectionColumn !== false;
    let payload = ratings.map((rating) =>
      serializeSupabaseRatingRow(
        userId,
        rating,
        supabaseRatingHistoryUserColumn,
        shouldWriteRatingHistoryRawDirection
      )
    );
    let { error } = await ratingHistoryRelation.upsert(payload, {
      onConflict: `${supabaseRatingHistoryUserColumn},movie_id`
    });

    if (error && isMissingSupabaseTableError(error, 'rating_history')) {
      hasRatingHistoryTable = false;
      return;
    }

    if (
      error &&
      shouldWriteRatingHistoryRawDirection &&
      isMissingSupabaseColumnError(error, 'rating_history', 'raw_direction')
    ) {
      supportsRatingHistoryRawDirectionColumn = false;
      payload = ratings.map((rating) =>
        serializeSupabaseRatingRow(userId, rating, supabaseRatingHistoryUserColumn, false)
      );
      ({ error } = await ratingHistoryRelation.upsert(payload, {
        onConflict: `${supabaseRatingHistoryUserColumn},movie_id`
      }));
    } else if (!error && shouldWriteRatingHistoryRawDirection) {
      supportsRatingHistoryRawDirectionColumn = true;
    }

    if (error && isMissingSupabaseTableError(error, 'rating_history')) {
      hasRatingHistoryTable = false;
      return;
    }

    if (error) {
      throw error;
    }

    hasRatingHistoryTable = true;
  }
};
