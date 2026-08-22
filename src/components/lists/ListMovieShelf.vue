<script setup lang="ts">
import { Heart } from 'lucide-vue-next';
import { computed } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import { getWatchProviderSummary } from '@/services/watchProviderSummary';
import type { SearchableCatalogMovie } from '@/types/lists';

const props = withDefaults(defineProps<{
  movies: readonly SearchableCatalogMovie[];
  savedMovieIds: readonly string[];
  showDetails?: boolean;
}>(), {
  showDetails: false
});

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
  <div class="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1 scrollbar-hide">
    <article v-for="entry in movieCards" :key="entry.movie.id" class="flex w-[4.9rem] shrink-0 flex-col">
      <img
        :src="entry.movie.posterUrl"
        :alt="entry.movie.posterAlt"
        class="corner-soft h-[6.6rem] w-full border border-app-line object-cover"
        loading="lazy"
      />
      <p class="mt-2 line-clamp-2 min-h-8 text-[11px] font-medium leading-4 text-white">
        {{ entry.movie.title }}
      </p>
      <p
        v-if="showDetails && entry.watchAvailabilityText"
        class="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-app-muted"
      >
        OTT · {{ entry.watchAvailabilityText }}
      </p>
      <p v-else-if="showDetails" aria-hidden="true" class="mt-1 min-h-8"></p>
      <IconButton v-if="showDetails" class="mt-1.5" :icon="Heart" :active="isSaved(entry.movie.id)" :label="isSaved(entry.movie.id) ? '보고싶어요에서 제거' : '보고싶어요에 저장'" size="sm" @click="$emit('toggle-watch', entry.movie.id)" />
    </article>
  </div>
</template>
