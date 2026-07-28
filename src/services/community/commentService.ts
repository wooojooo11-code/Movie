import { getCommunityCommentsRelation, getCommunityProfilesRelation, isSupabaseConfigured } from '@/lib/supabase';
import type { CommunityComment, CommunityMovieReference } from '@/types/community';

type Row = Record<string, any>;
type CommentInput = { content: string; movie: null | CommunityMovieReference };

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !getCommunityCommentsRelation()) throw new Error('Supabase 연결 설정이 필요합니다.');
};

const toMovie = (row: Row): null | CommunityMovieReference => {
  const id = typeof row.movie_id === 'string' ? row.movie_id : null;
  const title = typeof row.movie_title === 'string' ? row.movie_title : null;
  return id && title ? { id, title, posterPath: typeof row.movie_poster_path === 'string' ? row.movie_poster_path : null } : null;
};

const toComment = (row: Row, profile?: Row): CommunityComment => ({
  id: String(row.id),
  postId: String(row.post_id),
  userId: String(row.user_id),
  content: String(row.content ?? ''),
  movie: toMovie(row),
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
  author: {
    id: String(row.user_id),
    nickname: String(profile?.nickname ?? '영화 친구'),
    avatarUrl: typeof profile?.avatar_url === 'string' ? profile.avatar_url : null
  }
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

export const createComment = async (postId: string, userId: string, input: CommentInput) => {
  ensureConfigured();
  const payload: Record<string, unknown> = {
    post_id: postId,
    user_id: userId,
    content: input.content.trim()
  };

  // 일반 댓글은 새 SQL 적용 전에도 기존 열만 사용해 계속 작성할 수 있습니다.
  if (input.movie) {
    payload.movie_id = input.movie.id;
    payload.movie_title = input.movie.title;
    payload.movie_poster_path = input.movie.posterPath;
  }

  const { data, error } = await getCommunityCommentsRelation()!
    .insert(payload)
    .select('*')
    .single();
  if (error) {
    if (input.movie && (error.code === '42703' || error.code === 'PGRST204')) {
      throw new Error('다음 영화 추천 댓글을 사용하려면 최신 커뮤니티 SQL을 먼저 실행해 주세요.');
    }
    throw error;
  }
  const { data: profile } = await getCommunityProfilesRelation()!.select('*').eq('id', userId).maybeSingle();
  return toComment(data as Row, profile as Row | undefined);
};

export const deleteComment = async (commentId: string) => {
  ensureConfigured();
  const { error } = await getCommunityCommentsRelation()!.delete().eq('id', commentId);
  if (error) throw error;
};
