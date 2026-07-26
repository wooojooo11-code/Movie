<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getCommunityMovieDetail, type CommunityMovieDetail } from '@/services/community/movieService';

const route = useRoute();
const movie = ref<CommunityMovieDetail | null>(null);
const loading = ref(true);
const errorMessage = ref('');

// 외부 API 대신 앱에 포함된 영화 카탈로그에서 상세 정보를 찾습니다.
const load = () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    movie.value = getCommunityMovieDetail(String(route.params.movieId));
  } catch (error) {
    movie.value = null;
    errorMessage.value = error instanceof Error ? error.message : '영화 정보를 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
};

watch(() => route.params.movieId, load, { immediate: true });
</script>

<template>
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-24 pt-6 sm:max-w-xl">
    <RouterLink to="/community" class="focus-ring text-sm font-semibold text-[#174a77]">← 커뮤니티</RouterLink>
    <div v-if="loading" class="corner-soft mt-5 h-96 animate-pulse border border-app-line bg-app-panelSoft" />
    <p v-else-if="errorMessage" class="corner-soft mt-5 border border-[#d9a7a7] bg-[#fff6f6] p-4 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
    <article v-else-if="movie" class="corner-soft mt-5 border border-app-line bg-app-panel p-4">
      <div class="flex items-start gap-4">
        <img :src="movie.posterPath ?? '/app-icon.svg'" :alt="`${movie.title} 포스터`" class="w-32 shrink-0 border border-app-line object-cover sm:w-40" />
        <div class="min-w-0">
          <p class="text-xs font-semibold text-app-accent">APP MOVIE</p>
          <h1 class="mt-1 text-2xl font-semibold leading-8 text-[#15171c]">{{ movie.title }}</h1>
          <p class="mt-3 text-sm text-app-muted">{{ movie.releaseYear ?? '개봉 연도 정보 없음' }}<template v-if="movie.runtimeMinutes"> · {{ movie.runtimeMinutes }}분</template></p>
          <p v-if="movie.genres.length" class="mt-2 text-xs text-[#174a77]">{{ movie.genres.join(' · ') }}</p>
        </div>
      </div>
      <p class="mt-5 whitespace-pre-wrap text-sm leading-7 text-app-muted">{{ movie.overview || '줄거리 정보가 없습니다.' }}</p>
    </article>
  </main>
</template>
