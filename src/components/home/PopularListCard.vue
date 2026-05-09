<script setup lang="ts">
import type { PopularList } from '@/types/home';

defineProps<{
  list: PopularList;
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatRating = (rating: number) => rating.toFixed(1);
</script>

<template>
  <article class="rounded-[20px] border border-app-line bg-app-panel px-4 pb-[18px] pt-4">
    <h3 class="line-clamp-2 text-base font-bold leading-snug text-white">
      {{ list.title }}
    </h3>
    <p class="mt-2 text-sm font-medium text-app-muted">
      저장 {{ formatCount(list.saveCount) }} · 평균 평점 {{ formatRating(list.averageRating) }}
    </p>
  </article>
</template>
