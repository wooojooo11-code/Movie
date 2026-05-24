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
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.72)"
    @click.self="$emit('close')"
  >
    <section
      class="mx-auto w-full max-w-[21rem] border border-app-line px-4 py-4"
      style="background-color: rgba(17, 19, 24, 0.96)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs text-app-muted">리스트</p>
          <h3 class="mt-1 text-lg font-semibold leading-snug text-white">{{ list.title }}</h3>
          <p class="mt-2 text-sm text-app-muted">
            저장 {{ formatCount(list.saveCount) }} · 평균 {{ formatRating(list.averageRating) }}
          </p>
        </div>

        <button
          type="button"
          class="focus-ring border border-app-line px-3 py-2 text-xs text-white"
          style="background-color: rgba(21, 23, 28, 0.88)"
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
            class="aspect-[4/5] w-full object-cover"
            loading="lazy"
          />
          <p class="mt-1.5 line-clamp-2 text-xs font-medium leading-4 text-white">
            {{ movie.title }}
          </p>
          <button
            type="button"
            class="focus-ring mt-2 inline-flex min-h-8 w-full items-center justify-center border px-2 text-[11px] font-medium"
            :class="
              isSaved(movie.id)
                ? 'border-app-accent bg-app-accent text-white'
                : 'border-app-line text-white'
            "
            :style="
              isSaved(movie.id)
                ? undefined
                : 'background-color: rgba(21, 23, 28, 0.88)'
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
