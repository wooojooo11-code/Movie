<script setup lang="ts">
import type { ResolvedUserListCard } from '@/types/lists';

defineProps<{
  list: ResolvedUserListCard;
}>();

defineEmits<{
  edit: [listId: string];
  delete: [listId: string];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
</script>

<template>
  <article class="rounded-[20px] border border-app-line bg-app-panel p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-base font-bold leading-snug text-white">{{ list.title }}</h3>
          <span
            class="rounded-full px-2.5 py-1 text-[11px] font-bold"
            :class="
              list.isPrivate ? 'bg-white/10 text-white' : 'bg-app-accent/15 text-[#ffdbe6]'
            "
          >
            {{ list.isPrivate ? '비공유' : '공유' }}
          </span>
        </div>
        <p class="mt-2 text-sm text-app-muted">
          영화 {{ list.movieIds.length }}개 · 저장 {{ formatCount(list.saveCount) }}
          <template v-if="list.ratingCount > 0"> · 평점 {{ list.averageRating.toFixed(1) }}</template>
        </p>
      </div>
      <p class="shrink-0 text-xs font-bold text-app-muted">{{ formatDate(list.updatedAt) }}</p>
    </div>

    <div class="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
      <img
        v-for="movie in list.moviePreviews"
        :key="movie.id"
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="h-20 w-14 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
    </div>

    <div class="mt-4 flex gap-2">
      <button
        type="button"
        class="focus-ring inline-flex min-h-10 flex-1 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 text-sm font-bold text-white"
        @click="$emit('edit', list.id)"
      >
        다시 편집
      </button>
      <button
        type="button"
        class="focus-ring inline-flex min-h-10 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 text-sm font-bold text-app-muted"
        @click="$emit('delete', list.id)"
      >
        삭제
      </button>
    </div>
  </article>
</template>
