import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseAuthStorageKey = isSupabaseConfigured
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : '';
export const supabaseRatingsSchema = import.meta.env.VITE_SUPABASE_RATINGS_SCHEMA?.trim() || 'public';
export const supabaseRatingsTable = import.meta.env.VITE_SUPABASE_RATINGS_TABLE?.trim() || 'ratings';
export const supabaseRatingsUserColumn =
  import.meta.env.VITE_SUPABASE_RATINGS_USER_COLUMN?.trim() || 'user_id';
export const supabaseRatingHistorySchema =
  import.meta.env.VITE_SUPABASE_RATING_HISTORY_SCHEMA?.trim() || 'public';
export const supabaseRatingHistoryTable =
  import.meta.env.VITE_SUPABASE_RATING_HISTORY_TABLE?.trim() || 'rating_history';
export const supabaseRatingHistoryUserColumn =
  import.meta.env.VITE_SUPABASE_RATING_HISTORY_USER_COLUMN?.trim() || 'user_id';
export const supabaseRecommendationExclusionsSchema =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_SCHEMA?.trim() || 'public';
export const supabaseRecommendationExclusionsTable =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_TABLE?.trim() || 'recommendation_exclusions';
export const supabaseRecommendationExclusionsUserColumn =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_USER_COLUMN?.trim() || 'user_id';
export const supabaseRecommendationContextSchema =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_CONTEXT_SCHEMA?.trim() || 'public';
export const supabaseRecommendationContextTable =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_CONTEXT_TABLE?.trim() || 'recommendation_context_settings';
export const supabaseRecommendationContextUserColumn =
  import.meta.env.VITE_SUPABASE_RECOMMENDATION_CONTEXT_USER_COLUMN?.trim() || 'user_id';
export const supabaseUserListsSchema = import.meta.env.VITE_SUPABASE_USER_LISTS_SCHEMA?.trim() || 'public';
export const supabaseUserListsTable =
  import.meta.env.VITE_SUPABASE_USER_LISTS_TABLE?.trim() || 'user_lists';
export const supabaseUserListsUserColumn =
  import.meta.env.VITE_SUPABASE_USER_LISTS_USER_COLUMN?.trim() || 'user_id';
export const supabaseListInteractionsSchema =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_SCHEMA?.trim() || 'public';
export const supabaseListInteractionsTable =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_TABLE?.trim() || 'list_interactions';
export const supabaseListInteractionsUserColumn =
  import.meta.env.VITE_SUPABASE_LIST_INTERACTIONS_USER_COLUMN?.trim() || 'user_id';
export const supabaseMovieLibrarySchema = import.meta.env.VITE_SUPABASE_MOVIE_LIBRARY_SCHEMA?.trim() || 'public';
export const supabaseMovieLibraryTable =
  import.meta.env.VITE_SUPABASE_MOVIE_LIBRARY_TABLE?.trim() || 'movie_library_items';
export const supabaseMovieLibraryUserColumn =
  import.meta.env.VITE_SUPABASE_MOVIE_LIBRARY_USER_COLUMN?.trim() || 'user_id';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;

export const getSupabaseRatingsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseRatingsSchema).from(supabaseRatingsTable);
};

export const getSupabaseRatingHistoryRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseRatingHistorySchema).from(supabaseRatingHistoryTable);
};

export const getSupabaseRecommendationExclusionsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseRecommendationExclusionsSchema).from(supabaseRecommendationExclusionsTable);
};

export const getSupabaseRecommendationContextRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseRecommendationContextSchema).from(supabaseRecommendationContextTable);
};

export const getSupabaseUserListsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseUserListsSchema).from(supabaseUserListsTable);
};

export const getSupabaseListInteractionsRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseListInteractionsSchema).from(supabaseListInteractionsTable);
};

export const getSupabaseMovieLibraryRelation = () => {
  if (!supabase) {
    return null;
  }

  return supabase.schema(supabaseMovieLibrarySchema).from(supabaseMovieLibraryTable);
};

// 커뮤니티는 기존 공개(public) 스키마에 고정된 테이블명을 사용합니다.
// 환경변수를 늘리지 않아도 기존 Supabase 연결 정보만으로 동작하게 합니다.
const getCommunityRelation = (table: string) => (supabase ? supabase.from(table) : null);

export const getCommunityProfilesRelation = () => getCommunityRelation('community_profiles');
export const getCommunityPostsRelation = () => getCommunityRelation('community_posts');
export const getCommunityPostMoviesRelation = () => getCommunityRelation('community_post_movies');
export const getCommunityPostViewsRelation = () => getCommunityRelation('community_post_views');
export const getCommunityCommentsRelation = () => getCommunityRelation('community_comments');
export const getCommunityLikesRelation = () => getCommunityRelation('community_likes');
export const getCommunitySavesRelation = () => getCommunityRelation('community_saves');
export const getCommunityFollowsRelation = () => getCommunityRelation('community_follows');
export const getCommunityPollsRelation = () => getCommunityRelation('community_polls');
export const getCommunityPollOptionsRelation = () => getCommunityRelation('community_poll_options');
export const getCommunityPollVotesRelation = () => getCommunityRelation('community_poll_votes');
export const getRecommendationRelaysRelation = () => getCommunityRelation('recommendation_relays');
export const getDailyQuestionsRelation = () => getCommunityRelation('daily_questions');
export const getDailyQuestionAnswersRelation = () => getCommunityRelation('daily_question_answers');
export const getCommunityReportsRelation = () => getCommunityRelation('community_reports');

// Profile and title tables intentionally use fixed public names so they can be read by public profile URLs.
const getProfileRelation = (table: string) => (supabase ? supabase.from(table) : null);

export const getProfilesRelation = () => getProfileRelation('profiles');
export const getTitlesRelation = () => getProfileRelation('titles');
export const getUserTitlesRelation = () => getProfileRelation('user_titles');
export const getProfileDisplayTitlesRelation = () => getProfileRelation('profile_display_titles');
