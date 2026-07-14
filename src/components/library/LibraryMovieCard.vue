<script setup lang="ts">
import { computed } from 'vue';

import { getWatchProviderSummary } from '@/services/watchProviderSummary';
import type { ResolvedLibraryMovieRecord } from '@/types/library';

const props = defineProps<{
  item: ResolvedLibraryMovieRecord;
}>();

defineEmits<{
  remove: [movieId: string];
}>();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));

const watchAvailabilityText = computed(() => getWatchProviderSummary(props.item.movie));
</script>

<template>
  <article class="corner-hard border border-app-line bg-app-panel p-3">
    <img
      :src="item.movie.posterUrl"
      :alt="item.movie.posterAlt"
      class="corner-soft mx-auto aspect-[4/5] w-[40%] border border-app-line object-cover"
      loading="lazy"
    />
    <div class="mt-3">
      <h3 class="line-clamp-2 text-sm font-semibold leading-5 text-white">{{ item.movie.title }}</h3>
      <p class="mt-1 text-xs text-app-muted">
        {{ item.movie.releaseYear }} · {{ item.movie.genres.join(' · ') }}
      </p>
      <p v-if="watchAvailabilityText" class="mt-1 text-[11px] text-app-muted">
        OTT · {{ watchAvailabilityText }}
      </p>
      <p class="mt-1 text-[11px] text-app-muted">보관 · {{ formatDate(item.savedAt) }}</p>
    </div>
    <button
      type="button"
      class="focus-ring corner-soft mt-3 inline-flex min-h-9 w-full items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-white/88"
      @click="$emit('remove', item.movie.id)"
    >
      보관함에서 빼기
    </button>
  </article>
</template>
