import {
  getSupabaseRecommendationContextRelation,
  getSupabaseRecommendationContextWeightsRelation,
  getSupabaseRecommendationExclusionsRelation,
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabaseRecommendationContextUserColumn,
  supabaseRecommendationExclusionsUserColumn,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import type {
  MoodContext,
  RecommendationContextWeights,
  RecommendationStateSnapshot,
  StoredRatingRecord
} from '@/types/recommendation';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';

const STORAGE_PREFIX = 'movielist:recommendation-state';
const ALREADY_SEEN_REASON = 'already_seen';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export interface RecommendationRepository {
  load(userId: string): RecommendationStateSnapshot | null;
  save(snapshot: RecommendationStateSnapshot): void;
  clear(userId: string): void;
}

interface SupabaseRatingRow {
  answered_at: null | string;
  detail_completed: boolean | null;
  favorite_character: string | null;
  movie_id: string;
  question_text: string | null;
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
  current_context: null | RecommendationStateSnapshot['currentContext'];
  updated_at: null | string;
  user_id?: string;
  [key: string]: boolean | null | number | string | string[] | undefined;
}

interface SupabaseRecommendationContextWeightRow {
  context_key: null | MoodContext;
  genre_id: null | number;
  weight: null | number;
}

const isRemoteSyncEnabled = (userId: string) => isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getRowUserId = (
  row: SupabaseRatingRow | SupabaseRecommendationExclusionRow | SupabaseRecommendationContextRow,
  userColumn: string
) => {
  const value = row[userColumn];
  return typeof value === 'string' && value.length > 0 ? value : row.user_id ?? '';
};

const normalizeSupabaseRatingRow = (row: SupabaseRatingRow): StoredRatingRecord => ({
  rawDecision: row.raw_decision ?? row.status,
  detailCompleted: row.detail_completed ?? row.status !== 'like',
  input: {
    movieId: row.movie_id,
    userId: getRowUserId(row, supabaseRatingsUserColumn),
    status: row.status,
    rating: row.rating,
    reviewTags: (row.review_tags ?? []) as RatingInput['reviewTags'],
    favoriteCharacter: row.favorite_character,
    answeredAt: row.answered_at ?? new Date(0).toISOString()
  },
  reviewText: row.review_text ?? '',
  questionText: row.question_text ?? ''
});

const serializeSupabaseRatingRow = (
  userId: string,
  rating: StoredRatingRecord
): Record<string, boolean | null | number | string | string[]> => ({
  [supabaseRatingsUserColumn]: userId,
  movie_id: rating.input.movieId,
  status: rating.input.status,
  rating: rating.input.rating,
  review_tags: [...rating.input.reviewTags],
  favorite_character: rating.input.favoriteCharacter,
  answered_at: rating.input.answeredAt,
  raw_decision: rating.rawDecision,
  detail_completed: rating.detailCompleted,
  review_text: rating.reviewText,
  question_text: rating.questionText
});

const serializeRecommendationExclusionRow = (userId: string, movieId: string) => ({
  [supabaseRecommendationExclusionsUserColumn]: userId,
  movie_id: movieId,
  reason: ALREADY_SEEN_REASON
});

const serializeRecommendationContextRow = (snapshot: RecommendationStateSnapshot) => ({
  [supabaseRecommendationContextUserColumn]: snapshot.userId,
  current_context: snapshot.currentContext,
  updated_at: snapshot.currentContextUpdatedAt
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
        dismissedRecommendationMovieIds: []
      } satisfies RecommendationStateSnapshot)
    );
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

    const { data: ratingsData, error: ratingsError } = await ratingsRelation
      .select(
        [
          supabaseRatingsUserColumn,
          'movie_id',
          'status',
          'rating',
          'review_tags',
          'favorite_character',
          'answered_at',
          'raw_decision',
          'detail_completed',
          'review_text',
          'question_text'
        ].join(', ')
      )
      .eq(supabaseRatingsUserColumn, userId)
      .order('answered_at', { ascending: true });

    const { data: exclusionsData, error: exclusionsError } = await exclusionsRelation
      .select([supabaseRecommendationExclusionsUserColumn, 'movie_id', 'reason'].join(', '))
      .eq(supabaseRecommendationExclusionsUserColumn, userId)
      .eq('reason', ALREADY_SEEN_REASON);

    const { data: contextData, error: contextError } = await contextRelation
      .select([supabaseRecommendationContextUserColumn, 'current_context', 'updated_at'].join(', '))
      .eq(supabaseRecommendationContextUserColumn, userId)
      .maybeSingle();

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
      ratings: ((ratingsData ?? []) as unknown as SupabaseRatingRow[]).map(normalizeSupabaseRatingRow),
      dismissedRecommendationMovieIds: ((exclusionsData ?? []) as unknown as SupabaseRecommendationExclusionRow[])
        .filter((row) => row.reason === ALREADY_SEEN_REASON)
        .map((row) => row.movie_id),
      currentContext: contextRow?.current_context ?? 'normal',
      currentContextUpdatedAt: contextRow?.updated_at ?? new Date(0).toISOString()
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

    const ratingsPayload = snapshot.ratings.map((rating) => serializeSupabaseRatingRow(snapshot.userId, rating));
    const exclusionsPayload = snapshot.dismissedRecommendationMovieIds.map((movieId) =>
      serializeRecommendationExclusionRow(snapshot.userId, movieId)
    );

    if (ratingsPayload.length > 0) {
      const { error: ratingsSaveError } = await ratingsRelation.upsert(ratingsPayload, {
        onConflict: `${supabaseRatingsUserColumn},movie_id`
      });

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

    const { error: contextSaveError } = await contextRelation.upsert(
      serializeRecommendationContextRow(snapshot),
      {
        onConflict: supabaseRecommendationContextUserColumn
      }
    );

    if (contextSaveError) {
      throw contextSaveError;
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

const allowedContexts: MoodContext[] = [
  'normal',
  'after_exam',
  'bed_time',
  'with_friends',
  'after_academy'
];

export const remoteRecommendationContextWeightsRepository = {
  async load(): Promise<null | Partial<RecommendationContextWeights>> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const relation = getSupabaseRecommendationContextWeightsRelation() as any;

    if (!relation) {
      return null;
    }

    const { data, error } = await relation
      .select('context_key, genre_id, weight')
      .order('context_key', { ascending: true })
      .order('genre_id', { ascending: true });

    if (error) {
      throw error;
    }

    const groupedWeights: Partial<RecommendationContextWeights> = {};

    for (const row of (data ?? []) as SupabaseRecommendationContextWeightRow[]) {
      if (
        !row.context_key ||
        !allowedContexts.includes(row.context_key) ||
        typeof row.genre_id !== 'number' ||
        typeof row.weight !== 'number'
      ) {
        continue;
      }

      const contextWeights = groupedWeights[row.context_key] ?? {};
      contextWeights[row.genre_id] = row.weight;
      groupedWeights[row.context_key] = contextWeights;
    }

    return groupedWeights;
  }
};
