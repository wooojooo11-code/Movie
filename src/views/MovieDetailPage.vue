<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getCommunityMovieDetail, type CommunityMovieDetail } from '@/services/community/movieService';
import { getWatchProviderLinks } from '@/services/watchProviderLinks';

const route = useRoute();
const movie = ref<CommunityMovieDetail | null>(null);
const loading = ref(true);
const errorMessage = ref('');

const quickWatchLinks = computed(() => (movie.value ? getWatchProviderLinks(movie.value) : []));
const watchProviderSections = computed(() => {
  const watchProviders = movie.value?.watchProvidersKr;

  if (!watchProviders) {
    return [];
  }

  return [
    { key: 'flatrate', label: '구독', providers: watchProviders.flatrate },
    { key: 'rent', label: '대여', providers: watchProviders.rent },
    { key: 'buy', label: '구매', providers: watchProviders.buy }
  ].filter((section) => section.providers.length > 0);
});

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
  <main class="community-surface mx-auto w-full max-w-md px-4 pb-24 pt-6 sm:max-w-[800px]">
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

      <section class="mt-5 border-t border-app-line pt-5" aria-labelledby="movie-ott-title">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="movie-ott-title" class="text-sm font-semibold text-[#15171c]">OTT 정보</h2>
            <p class="mt-1 text-xs text-app-muted">한국 기준 제공처</p>
          </div>
          <a
            v-if="movie.watchProvidersKr?.link"
            :href="movie.watchProvidersKr.link"
            target="_blank"
            rel="noreferrer"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[11px] font-medium text-[#15171c]"
          >
            전체 OTT 보기
          </a>
        </div>

        <div v-if="watchProviderSections.length === 0" class="corner-soft mt-3 border border-dashed border-app-line bg-app-panelSoft px-3 py-3 text-xs text-app-muted">
          현재 한국 기준 OTT 제공 정보를 찾지 못했어요.
        </div>

        <div v-else class="mt-3 grid gap-2">
          <section
            v-for="section in watchProviderSections"
            :key="section.key"
            class="corner-soft border border-app-line bg-app-panelSoft px-3 py-3"
          >
            <h3 class="text-xs font-semibold text-[#15171c]">{{ section.label }}</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <div
                v-for="provider in section.providers"
                :key="`${section.key}-${provider.providerId}`"
                class="corner-soft inline-flex items-center gap-2 border border-app-line bg-app-panel px-2 py-1.5"
              >
                <img
                  v-if="provider.logoUrl"
                  :src="provider.logoUrl"
                  :alt="provider.providerName"
                  class="corner-soft size-5 object-cover"
                  loading="lazy"
                />
                <span class="text-[11px] font-medium text-[#15171c]">{{ provider.providerName }}</span>
              </div>
            </div>
          </section>
        </div>

        <div v-if="quickWatchLinks.length" class="mt-3 flex flex-wrap gap-2">
          <a
            v-for="link in quickWatchLinks"
            :key="link.key"
            :href="link.href"
            target="_blank"
            rel="noreferrer"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center px-3 text-[11px] font-medium"
            :class="link.accentClassName"
          >
            {{ link.buttonLabel }}
          </a>
        </div>
      </section>
    </article>
  </main>
</template>
