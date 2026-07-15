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
  <article class="corner-hard min-w-0 max-w-full border border-app-line bg-app-panel p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold leading-snug text-white">{{ list.title }}</h3>
        <p class="mt-2 text-sm text-app-muted">
          {{ list.ownerName }} · 평점 {{ list.displayAverageRating.toFixed(1) }} · 저장
          {{ formatCount(list.displaySaveCount) }}
        </p>
      </div>
      <span
        class="corner-pill shrink-0 border border-app-accent bg-app-accent px-3 py-1.5 text-xs font-semibold text-white"
      >
        공유
      </span>
    </div>

    <ListMovieShelf
      :movies="list.moviePreviews"
      :saved-movie-ids="savedMovieIds"
      @toggle-watch="$emit('toggle-watch', $event)"
    />

    <div class="mt-3 flex items-center gap-2">
      <button
        v-if="showSaveButton !== false"
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 items-center justify-center border px-3 text-xs font-medium text-white"
        :class="
          list.viewerSaved
            ? 'border-app-accent bg-app-accent'
            : 'border-app-line bg-app-panelSoft'
        "
        @click="$emit('toggle-save', list.id)"
      >
        {{ list.viewerSaved ? '저장됨' : '저장' }}
      </button>

      <div class="ml-auto flex min-w-0 items-center gap-2">
        <div class="flex shrink-0 items-center gap-2">
          <span class="text-xs font-medium text-app-muted">평가하기</span>
          <button
            v-if="list.viewerRating !== null"
            type="button"
            class="focus-ring corner-soft text-xs text-app-muted underline underline-offset-4"
            @click="clearRating"
          >
            지우기
          </button>
        </div>
        <div class="shrink-0">
          <HalfStarRating
            :model-value="list.viewerRating"
            size="sm"
            :show-value="false"
            aria-label-prefix="리스트 평점"
            @update:model-value="setRating"
          />
        </div>
      </div>
    </div>
  </article>
</template>
