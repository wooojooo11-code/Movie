import { getCommunityPollOptionsRelation, getCommunityPollVotesRelation, isSupabaseConfigured } from '@/lib/supabase';

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !getCommunityPollVotesRelation()) throw new Error('Supabase 연결이 필요합니다.');
};

/** 투표는 unique(poll_id, user_id) 제약을 이용해 한 표만 유지합니다. */
export const castPollVote = async (pollId: string, optionId: string, userId: string) => {
  ensureConfigured();
  const { error } = await getCommunityPollVotesRelation()!
    .upsert({ poll_id: pollId, option_id: optionId, user_id: userId }, { onConflict: 'poll_id,user_id' });
  if (error) throw error;
};

export const clearPollVote = async (pollId: string, userId: string) => {
  ensureConfigured();
  const { error } = await getCommunityPollVotesRelation()!.delete().eq('poll_id', pollId).eq('user_id', userId);
  if (error) throw error;
};

export const fetchPollOptionCounts = async (pollId: string) => {
  ensureConfigured();
  const { data, error } = await getCommunityPollOptionsRelation()!.select('id, vote_count').eq('poll_id', pollId);
  if (error) throw error;
  return new Map((data ?? []).map((row: any) => [String(row.id), Number(row.vote_count ?? 0)]));
};
