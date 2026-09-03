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
    <article v-for="entry in movieCards" :key="entry.movie.id" class="group flex w-[4.9rem] shrink-0 flex-col">
      <div class="corner-soft relative overflow-hidden border border-app-line bg-app-poster">
        <RouterLink
          :to="{ name: 'movie-detail', params: { movieId: entry.movie.id } }"
          class="focus-ring block"
          :aria-label="`${entry.movie.title} 영화 정보 보기`"
        >
          <img
            :src="entry.movie.posterUrl"
            :alt="entry.movie.posterAlt"
            class="h-[6.6rem] w-full object-cover transition duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </RouterLink>
        <div class="poster-hover-actions absolute inset-x-0 top-0 flex items-start justify-end gap-1 bg-gradient-to-b from-black/80 via-black/45 to-transparent p-1.5 pb-7">
          <IconButton
            :icon="Heart"
            :active="isSaved(entry.movie.id)"
            :label="isSaved(entry.movie.id) ? '보고싶어요에서 제거' : '보고싶어요에 저장'"
            size="sm"
            @click.stop="$emit('toggle-watch', entry.movie.id)"
          />
        </div>
      </div>
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
    </article>
  </div>
</template>

<style scoped>
.poster-hover-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

@media (hover: hover) and (pointer: fine) {
  .poster-hover-actions {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.35rem);
    transition:
      opacity 160ms ease,
      transform 160ms ease;
  }

  .group:hover .poster-hover-actions,
  .group:focus-within .poster-hover-actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .poster-hover-actions {
    transition: none;
  }
}
</style>
