import { computed, type MaybeRef, toValue } from 'vue';

import type { ProfileOverview } from '@/types/profile';

export const useMovieTaste = (profile: MaybeRef<ProfileOverview | null>) => {
  const taste = computed(() => toValue(profile)?.taste ?? null);
  const hasWatchedMovies = computed(() => (taste.value?.watchedCount ?? 0) > 0);
  const hasKeywords = computed(() => (taste.value?.topKeywords.length ?? 0) > 0);

  return { hasKeywords, hasWatchedMovies, taste };
};
