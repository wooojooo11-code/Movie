<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import RecommendationListCard from '@/components/recommendations/RecommendationListCard.vue';
import RecommendationMovieCard from '@/components/recommendations/RecommendationMovieCard.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import { hasAdditionalTasteAnalysisMovies } from '@/data/rating';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';
import type {
  MoodContext,
  RecommendedCatalogList,
  RecommendedCatalogMovie
} from '@/types/recommendation';

const listStore = useListStore();
const recommendationStore = useRecommendationStore();
const router = useRouter();
const selectedMovie = ref<RecommendedCatalogMovie | null>(null);

const selectedContext = computed(() => recommendationStore.currentContext.value);
const hasMoreTasteAnalysis = computed(() =>
  hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);
const hasDismissedRecommendations = computed(
  () => recommendationStore.state.dismissedRecommendationMovieIds.length > 0
);

const contextOptions: Array<{ label: string; value: MoodContext }> = [
  { label: '기본', value: 'normal' },
  { label: '시험 끝', value: 'after_exam' },
  { label: '자기 전', value: 'bed_time' },
  { label: '친구와', value: 'with_friends' },
  { label: '학원 후', value: 'after_academy' }
];

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

const setRecommendationContext = (context: MoodContext) => {
  recommendationStore.setContext(context);
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-7 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">Recommendation</p>
      <h1 class="mt-2 text-[25px] font-semibold leading-tight text-white">당신에게 맞을지도 몰라요</h1>
      <p class="mt-2 text-sm text-app-muted">
        {{ recommendationStore.state.profile.totalRatings }}개 평가를 바탕으로 고르고 있어요.
      </p>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings === 0"
          to="/rating"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          취향분석 시작
        </RouterLink>

        <RouterLink
          v-else-if="hasMoreTasteAnalysis && nextAdditionalBatchLink"
          :to="nextAdditionalBatchLink"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white"
        >
          더 분석하기
        </RouterLink>

        <button
          v-if="hasDismissedRecommendations"
          type="button"
          class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white"
          @click="resetAlreadySeen"
        >
          이미 봤어요 초기화
        </button>
      </div>

      <div
        v-if="recommendationStore.state.profile.totalRatings > 0"
        class="mt-4 flex flex-wrap gap-2"
      >
        <button
          v-for="option in contextOptions"
          :key="option.value"
          type="button"
          class="focus-ring inline-flex min-h-9 items-center justify-center border px-3 text-xs font-medium"
          :class="
            selectedContext === option.value
              ? 'border-app-accent bg-app-accent text-white'
              : 'border-app-line bg-app-panelSoft text-app-muted'
          "
          @click="setRecommendationContext(option.value)"
        >
          {{ option.label }}
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
                  ? '새 후보가 줄어서 봤던 영화도 다시 섞어두었어요.'
                  : '포스터를 눌러서 바로 볼 수 있어요.'
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
          class="border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm text-app-muted"
        >
          지금 보여줄 영화가 없어요. 이미 봤어요를 비우거나 더 분석해보세요.
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
