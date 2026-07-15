<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { popularRecommendedLists } from '@/data/popularLists';
import RecommendationListCard from '@/components/recommendations/RecommendationListCard.vue';
import RecommendationMovieCard from '@/components/recommendations/RecommendationMovieCard.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type {
  MoodContext,
  RatingFeedbackPayload,
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  StoredRatingRecord
} from '@/types/recommendation';

const listStore = useListStore();
const recommendationStore = useRecommendationStore();
const router = useRouter();
const selectedMovie = ref<null | RecommendedCatalogMovie>(null);
const isSavingRecommendationRating = ref(false);

const selectedContext = computed(() => recommendationStore.currentContext.value);
const hasMoreTasteAnalysis = computed(() => recommendationStore.hasAdditionalTasteAnalysisMovies.value);

const contextOptions: Array<{ label: string; value: MoodContext }> = [
  { label: '기본', value: 'normal' },
  { label: '자기 전', value: 'bed_time' },
  { label: '학원 후', value: 'after_academy' },
  { label: '시험 끝', value: 'after_exam' },
  { label: '친구와', value: 'with_friends' }
];

const openMovieSheet = (movie: RecommendedCatalogMovie) => {
  selectedMovie.value = movie;
};

const closeMovieSheet = () => {
  selectedMovie.value = null;
};

const selectedMovieRatingRecord = computed(() => {
  if (!selectedMovie.value) {
    return null;
  }

  const record = recommendationStore.getStoredRatingRecord(selectedMovie.value.id);

  if (!record) {
    return null;
  }

  return {
    ...record,
    input: {
      ...record.input,
      reviewTags: [...record.input.reviewTags],
      favoriteCharacters: [...record.input.favoriteCharacters]
    }
  } satisfies StoredRatingRecord;
});

const saveRecommendationRating = async (
  input: RatingInput,
  options: {
    detailCompleted: boolean;
    feedback?: RatingFeedbackPayload;
    rawDecision: StoredRatingRecord['rawDecision'];
  }
) => {
  if (!selectedMovie.value || isSavingRecommendationRating.value) {
    return;
  }

  isSavingRecommendationRating.value = true;

  try {
    await recommendationStore.submitSwipeRating(selectedMovie.value, input, options);
    closeMovieSheet();
  } finally {
    isSavingRecommendationRating.value = false;
  }
};

const handleRecommendationDislike = async (feedback: NegativeRatingInput) => {
  if (!selectedMovie.value) {
    return;
  }

  const payload: RatingFeedbackPayload = {
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    reviewText: feedback.reviewText,
    questionText: ''
  };

  const input: RatingInput = {
    movieId: selectedMovie.value.id,
    userId: recommendationStore.state.userId,
    status: 'dislike',
    rating: payload.rating,
    reviewTags: payload.reviewTags,
    favoriteCharacters: payload.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await saveRecommendationRating(input, {
    rawDecision: 'dislike',
    detailCompleted: true,
    feedback: payload
  });
};

const handleRecommendationLike = async (feedback: PositiveRatingInput) => {
  if (!selectedMovie.value) {
    return;
  }

  const payload: RatingFeedbackPayload = {
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    reviewText: feedback.reviewText,
    questionText: feedback.questionText
  };

  const input: RatingInput = {
    movieId: selectedMovie.value.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: payload.rating,
    reviewTags: payload.reviewTags,
    favoriteCharacters: payload.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await saveRecommendationRating(input, {
    rawDecision: 'like',
    detailCompleted: true,
    feedback: payload
  });
};

const saveRecommendedList = (list: RecommendedCatalogList) => {
  void listStore.saveRecommendedList(list);
};

const openListsPage = () => {
  void router.push('/lists');
};

const openMoreTasteAnalysis = async () => {
  if (
    recommendationStore.pendingDetailedRatings.value.length > 0 &&
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value == null
  ) {
    recommendationStore.setRatingResumeSurface('detail');
    await router.push('/rating?mode=detail');
    return;
  }

  const nextBatchIndex = recommendationStore.ensureAdditionalTasteAnalysisBatch(
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value
  );

  if (nextBatchIndex == null) {
    return;
  }

  recommendationStore.setRatingResumeSurface('more');
  await router.push({
    path: '/rating',
    query: {
      mode: 'more',
      batch: String(Date.now())
    }
  });
};

const setRecommendationContext = (context: MoodContext) => {
  void recommendationStore.setContext(context);
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-7 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="grid gap-4">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-[25px] font-semibold leading-tight text-[#15171c]">
          당신에게 맞을지도 몰라요
        </h1>
        <span class="shrink-0 text-xs font-medium text-app-muted">
          {{ recommendationStore.state.profile.totalRatings }}개 평가
        </span>
      </div>

      <div class="flex flex-wrap gap-2.5">
        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings === 0"
          to="/rating"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          취향분석 시작
        </RouterLink>

        <button
          v-else-if="hasMoreTasteAnalysis"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center gap-2 border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-[#15171c]"
          @click="openMoreTasteAnalysis"
        >
          <span
            class="corner-pill inline-flex h-5 w-5 items-center justify-center border border-app-line text-[13px] leading-none text-[#15171c]"
          >
            +
          </span>
          취향분석 더하기
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
          class="focus-ring corner-pill inline-flex min-h-8 items-center justify-center border px-3.5 text-xs font-medium"
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
          <h2 class="text-lg font-semibold text-[#15171c]">추천 영화</h2>
          <span class="text-xs text-app-muted">
            {{ recommendationStore.contextAwareRecommendedMovies.value.length }}개
          </span>
        </div>

        <div
          v-if="recommendationStore.contextAwareRecommendedMovies.value.length > 0"
          class="grid grid-cols-5 gap-2"
        >
          <RecommendationMovieCard
            v-for="movie in recommendationStore.contextAwareRecommendedMovies.value"
            :key="movie.id"
            :movie="movie"
            size="compact"
            @open="openMovieSheet"
          />
        </div>

        <div
          v-else
          class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm text-app-muted"
        >
          볼 영화가 없어요. 취향분석을 더 해보세요.
        </div>
      </section>

      <section>
        <div class="mb-3">
          <h2 class="text-lg font-semibold text-[#15171c]">사람들이 픽한 리스트</h2>
        </div>

        <div class="grid gap-3">
          <RecommendationListCard
            v-for="list in popularRecommendedLists"
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
      :is-saving-rating="isSavingRecommendationRating"
      :movie="selectedMovie"
      :rating-record="selectedMovieRatingRecord"
      @rate-dislike-submit="handleRecommendationDislike"
      @rate-like-submit="handleRecommendationLike"
      @close="closeMovieSheet"
    />
  </main>
</template>
