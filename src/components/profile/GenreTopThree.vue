<script setup lang="ts">
import type { ProfileTasteGenre } from '@/types/profile';

defineProps<{ genres: readonly ProfileTasteGenre[] }>();
</script>

<template>
  <div v-if="genres.length" class="space-y-3">
    <article v-for="genre in genres" :key="genre.name">
      <div class="flex items-center justify-between gap-3 text-sm">
        <p class="font-semibold text-[#263649]">{{ genre.name }}</p>
        <p class="shrink-0 text-xs text-app-muted">{{ genre.count }}편 · {{ genre.percentage }}%</p>
      </div>
      <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e9edf1]" aria-hidden="true">
        <div class="h-full rounded-full bg-app-accent" :style="{ width: `${Math.max(7, genre.percentage)}%` }" />
      </div>
    </article>
  </div>
  <p v-else class="text-sm leading-relaxed text-app-muted">영화를 기록하면 나만의 영화 취향이 만들어져요.</p>
</template>
