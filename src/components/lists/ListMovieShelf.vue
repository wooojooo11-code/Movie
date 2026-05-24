<script setup lang="ts">
import type { SearchableCatalogMovie } from '@/types/lists';

const props = defineProps<{
  movies: readonly SearchableCatalogMovie[];
  savedMovieIds: readonly string[];
}>();

defineEmits<{
  'toggle-watch': [movieId: string];
}>();

const isSaved = (movieId: string) => props.savedMovieIds.includes(movieId);
</script>

<template>
  <div class="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    <article v-for="movie in movies" :key="movie.id" class="w-[4.9rem] shrink-0">
      <img
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="h-[6.6rem] w-full rounded-[12px] border border-app-line object-cover"
        loading="lazy"
      />
      <p class="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-white/88">
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
        @click="$emit('toggle-watch', movie.id)"
      >
        {{ isSaved(movie.id) ? '보관 중' : '보고싶어요' }}
      </button>
    </article>
  </div>
</template>
