import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const DELETE_ACCOUNT_CONFIRMATION = '회원탈퇴';

const isDeletedResponse = (value: unknown): value is { deleted: true } =>
  value !== null &&
  typeof value === 'object' &&
  'deleted' in value &&
  (value as { deleted?: unknown }).deleted === true;

export const deleteCurrentAccount = async (confirmation: string) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('회원 탈퇴 기능을 사용하려면 Supabase 연결이 필요합니다.');
  }

  if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    throw new Error(`확인란에 ${DELETE_ACCOUNT_CONFIRMATION}를 정확히 입력해 주세요.`);
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    body: { confirmation }
  });

  if (error) {
    throw new Error(error.message || '회원 탈퇴 처리에 실패했습니다.');
  }

  if (!isDeletedResponse(data)) {
    throw new Error('회원 탈퇴 응답을 확인하지 못했습니다.');
  }
};

export const purgeLocalAccountData = (userId: string) => {
  if (typeof window === 'undefined' || !userId) return;

  const exactKeys = new Set([
    `movielist:movie-library:${userId}`,
    `movielist:user-lists:${userId}`,
    `movielist:recommendation-state:${userId}`,
    `movielist:rating-history:${userId}`
  ]);
  const dailyAnswerPrefix = `movielist:daily-question-answer:${userId}:`;

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key && (exactKeys.has(key) || key.startsWith(dailyAnswerPrefix))) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // The remote account is already deleted. Local storage cleanup is best-effort.
  }
};
