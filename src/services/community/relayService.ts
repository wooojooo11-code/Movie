import { getCommunityProfilesRelation, getRecommendationRelaysRelation, isSupabaseConfigured } from '@/lib/supabase';
import type { CommunityMovieReference, CommunityProfile } from '@/types/community';
import type { RecommendationRelay } from '@/types/relay';

type Row = Record<string, any>;

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !getRecommendationRelaysRelation()) throw new Error('Supabase 연결이 필요합니다.');
};

const toMovie = (row: Row): CommunityMovieReference => ({
  id: Number(row.movie_id), title: String(row.movie_title), posterPath: typeof row.movie_poster_path === 'string' ? row.movie_poster_path : null
});

export const fetchRecommendationRelays = async (postId: string): Promise<RecommendationRelay[]> => {
  ensureConfigured();
  const { data, error } = await getRecommendationRelaysRelation()!.select('*').eq('post_id', postId).order('created_at');
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const userIds = [...new Set(rows.map((row) => String(row.user_id)))];
  const { data: profiles, error: profileError } = userIds.length
    ? await getCommunityProfilesRelation()!.select('id, nickname, avatar_url').in('id', userIds)
    : { data: [], error: null };
  if (profileError) throw profileError;
  const profileMap = new Map(((profiles ?? []) as Row[]).map((profile) => [String(profile.id), profile]));
  return rows.map((row) => {
    const profile = profileMap.get(String(row.user_id));
    return {
      id: String(row.id), postId: String(row.post_id), parentRelayId: typeof row.parent_relay_id === 'string' ? row.parent_relay_id : null,
      movie: toMovie(row), author: { id: String(row.user_id), nickname: String(profile?.nickname ?? '영화 친구'), avatarUrl: typeof profile?.avatar_url === 'string' ? profile.avatar_url : null },
      reason: String(row.reason ?? ''), createdAt: String(row.created_at ?? '')
    };
  });
};

export const createRecommendationRelay = async (input: { postId: string; parentRelayId: null | string; movie: CommunityMovieReference; userId: string; reason: string }) => {
  ensureConfigured();
  const { error } = await getRecommendationRelaysRelation()!.insert({
    post_id: input.postId, parent_relay_id: input.parentRelayId, movie_id: input.movie.id, movie_title: input.movie.title,
    movie_poster_path: input.movie.posterPath, user_id: input.userId, reason: input.reason.trim()
  });
  if (error) throw error;
};

export const deleteRecommendationRelay = async (relayId: string) => {
  ensureConfigured();
  const { error } = await getRecommendationRelaysRelation()!.delete().eq('id', relayId);
  if (error) throw error;
};
