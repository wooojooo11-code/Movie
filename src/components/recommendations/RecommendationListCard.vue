<script setup lang="ts">
import { useLibraryStore } from '@/services/libraryStore';
import type { RecommendedCatalogList } from '@/types/recommendation';

defineProps<{
  isSaved: boolean;
  list: RecommendedCatalogList;
}>();

defineEmits<{
  openLists: [];
  save: [list: RecommendedCatalogList];
}>();

const libraryStore = useLibraryStore();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const isSavedMovie = (movieId: string) => libraryStore.savedMovieIds.value.includes(movieId);
</script>

<template>
  <article class="rounded-2xl border border-app-line bg-app-panel px-4 py-4">
    <div class="flex items-start justify-between gap-3">
      <h3 class="line-clamp-2 text-base font-semibold leading-snug text-white">
        {{ list.title }}
      </h3>
      <span class="shrink-0 text-xs text-app-muted">{{ list.averageRating.toFixed(1) }}</span>
    </div>

    <p class="mt-1.5 text-sm text-app-muted">저장 {{ formatCount(list.saveCount) }}</p>

    <div class="mt-3 grid grid-cols-3 gap-2.5">
      <article v-for="movie in list.moviePreviews" :key="movie.id" class="min-w-0">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-16 w-11 rounded-lg object-cover"
          loading="lazy"
        />
        <p class="mt-1.5 line-clamp-2 text-[11px] font-medium leading-4 text-white/88">
          {{ movie.title }}
        </p>
        <button
          type="button"
          class="focus-ring mt-2 inline-flex min-h-8 w-full items-center justify-center rounded-lg border px-2 text-[11px] font-semibold transition"
          :class="
            isSavedMovie(movie.id)
              ? 'border-app-accent/35 bg-app-accent/10 text-white'
              : 'border-app-line bg-app-panelSoft text-white/88'
          "
          @click="libraryStore.toggleMovie(movie.id)"
        >
          {{ isSavedMovie(movie.id) ? '보관 중' : '보고싶어요' }}
        </button>
      </article>
    </div>

    <div class="mt-4 flex gap-2">
      <button
        type="button"
        class="focus-ring inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-medium"
        :class="
          isSaved
            ? 'border-app-line bg-app-panelSoft text-white/60'
            : 'border-app-line bg-app-panelSoft text-white/88'
        "
        :disabled="isSaved"
        @click="$emit('save', list)"
      >
        {{ isSaved ? '저장됨' : '내 리스트에 저장' }}
      </button>
      <button
        type="button"
        class="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-white/78"
        @click="$emit('openLists')"
      >
        리스트 보기
      </button>
    </div>
  </article>
</template>
