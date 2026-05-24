<script setup lang="ts">
import HalfStarRating from '@/components/common/HalfStarRating.vue';
import ListMovieShelf from '@/components/lists/ListMovieShelf.vue';
import type { ResolvedSharedListCard } from '@/types/lists';

const props = defineProps<{
  list: ResolvedSharedListCard;
  savedMovieIds: readonly string[];
  showSaveButton?: boolean;
}>();

const emit = defineEmits<{
  'toggle-save': [listId: string];
  'toggle-watch': [movieId: string];
  rate: [payload: { listId: string; rating: number | null }];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');

const setRating = (rating: number) => {
  emit('rate', {
    listId: props.list.id,
    rating
  });
};

const clearRating = () => {
  emit('rate', {
    listId: props.list.id,
    rating: null
  });
};
</script>

<template>
  <article class="rounded-[20px] border border-app-line bg-app-panel p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-base font-bold leading-snug text-white">{{ list.title }}</h3>
          <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-app-muted">
            재공유 불가
          </span>
        </div>
        <p class="mt-2 text-sm text-app-muted">
          {{ list.ownerName }} · 저장 {{ formatCount(list.displaySaveCount) }} · 평점
          {{ list.displayAverageRating.toFixed(1) }}
        </p>
      </div>
      <span class="rounded-full bg-app-accent/15 px-2.5 py-1 text-xs font-bold text-white">
        공유
      </span>
    </div>

    <ListMovieShelf
      :movies="list.moviePreviews"
      :saved-movie-ids="savedMovieIds"
      @toggle-watch="$emit('toggle-watch', $event)"
    />

    <div class="mt-4 flex gap-2">
      <button
        v-if="showSaveButton !== false"
        type="button"
        class="focus-ring inline-flex min-h-10 items-center justify-center rounded-[14px] border px-4 text-sm font-bold"
        :class="
          list.viewerSaved
            ? 'border-app-accent/40 bg-app-accent/10 text-white'
            : 'border-app-line bg-white/5 text-white'
        "
        @click="$emit('toggle-save', list.id)"
      >
        {{ list.viewerSaved ? '저장됨' : '저장' }}
      </button>

      <div class="min-w-0 flex-1 rounded-[14px] border border-app-line bg-white/5 px-3 py-2.5">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-bold text-app-muted">평가하기</span>
          <button
            v-if="list.viewerRating !== null"
            type="button"
            class="focus-ring text-xs font-bold text-app-muted underline decoration-white/20 underline-offset-4"
            @click="clearRating"
          >
            지우기
          </button>
        </div>
        <div class="mt-2">
          <HalfStarRating
            :model-value="list.viewerRating"
            size="sm"
            aria-label-prefix="리스트 평점"
            @update:model-value="setRating"
          />
        </div>
      </div>
    </div>
  </article>
</template>
