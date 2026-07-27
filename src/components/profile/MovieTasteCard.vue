<script setup lang="ts">
import FavoritePersonCard from '@/components/profile/FavoritePersonCard.vue';
import GenreTopThree from '@/components/profile/GenreTopThree.vue';
import type { ProfileTaste } from '@/types/profile';

defineProps<{
  isOwner: boolean;
  taste: ProfileTaste;
}>();
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-5 sm:p-6" aria-labelledby="movie-taste-title">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">MOVIE TASTE</p>
        <h2 id="movie-taste-title" class="mt-1 text-lg font-bold text-[#15171c]">내 영화 취향</h2>
      </div>
      <p class="corner-pill shrink-0 border border-app-line bg-app-panelSoft px-3 py-1.5 text-sm font-semibold text-[#34465b]">
        총 {{ taste.watchedCount }}편 감상
      </p>
    </div>

    <div class="mt-5 grid gap-5 sm:grid-cols-2">
      <section>
        <h3 class="text-sm font-bold text-[#263649]">선호 장르 TOP 3</h3>
        <div class="mt-3"><GenreTopThree :genres="taste.topGenres" /></div>
      </section>
      <div class="grid gap-3">
        <FavoritePersonCard label="가장 많이 본 감독" :person="taste.favoriteDirector" />
        <FavoritePersonCard label="가장 많이 본 배우" :person="taste.favoriteActor" />
      </div>
    </div>

    <RouterLink
      v-if="isOwner && taste.watchedCount === 0"
      to="/rating"
      class="focus-ring corner-soft mt-5 inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white"
    >
      영화 기록 시작하기
    </RouterLink>
  </section>
</template>
