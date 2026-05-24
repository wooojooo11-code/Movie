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
const selectedMovie = ref<null | RecommendedCatalogMovie>(null);

const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);
const hasDismissedRecommendations = computed(
  () => recommendationStore.state.dismissedRecommendationMovieIds.length > 0
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

const handleAlreadySeen = async (movieId: string) => {
  await recommendationStore.dismissRecommendedMovie(movieId);
  closeMovieSheet();
};

const resetAlreadySeen = async () => {
  await recommendationStore.resetDismissedRecommendations();
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
    class="mx-auto flex w-full max-w-md flex-col gap-7 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="rounded-2xl border border-app-line bg-app-panel px-5 py-5 shadow-panel">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Recommendation</p>
      <h1 class="mt-2 text-[25px] font-semibold leading-tight text-white">당신에게 맞을지도 몰라요</h1>
      <p class="mt-2 text-sm text-app-muted">
        {{ recommendationStore.state.profile.totalRatings }}개 평가를 바탕으로 골랐어요.
      </p>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings === 0"
          to="/rating"
          class="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"
        >
          취향분석 시작
        </RouterLink>

        <RouterLink
          v-else-if="hasMoreTasteAnalysis && nextAdditionalBatchLink"
          :to="nextAdditionalBatchLink"
          class="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white/88"
        >
          더 분석하기
        </RouterLink>

        <button
          v-if="hasDismissedRecommendations"
          type="button"
          class="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white/88"
          @click="resetAlreadySeen"
        >
          이미 봄 초기화
        </button>
      </div>
    </section>

    <template v-if="recommendationStore.state.profile.totalRatings > 0">
      <section>
        <div class="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-white">당신에게 맞을지도 몰라요</h2>
            <p class="mt-1 text-sm text-app-muted">
              {{
                recommendationStore.isRecommendationFallbackMode.value
                  ? '새 후보가 줄어서, 봤던 영화도 함께 섞어 두었어요.'
                  : '포스터를 눌러서 더 볼 수 있어요.'
              }}
            </p>
          </div>
          <span class="text-xs text-app-muted">
            {{ recommendationStore.recommendedMovies.value.length }}개
          </span>
        </div>

        <div
          v-if="recommendationStore.recommendedMovies.value.length > 0"
          class="grid grid-cols-5 gap-2"
        >
          <RecommendationMovieCard
            v-for="movie in recommendationStore.recommendedMovies.value"
            :key="movie.id"
            :movie="movie"
            size="compact"
            @open="openMovieSheet"
          />
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm text-app-muted"
        >
          지금은 보여줄 영화가 없어요. 이미 봄을 비우거나 더 분석해 보세요.
        </div>
      </section>

      <section>
        <div class="mb-3">
          <h2 class="text-lg font-semibold text-white">사람들이 저장한 리스트</h2>
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
