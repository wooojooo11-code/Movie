<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import RecommendationListCard from '@/components/recommendations/RecommendationListCard.vue';
import RecommendationMovieCard from '@/components/recommendations/RecommendationMovieCard.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import { hasAdditionalTasteAnalysisMovies } from '@/data/rating';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { RecommendedCatalogList, RecommendedCatalogMovie } from '@/types/recommendation';

const listStore = useListStore();
const recommendationStore = useRecommendationStore();
const router = useRouter();
const selectedMovie = ref<RecommendedCatalogMovie | null>(null);

const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);

const nextAdditionalBatchLink = computed(() => {
  const batchIndex = recommendationStore.nextAdditionalBatchIndex.value;
  return batchIndex == null ? null : `/rating?mode=more&batch=${batchIndex}`;
});

const openMovieSheet = (movie: RecommendedCatalogMovie) => {
  selectedMovie.value = movie;
};

const closeMovieSheet = () => {
  selectedMovie.value = null;
};

const handleAlreadySeen = (movieId: string) => {
  recommendationStore.dismissRecommendedMovie(movieId);
  closeMovieSheet();
};

const saveRecommendedList = (list: RecommendedCatalogList) => {
  listStore.saveRecommendedList(list);
};

const openListsPage = () => {
  void router.push('/lists');
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <p class="text-sm font-bold text-app-accent">
        {{ recommendationStore.state.profile.totalRatings }}개 취향분석 반영
      </p>
      <h1 class="mt-2 text-[28px] font-extrabold leading-tight text-white">취향 기반 추천</h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        포스터를 눌러 작품 정보를 보고, 이미 본 영화는 바로 정리할 수 있어요.
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings === 0"
          to="/rating"
          class="app-gradient focus-ring inline-flex min-h-11 items-center justify-center rounded-[14px] px-4 py-[11px] text-sm font-bold text-white"
        >
          먼저 취향분석 하러 가기
        </RouterLink>

        <RouterLink
          v-else-if="hasMoreTasteAnalysis && nextAdditionalBatchLink"
          :to="nextAdditionalBatchLink"
          class="focus-ring inline-flex min-h-11 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 py-[11px] text-sm font-bold text-white"
        >
          취향 더 분석하기
        </RouterLink>
      </div>
    </section>

    <template v-if="recommendationStore.state.profile.totalRatings > 0">
      <section>
        <div class="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-lg font-extrabold text-white">추천 영화</h2>
            <p class="mt-1 text-sm text-app-muted">작게 모아두어 한 번에 보기 편해요</p>
          </div>
          <span class="text-xs font-bold text-app-muted">
            {{ recommendationStore.recommendedMovies.value.length }}개
          </span>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <RecommendationMovieCard
            v-for="movie in recommendationStore.recommendedMovies.value"
            :key="movie.id"
            :movie="movie"
            size="compact"
            @open="openMovieSheet"
          />
        </div>
      </section>

      <section>
        <div class="mb-4 flex items-end justify-between gap-4">
          <h2 class="text-lg font-extrabold text-white">추천 리스트</h2>
        </div>

        <div class="grid gap-3">
          <RecommendationListCard
            v-for="list in recommendationStore.recommendedLists.value"
            :key="list.id"
            :is-saved="listStore.hasImportedList(list.id)"
            :list="list"
            @save="saveRecommendedList"
            @open-lists="openListsPage"
          />
        </div>
      </section>
    </template>

    <RecommendationMovieSheet
      v-if="selectedMovie"
      :movie="selectedMovie"
      @close="closeMovieSheet"
      @already-seen="handleAlreadySeen"
    />
  </main>
</template>
