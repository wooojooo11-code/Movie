<script setup lang="ts">
import { useLibraryStore } from '@/services/libraryStore';
import type { PopularList } from '@/types/home';

defineProps<{
  list: PopularList;
}>();

defineEmits<{
  close: [];
}>();

const libraryStore = useLibraryStore();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatRating = (rating: number) => rating.toFixed(1);
const isSaved = (movieId: string) => libraryStore.savedMovieIds.value.includes(movieId);
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end bg-black/72 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section class="mx-auto w-full max-w-[21rem] rounded-2xl border border-app-line bg-app-panel px-4 py-4 shadow-panel">
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/10" />

      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">List</p>
          <h3 class="mt-1.5 text-lg font-semibold leading-snug text-white">{{ list.title }}</h3>
          <p class="mt-2 text-sm text-app-muted">
            저장 {{ formatCount(list.saveCount) }} · 평균 평점 {{ formatRating(list.averageRating) }}
          </p>
        </div>

        <button
          type="button"
          class="focus-ring inline-flex min-h-8 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-white/84"
          @click="$emit('close')"
        >
          닫기
        </button>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2.5">
        <article v-for="movie in list.moviePreviews" :key="movie.id" class="min-w-0">
          <img
            :src="movie.posterUrl"
            :alt="movie.posterAlt"
            class="aspect-[4/5] w-full rounded-xl object-cover"
            loading="lazy"
          />
          <p class="mt-1.5 line-clamp-2 text-xs font-medium leading-4 text-white/92">
            {{ movie.title }}
          </p>
          <button
            type="button"
            class="focus-ring mt-2 inline-flex min-h-8 w-full items-center justify-center rounded-lg border px-2 text-[11px] font-semibold transition"
            :class="
              isSaved(movie.id)
                ? 'border-app-accent/35 bg-app-accent/10 text-white'
                : 'border-app-line bg-app-panelSoft text-white/88'
            "
            @click="libraryStore.toggleMovie(movie.id)"
          >
            {{ isSaved(movie.id) ? '보관 중' : '보고싶어요' }}
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
