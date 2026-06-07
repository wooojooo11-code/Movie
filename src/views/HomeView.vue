<script setup lang="ts">
import HeroCTA from '@/components/home/HeroCTA.vue';
import PopularLists from '@/components/home/PopularLists.vue';
import TrendingMovies from '@/components/home/TrendingMovies.vue';
import { trendingMovies } from '@/data/home';
import { popularLists } from '@/data/popularLists';
</script>

<template>
  <main
    id="top"
    class="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <HeroCTA />
    <TrendingMovies :movies="trendingMovies" />
    <PopularLists :lists="popularLists" />
  </main>
</template>
