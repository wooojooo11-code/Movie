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
    style="background-color: rgba(0, 0, 0, 0.36)"
    @click.self="$emit('close')"
  >
    <section
      class="mx-auto w-full max-w-[23.5rem] border border-app-line px-4 py-4"
      style="background-color: rgba(255, 255, 255, 0.96)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs text-app-muted">리스트</p>
          <h3 class="mt-1 text-lg font-semibold leading-snug text-[#15171c]">{{ list.title }}</h3>
          <p class="mt-2 text-sm text-app-muted">
            저장 {{ formatCount(list.saveCount) }} · 평균 {{ formatRating(list.averageRating) }}
          </p>
        </div>

        <button
          type="button"
          class="focus-ring border border-app-line bg-app-panelSoft px-3 py-2 text-xs text-[#15171c]"
          @click="$emit('close')"
        >
          닫기
        </button>
      </div>

      <div class="mt-4">
        <div class="grid grid-cols-3 gap-2.5">
          <article
            v-for="movie in list.moviePreviews"
            :key="movie.id"
            class="min-w-0 border border-app-line bg-app-panel p-2"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.posterAlt"
              class="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
            <p class="mt-1.5 line-clamp-2 text-[12px] font-semibold leading-4 text-[#15171c]">
              {{ movie.title }}
            </p>
            <p class="mt-1 line-clamp-2 text-[10px] leading-4 text-app-muted">
              {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
            </p>
            <p
              v-if="movie.summaryTags.length > 0"
              class="mt-1 line-clamp-1 text-[10px] leading-4 text-app-muted"
            >
              {{ movie.summaryTags.join(' · ') }}
            </p>
            <button
              type="button"
              class="focus-ring mt-1.5 inline-flex min-h-7 w-full items-center justify-center border px-1.5 text-[10px] font-medium"
              :class="
                isSaved(movie.id)
                  ? 'border-app-accent bg-app-accent text-white'
                  : 'border-app-line bg-app-panelSoft text-[#15171c]'
              "
              @click="libraryStore.toggleMovie(movie.id)"
            >
              {{ isSaved(movie.id) ? '보관 중' : '보고싶어요' }}
            </button>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
