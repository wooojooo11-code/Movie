<script setup lang="ts">
import { computed } from 'vue';

import { getWatchProviderSummary } from '@/services/watchProviderSummary';
import type { ResolvedLibraryMovieRecord } from '@/types/library';

const props = defineProps<{
  item: ResolvedLibraryMovieRecord;
}>();

defineEmits<{
  edit: [item: ResolvedLibraryMovieRecord];
  remove: [movieId: string];
}>();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));

const watchAvailabilityText = computed(() => getWatchProviderSummary(props.item.movie));
const ratingText = computed(() => (props.item.rating == null ? null : `${props.item.rating.toFixed(1)} / 5.0`));
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
      <p v-if="ratingText" class="mt-2 text-xs font-semibold text-[#f4c95d]">
        ★ {{ ratingText }}
      </p>
      <p v-if="item.reviewText" class="mt-2 line-clamp-3 text-xs leading-5 text-white/80">
        “{{ item.reviewText }}”
      </p>
      <p class="mt-1 text-[11px] text-app-muted">보관 · {{ formatDate(item.savedAt) }}</p>
    </div>
    <div class="mt-3 grid gap-2">
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 w-full items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-white"
        @click="$emit('edit', item)"
      >
        기록 수정
      </button>
      <button
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 w-full items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-white/88"
        @click="$emit('remove', item.movie.id)"
      >
        보관함에서 빼기
      </button>
    </div>
  </article>
</template>
