import {
  getSupabaseRatingsRelation,
  isSupabaseConfigured,
  supabaseRatingsUserColumn
} from '@/lib/supabase';
import type { RecommendationStateSnapshot, StoredRatingRecord } from '@/types/recommendation';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';

const STORAGE_PREFIX = 'movielist:recommendation-state';

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}:${userId}`;

export interface RecommendationRepository {
  load(userId: string): RecommendationStateSnapshot | null;
  save(snapshot: RecommendationStateSnapshot): void;
  clear(userId: string): void;
}

interface SupabaseRatingRow {
  answered_at: string | null;
  detail_completed: boolean | null;
  favorite_character: string | null;
  movie_id: string;
  question_text: string | null;
  rating: number | null;
  raw_decision: StoredRatingRecord['rawDecision'] | null;
  review_tags: string[] | null;
  review_text: string | null;
  status: RatingInput['status'];
  user_id?: string;
  [key: string]: boolean | null | number | string | string[] | undefined;
}

const isRemoteSyncEnabled = (userId: string) => isSupabaseConfigured && Boolean(userId) && userId !== 'guest-user';

const getRowUserId = (row: SupabaseRatingRow) => {
  const value = row[supabaseRatingsUserColumn];
  return typeof value === 'string' && value.length > 0 ? value : row.user_id ?? '';
};

const normalizeSupabaseRatingRow = (row: SupabaseRatingRow): StoredRatingRecord => ({
  rawDecision: row.raw_decision ?? row.status,
  detailCompleted: row.detail_completed ?? row.status !== 'like',
  input: {
    movieId: row.movie_id,
    userId: getRowUserId(row),
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

    const relation = getSupabaseRatingsRelation();

    if (!relation) {
      return null;
    }

    const { data, error } = await relation
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

    if (error) {
      throw error;
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
      ratings: ((data ?? []) as unknown as SupabaseRatingRow[]).map(normalizeSupabaseRatingRow),
      dismissedRecommendationMovieIds: []
    };
  },
  async save(snapshot: RecommendationStateSnapshot): Promise<void> {
    if (!isRemoteSyncEnabled(snapshot.userId)) {
      return;
    }

    const relation = getSupabaseRatingsRelation();

    if (!relation) {
      return;
    }

    const payload = snapshot.ratings.map((rating) => serializeSupabaseRatingRow(snapshot.userId, rating));

    if (payload.length === 0) {
      return;
    }

    const { error } = await relation.upsert(payload, {
      onConflict: `${supabaseRatingsUserColumn},movie_id`
    });

    if (error) {
      throw error;
    }
  },
  async clear(userId: string): Promise<void> {
    if (!isRemoteSyncEnabled(userId)) {
      return;
    }

    const relation = getSupabaseRatingsRelation();

    if (!relation) {
      return;
    }

    const { error } = await relation.delete().eq(supabaseRatingsUserColumn, userId);

    if (error) {
      throw error;
    }
  }
};
