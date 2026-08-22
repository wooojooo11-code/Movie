<script setup lang="ts">
import { ChevronDown, Edit3, Trash2 } from 'lucide-vue-next';

import IconButton from '@/components/common/IconButton.vue';
import ListMovieShelf from '@/components/lists/ListMovieShelf.vue';
import type { ResolvedUserListCard } from '@/types/lists';

defineProps<{
  list: ResolvedUserListCard;
  savedMovieIds: readonly string[];
  expanded?: boolean;
}>();

defineEmits<{
  edit: [listId: string];
  delete: [listId: string];
  'remove-from-my-lists': [listId: string];
  'toggle-watch': [movieId: string];
  toggle: [listId: string];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
</script>

<template>
  <article class="corner-hard border border-app-line bg-app-panel p-4">
    <button type="button" class="focus-ring flex w-full items-start justify-between gap-3 text-left" :aria-expanded="expanded" @click="$emit('toggle', list.id)">
      <div>
        <h3 class="text-base font-semibold leading-snug text-white">{{ list.title }}</h3>
        <p class="mt-2 text-sm text-app-muted">
          영화 {{ list.movieIds.length }}편
          <template v-if="list.ratingCount > 0"> · 평점 {{ list.averageRating.toFixed(1) }}</template>
          · 저장 {{ formatCount(list.saveCount) }}
        </p>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-2">
        <span
          class="corner-pill border px-3 py-1.5 text-xs font-semibold text-white"
          :class="list.isPrivate ? 'border-app-line bg-app-panelSoft text-app-muted' : 'border-app-accent bg-app-accent'"
        >
          {{ list.isPrivate ? '비공개' : '공유' }}
        </span>
        <p class="text-xs text-app-muted">{{ formatDate(list.updatedAt) }}</p>
        <ChevronDown :size="18" class="text-app-muted transition-transform duration-200" :class="expanded ? 'rotate-180' : ''" aria-hidden="true" />
      </div>
    </button>

    <ListMovieShelf
      :movies="list.moviePreviews"
      :saved-movie-ids="savedMovieIds"
      :show-details="expanded"
      @toggle-watch="$emit('toggle-watch', $event)"
    />

    <div v-if="expanded" class="mt-4 flex justify-end gap-2">
      <IconButton v-if="!list.sourceListId" :icon="Edit3" label="리스트 수정" size="sm" @click="$emit('edit', list.id)" />
      <IconButton :icon="Trash2" :label="list.sourceListId ? '내 리스트에서 제거' : '리스트 삭제'" size="sm" @click="list.sourceListId ? $emit('remove-from-my-lists', list.id) : $emit('delete', list.id)" />
    </div>
  </article>
</template>
