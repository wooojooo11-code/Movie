import { computed, readonly, ref } from 'vue';

import type { ProfileTitle } from '@/types/profile';

const queue = ref<ProfileTitle[]>([]);

export const titleUnlockStore = {
  activeTitle: computed(() => queue.value[0] ?? null),
  queue: readonly(queue),
  dismiss() {
    queue.value = queue.value.slice(1);
  },
  enqueue(titles: readonly ProfileTitle[]) {
    if (titles.length === 0) return;
    const existingIds = new Set(queue.value.map((title) => title.id));
    queue.value = [...queue.value, ...titles.filter((title) => !existingIds.has(title.id))];
  }
};

export const useTitleUnlocks = () => titleUnlockStore;
