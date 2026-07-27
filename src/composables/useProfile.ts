import { ref } from 'vue';

import { fetchProfileOverview } from '@/services/profileService';
import type { ProfileOverview } from '@/types/profile';

export const useProfile = () => {
  const profile = ref<ProfileOverview | null>(null);
  const loading = ref(false);
  const errorMessage = ref('');

  const loadProfile = async (userId: string) => {
    loading.value = true;
    errorMessage.value = '';
    try {
      profile.value = await fetchProfileOverview(userId);
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '프로필을 불러오지 못했습니다.';
      profile.value = null;
    } finally {
      loading.value = false;
    }
  };

  return { errorMessage, loadProfile, loading, profile };
};
