import { getCommunityReportsRelation, isSupabaseConfigured } from '@/lib/supabase';

export const reportCommunityPost = async (postId: string, userId: string, reason: string) => {
  if (!isSupabaseConfigured || !getCommunityReportsRelation()) throw new Error('Supabase 연결이 필요합니다.');
  const { error } = await getCommunityReportsRelation()!.insert({ post_id: postId, reporter_id: userId, reason: reason.trim() || 'inappropriate' });
  if (error) {
    if ((error as { code?: string }).code === '23505') throw new Error('이미 신고한 게시글입니다.');
    throw error;
  }
};
