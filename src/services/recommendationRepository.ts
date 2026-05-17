import {
  getSupabaseRecommendationExclusionsRelation,
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabaseRecommendationExclusionsUserColumn,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import type { RecommendationStateSnapshot, StoredRatingRecord } from '@/types/recommendation';
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

const isRemoteSyncEnabled = (userId: string) => isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getRowUserId = (
  row: SupabaseRatingRow | SupabaseRecommendationExclusionRow,
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

    window.localStorage.removeItem(getStorageKey(userId));
  }
};

export const remoteRecommendationRepository = {
  async load(userId: string): Promise<RecommendationStateSnapshot | null> {
    if (!isRemoteSyncEnabled(userId)) {
      return null;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;
    const exclusionsRelation = getSupabaseRecommendationExclusionsRelation() as any;

    if (!ratingsRelation || !exclusionsRelation) {
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

    if (ratingsError) {
      throw ratingsError;
    }

    if (exclusionsError) {
      throw exclusionsError;
    }

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
        .map((row) => row.movie_id)
    };
  },
  async save(snapshot: RecommendationStateSnapshot): Promise<void> {
    if (!isRemoteSyncEnabled(snapshot.userId)) {
      return;
    }

    const ratingsRelation = getSupabaseRatingsRelation() as any;
    const exclusionsRelation = getSupabaseRecommendationExclusionsRelation() as any;

    if (!ratingsRelation || !exclusionsRelation) {
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
