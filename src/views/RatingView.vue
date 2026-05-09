<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import SwipeGuide from '@/components/rating/SwipeGuide.vue';
import {
  additionalRatingMovies,
  getUnratedMoviesFromPool,
  hasAdditionalTasteAnalysisMovies,
  initialTasteAnalysisCount,
  primaryRatingMovies
} from '@/data/rating';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { PositiveRatingInput, RatingDecision, RatingResult } from '@/types/rating';

const recommendationStore = useRecommendationStore();
const route = useRoute();
const results = ref<RatingResult[]>([]);

const isMoreMode = computed(() => route.query.mode === 'more');
const currentMoviePool = computed(() => (isMoreMode.value ? additionalRatingMovies : primaryRatingMovies));
const currentPoolMovieIds = computed(() => currentMoviePool.value.map((movie) => movie.id));

const totalCount = computed(() => currentMoviePool.value.length);
const completedCount = computed(() =>
  recommendationStore.state.ratings.filter((rating) => currentPoolMovieIds.value.includes(rating.input.movieId))
    .length
);

const swipeStageMovie = computed(() => {
  const unratedMovies = getUnratedMoviesFromPool(recommendationStore.ratedMovieIds.value, currentMoviePool.value);
  return unratedMovies[0] ?? null;
});

const detailStageMovie = computed(() => recommendationStore.getPendingDetailMovie());
const isSwipeStage = computed(() => Boolean(swipeStageMovie.value));
const isDetailStage = computed(() => !swipeStageMovie.value && Boolean(detailStageMovie.value));
const currentMovie = computed(() => swipeStageMovie.value ?? detailStageMovie.value);

const likedCount = computed(
  () =>
    recommendationStore.pendingDetailedRatings.value.length +
    recommendationStore.state.ratings.filter(
      (rating) => rating.rawDecision === 'like' && rating.detailCompleted
    ).length
);

const detailCompletedCount = computed(
  () =>
    recommendationStore.state.ratings.filter(
      (rating) => rating.rawDecision === 'like' && rating.detailCompleted
    ).length
);

const currentQuestion = computed(() =>
  currentMovie.value ? getCharacterQuestionByGenre(currentMovie.value.genres[0] ?? '') : ''
);

const currentCharacterChoices = computed(() =>
  currentMovie.value ? getCharacterChoices(currentMovie.value.id, currentMovie.value.characters) : []
);

const hasMoreTasteAnalysis = computed(
  () => !isMoreMode.value && hasAdditionalTasteAnalysisMovies(recommendationStore.ratedMovieIds.value)
);

const saveSwipeDecision = (decision: RatingDecision | 'not_interested') => {
  const movie = swipeStageMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: decision === 'not_interested' ? 'dislike' : decision,
    rating: null,
    reviewTags: [],
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: decision,
    detailCompleted: decision !== 'like'
  });

  results.value.push({
    movieId: movie.id,
    decision: decision === 'not_interested' ? 'dislike' : decision
  });
};

const submitPositiveFeedback = (feedback: PositiveRatingInput) => {
  const movie = detailStageMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacter: feedback.favoriteCharacter,
    answeredAt: new Date().toISOString()
  };

  recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    detailCompleted: true,
    feedback: {
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacter: feedback.favoriteCharacter,
      reviewText: feedback.reviewText,
      questionText: ''
    }
  });

  results.value.push({
    movieId: movie.id,
    decision: 'like',
    feedback
  });
};

const isComplete = computed(() => !swipeStageMovie.value && !detailStageMovie.value);

const handleKeydown = (event: KeyboardEvent) => {
  if (!isSwipeStage.value) {
    return;
  }

  const target = event.target as HTMLElement | null;

  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    saveSwipeDecision('dislike');
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    saveSwipeDecision('like');
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    saveSwipeDecision('not_seen');
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    saveSwipeDecision('not_interested');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <RatingProgress
      :current="completedCount"
      :total="totalCount"
      :stage-label="
        isSwipeStage
          ? isMoreMode
            ? '추가 취향분석'
            : '1차 취향분석'
          : isDetailStage
            ? '상세 취향분석'
            : '취향분석 완료'
      "
      :detail-current="detailCompletedCount"
      :detail-total="likedCount"
    />

    <template v-if="isSwipeStage && currentMovie">
      <SwipeGuide />
      <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />
      <RatingActions @decide="saveSwipeDecision" />
    </template>

    <template v-else-if="isDetailStage && currentMovie">
      <section class="rounded-[20px] border border-app-line bg-app-panel p-4">
        <p class="text-sm font-bold text-app-accent">
          {{ isMoreMode ? '추가로 고른 영화 상세 취향분석' : '재밌게 고른 영화 상세 취향분석' }}
        </p>
        <p class="mt-2 text-sm leading-6 text-[#c8d1df]">
          재밌었던 영화만 별점, 좋았던 포인트, 캐릭터 질문으로 더 자세히 남겨주세요.
        </p>
      </section>

      <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />

      <PositiveFeedbackForm
        :characters="currentCharacterChoices"
        :question-text="currentQuestion"
        @submit="submitPositiveFeedback"
      />
    </template>

    <section v-else-if="isComplete" class="rounded-[24px] border border-app-line bg-app-panel p-5">
      <p class="text-sm font-bold text-app-accent">
        {{ isMoreMode ? '추가 취향분석 완료' : `${initialTasteAnalysisCount}개 취향분석 완료` }}
      </p>
      <h1 class="mt-2 text-2xl font-black text-white">
        {{ isMoreMode ? '추천이 더 정교해졌어요.' : '추천이 준비됐어요.' }}
      </h1>

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          to="/recommendations"
          class="app-gradient focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] px-4 text-sm font-extrabold text-white"
        >
          추천 보러 가기
        </RouterLink>

        <RouterLink
          v-if="hasMoreTasteAnalysis"
          to="/rating?mode=more"
          class="focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
        >
          취향 더 분석하기
        </RouterLink>
      </div>
    </section>
  </main>
</template>
