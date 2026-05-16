<script setup lang="ts">
import type { PopularList } from '@/types/home';

defineProps<{
  list: PopularList;
}>();

defineEmits<{
  close: [];
}>();

const formatCount = (count: number) => count.toLocaleString('ko-KR');
const formatRating = (rating: number) => rating.toFixed(1);
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-end bg-black/70 px-4 pb-4 pt-8" @click.self="$emit('close')">
    <section class="w-full rounded-[24px] border border-app-line bg-app-panel p-4 shadow-2xl shadow-black/40">
      <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10" />

      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-bold text-app-accent">인기 리스트</p>
          <h3 class="mt-2 text-xl font-extrabold leading-snug text-white">{{ list.title }}</h3>
          <p class="mt-2 text-sm text-app-muted">
            저장 {{ formatCount(list.saveCount) }} · 평균 평점 {{ formatRating(list.averageRating) }}
          </p>
        </div>
        <button
          type="button"
          class="focus-ring inline-flex min-h-9 items-center justify-center rounded-[12px] border border-app-line bg-white/5 px-3 text-xs font-bold text-white"
          @click="$emit('close')"
        >
          닫기
        </button>
      </div>

      <div class="mt-5 grid grid-cols-3 gap-3">
        <article v-for="movie in list.moviePreviews" :key="movie.id" class="min-w-0">
          <img
            :src="movie.posterUrl"
            :alt="movie.posterAlt"
            class="aspect-[4/5] w-full rounded-[16px] object-cover"
            loading="lazy"
          />
          <p class="mt-2 line-clamp-2 text-sm font-bold leading-5 text-white">
            {{ movie.title }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
