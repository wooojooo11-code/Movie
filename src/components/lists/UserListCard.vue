<script setup lang="ts">
import ListMovieShelf from '@/components/lists/ListMovieShelf.vue';
import type { ResolvedUserListCard } from '@/types/lists';

defineProps<{
  list: ResolvedUserListCard;
  savedMovieIds: readonly string[];
}>();

defineEmits<{
  edit: [listId: string];
  delete: [listId: string];
  'remove-from-my-lists': [listId: string];
  'toggle-watch': [movieId: string];
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
    <div class="flex items-start justify-between gap-3">
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
      </div>
    </div>

    <ListMovieShelf
      :movies="list.moviePreviews"
      :saved-movie-ids="savedMovieIds"
      @toggle-watch="$emit('toggle-watch', $event)"
    />

    <div class="mt-4 flex gap-2">
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-10 flex-1 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm text-white"
        @click="$emit('edit', list.id)"
      >
        수정하기
      </button>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm text-app-muted"
        @click="list.sourceListId ? $emit('remove-from-my-lists', list.id) : $emit('delete', list.id)"
      >
        삭제
      </button>
    </div>
  </article>
</template>
