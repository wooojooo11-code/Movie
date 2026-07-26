<script setup lang="ts">
import { onMounted, ref } from 'vue';

import HeroCTA from '@/components/home/HeroCTA.vue';
import PopularLists from '@/components/home/PopularLists.vue';
import TrendingMovies from '@/components/home/TrendingMovies.vue';
import { trendingMovies } from '@/data/home';
import { popularLists } from '@/data/popularLists';
import { loadKobisBoxOfficeMovies } from '@/services/kobisBoxOffice';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const movies = ref(trendingMovies);
const isBoxOfficeLoading = ref(false);
const boxOfficeStatus = ref('KOBIS 최신 집계 정보를 불러오는 중입니다.');

const refreshBoxOffice = async () => {
  if (isBoxOfficeLoading.value) {
    return;
  }

  isBoxOfficeLoading.value = true;

  try {
    movies.value = await loadKobisBoxOfficeMovies();
    boxOfficeStatus.value = 'KOBIS 전일 박스오피스 기준';
  } catch (error) {
    console.warn('Unable to load the latest KOBIS box office.', error);
    boxOfficeStatus.value = 'KOBIS 최신 집계를 불러오지 못해 연간 순위를 표시합니다.';
  } finally {
    isBoxOfficeLoading.value = false;
  }
};

onMounted(() => {
  void refreshBoxOffice();
});
</script>

<template>
  <main
    id="top"
    class="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <HeroCTA />
    <TrendingMovies
      :movies="movies"
      :is-loading="isBoxOfficeLoading"
      :status="boxOfficeStatus"
      @refresh="refreshBoxOffice"
    />
    <PopularLists v-if="authStore.isAuthenticated" :lists="popularLists" />
  </main>
</template>
