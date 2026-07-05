<script setup lang="ts">
import { computed } from 'vue';

import { getWatchProviderSummary } from '@/services/watchProviderSummary';
import type { SearchableCatalogMovie } from '@/types/lists';

const props = defineProps<{
  movies: readonly SearchableCatalogMovie[];
  savedMovieIds: readonly string[];
}>();

defineEmits<{
  'toggle-watch': [movieId: string];
}>();

const isSaved = (movieId: string) => props.savedMovieIds.includes(movieId);

const movieCards = computed(() =>
  props.movies.map((movie) => ({
    movie,
    watchAvailabilityText: getWatchProviderSummary(movie)
  }))
);
</script>

<template>
  <div class="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    <article v-for="entry in movieCards" :key="entry.movie.id" class="w-[4.9rem] shrink-0">
      <img
        :src="entry.movie.posterUrl"
        :alt="entry.movie.posterAlt"
        class="corner-soft h-[6.6rem] w-full border border-app-line object-cover"
        loading="lazy"
      />
      <p class="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-white">
        {{ entry.movie.title }}
      </p>
      <p
        v-if="entry.watchAvailabilityText"
        class="mt-1 line-clamp-2 text-[10px] leading-4 text-app-muted"
      >
        OTT · {{ entry.watchAvailabilityText }}
      </p>
      <button
        type="button"
        class="focus-ring corner-soft mt-1.5 inline-flex min-h-8 w-full items-center justify-center border px-2 text-[11px] font-medium"
        :class="
          isSaved(entry.movie.id)
            ? 'border-app-accent bg-app-accent text-white'
            : 'border-app-line bg-app-panelSoft text-white'
        "
        @click="$emit('toggle-watch', entry.movie.id)"
      >
        {{ isSaved(entry.movie.id) ? '보관 중' : '보고싶어요' }}
      </button>
    </article>
  </div>
</template>
