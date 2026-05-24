<script setup lang="ts">
import type { PopularList } from '@/types/home';

defineProps<{
  list: PopularList;
}>();

defineEmits<{
  open: [list: PopularList];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatRating = (rating: number) => rating.toFixed(1);
</script>

<template>
  <button
    type="button"
    class="focus-ring w-full rounded-2xl border border-app-line bg-app-panel px-4 py-4 text-left transition hover:bg-app-panelSoft"
    @click="$emit('open', list)"
  >
    <div class="mb-3 flex gap-2">
      <img
        v-for="movie in list.moviePreviews"
        :key="movie.id"
        :src="movie.posterUrl"
        :alt="movie.posterAlt"
        class="h-16 w-11 rounded-lg object-cover"
        loading="lazy"
      />
    </div>

    <h3 class="line-clamp-2 text-base font-semibold leading-snug text-white">
      {{ list.title }}
    </h3>
    <p class="mt-1.5 text-sm text-app-muted">
      저장 {{ formatCount(list.saveCount) }} · 평균 평점 {{ formatRating(list.averageRating) }}
    </p>
  </button>
</template>
