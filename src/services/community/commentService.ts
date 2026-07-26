import { getCommunityCommentsRelation, getCommunityProfilesRelation, isSupabaseConfigured } from '@/lib/supabase';
import type { CommunityComment, CommunityProfile } from '@/types/community';

type Row = Record<string, any>;

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !getCommunityCommentsRelation()) throw new Error('Supabase 연결이 필요합니다.');
};

const toComment = (row: Row, profile?: Row): CommunityComment => ({
  id: String(row.id), postId: String(row.post_id), userId: String(row.user_id), content: String(row.content ?? ''),
  createdAt: String(row.created_at ?? ''), updatedAt: String(row.updated_at ?? ''),
  author: { id: String(row.user_id), nickname: String(profile?.nickname ?? '영화 친구'), avatarUrl: typeof profile?.avatar_url === 'string' ? profile.avatar_url : null }
});

export const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
  ensureConfigured();
  const { data, error } = await getCommunityCommentsRelation()!.select('*').eq('post_id', postId).order('created_at');
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const userIds = [...new Set(rows.map((row) => String(row.user_id)))];
  const profiles = getCommunityProfilesRelation();
  const { data: profileRows, error: profileError } = userIds.length && profiles
    ? await profiles.select('id, nickname, avatar_url').in('id', userIds)
    : { data: [], error: null };
  if (profileError) throw profileError;
  const profileMap = new Map(((profileRows ?? []) as Row[]).map((row) => [String(row.id), row]));
  return rows.map((row) => toComment(row, profileMap.get(String(row.user_id))));
};

export const createComment = async (postId: string, userId: string, content: string) => {
  ensureConfigured();
  const { data, error } = await getCommunityCommentsRelation()!
    .insert({ post_id: postId, user_id: userId, content: content.trim() })
    .select('*').single();
  if (error) throw error;
  const { data: profile } = await getCommunityProfilesRelation()!.select('*').eq('id', userId).maybeSingle();
  return toComment(data as Row, profile as Row | undefined);
};

export const deleteComment = async (commentId: string) => {
  ensureConfigured();
  const { error } = await getCommunityCommentsRelation()!.delete().eq('id', commentId);
  if (error) throw error;
};
