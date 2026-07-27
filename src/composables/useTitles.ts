import { computed, ref } from 'vue';

import { fetchProfileTitles } from '@/services/profileService';
import { saveTitlePresentation } from '@/services/titleService';
import type { ProfileTitle } from '@/types/profile';

export const useTitles = () => {
  const titles = ref<ProfileTitle[]>([]);
  const loading = ref(false);
  const errorMessage = ref('');
  const earnedTitles = computed(() => titles.value.filter((title) => title.isEarned));

  const loadTitles = async (userId: string) => {
    loading.value = true;
    errorMessage.value = '';
    try {
      titles.value = await fetchProfileTitles(userId);
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '칭호를 불러오지 못했습니다.';
      titles.value = [];
    } finally {
      loading.value = false;
    }
  };

  const savePresentation = async (featuredTitleId: null | string, displayTitleIds: readonly string[]) => {
    await saveTitlePresentation(featuredTitleId, displayTitleIds);
  };

  return { earnedTitles, errorMessage, loadTitles, loading, savePresentation, titles };
};
