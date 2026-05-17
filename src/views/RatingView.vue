<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import {
  getAdditionalRatingBatchByIndex,
  getFollowingAdditionalBatchIndex,
  getUnratedMoviesFromAdditionalBatch,
  getUnratedMoviesFromPool,
  hasAdditionalTasteAnalysisMovies,
  initialTasteAnalysisCount,
  primaryRatingMovies
} from '@/data/rating';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { PositiveRatingInput, RatingDecision } from '@/types/rating';

const recommendationStore = useRecommendationStore();
const route = useRoute();
const router = useRouter();
const savedNotice = ref('');
const detailRequested = ref(false);
let savedNoticeTimer: ReturnType<typeof setTimeout> | null = null;

const isMoreMode = computed(() => route.query.mode === 'more');
const batchIndex = computed(() => {
  const rawBatch = Number(route.query.batch ?? 0);
  return Number.isFinite(rawBatch) && rawBatch >= 0 ? Math.floor(rawBatch) : 0;
});

const currentMoviePool = computed(() => {
  if (!isMoreMode.value) {
    return primaryRatingMovies;
  }

  return getAdditionalRatingBatchByIndex(batchIndex.value);
});

const currentPoolMovieIds = computed(() => currentMoviePool.value.map((movie) => movie.id));

const totalCount = computed(() => currentMoviePool.value.length);
const completedCount = computed(() =>
  recommendationStore.state.ratings.filter((rating) => currentPoolMovieIds.value.includes(rating.input.movieId))
    .length
);

const swipeStageMovie = computed(() => {
  if (isMoreMode.value) {
    return getUnratedMoviesFromAdditionalBatch(recommendationStore.ratedMovieIds.value, batchIndex.value)[0] ?? null;
  }

  return getUnratedMoviesFromPool(recommendationStore.ratedMovieIds.value, currentMoviePool.value)[0] ?? null;
});

const pendingDetailRatingsInPool = computed(() =>
  recommendationStore.pendingDetailedRatings.value.filter((rating) =>
    currentPoolMovieIds.value.includes(rating.input.movieId)
  )
);

const detailStageMovie = computed(() => {
  if (!detailRequested.value) {
    return null;
  }

  const pendingRecord = pendingDetailRatingsInPool.value[0];

  if (!pendingRecord) {
    return null;
  }

  return recommendationStore.catalogMovies.find((movie) => movie.id === pendingRecord.input.movieId) ?? null;
});

const isSwipeStage = computed(() => Boolean(swipeStageMovie.value));
const shouldPromptDetailChoice = computed(
  () => !swipeStageMovie.value && pendingDetailRatingsInPool.value.length > 0 && !detailRequested.value
);
const isDetailStage = computed(() => Boolean(detailStageMovie.value));
const isComplete = computed(
  () => !swipeStageMovie.value && !shouldPromptDetailChoice.value && !isDetailStage.value
);

const currentMovie = computed(() => swipeStageMovie.value ?? detailStageMovie.value);

const likedCount = computed(
  () =>
    pendingDetailRatingsInPool.value.length +
    recommendationStore.state.ratings.filter(
      (rating) =>
        rating.rawDecision === 'like' &&
        rating.detailCompleted &&
        currentPoolMovieIds.value.includes(rating.input.movieId)
    ).length
);

const detailCompletedCount = computed(
  () =>
    recommendationStore.state.ratings.filter(
      (rating) =>
        rating.rawDecision === 'like' &&
        rating.detailCompleted &&
        currentPoolMovieIds.value.includes(rating.input.movieId)
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

const nextAdditionalBatchIndex = computed(() => {
  if (!isMoreMode.value) {
    return recommendationStore.nextAdditionalBatchIndex.value;
  }

  return getFollowingAdditionalBatchIndex(recommendationStore.ratedMovieIds.value, batchIndex.value);
});

const nextAdditionalBatchLink = computed(() => {
  if (nextAdditionalBatchIndex.value == null) {
    return null;
  }

  return `/rating?mode=more&batch=${nextAdditionalBatchIndex.value}`;
});

const stageLabel = computed(() => {
  if (isSwipeStage.value) {
    return isMoreMode.value ? '추가 취향분석' : '1차 취향분석';
  }

  if (shouldPromptDetailChoice.value) {
    return '상세평가 선택';
  }

  if (isDetailStage.value) {
    return '상세 취향분석';
  }

  return '취향분석 완료';
});

const showSavedNotice = (movieTitle: string) => {
  savedNotice.value = `"${movieTitle}" 저장됨. 다음 영화로 넘어갈게요.`;

  if (savedNoticeTimer) {
    clearTimeout(savedNoticeTimer);
  }

  savedNoticeTimer = setTimeout(() => {
    savedNotice.value = '';
    savedNoticeTimer = null;
  }, 1800);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const saveSwipeDecision = async (decision: RatingDecision | 'not_interested') => {
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

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: decision,
    detailCompleted: decision !== 'like'
  });
};

const completeDetailedLike = async (feedback?: PositiveRatingInput) => {
  const movie = detailStageMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: feedback?.stars ?? null,
    reviewTags: feedback?.reviewTags ?? [],
    favoriteCharacter: feedback?.favoriteCharacter ?? null,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    detailCompleted: true,
    feedback: {
      rating: feedback?.stars ?? 0,
      reviewTags: feedback?.reviewTags ?? [],
      favoriteCharacter: feedback?.favoriteCharacter ?? null,
      reviewText: feedback?.reviewText ?? '',
      questionText: ''
    }
  });

  showSavedNotice(movie.title);
};

const submitPositiveFeedback = async (feedback: PositiveRatingInput) => {
  await completeDetailedLike(feedback);
};

const submitUnknownFeedback = async () => {
  await completeDetailedLike();
};

const startDetailStage = () => {
  detailRequested.value = true;
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const skipDetailStage = async () => {
  detailRequested.value = false;
  await router.push('/recommendations');
};

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
    void saveSwipeDecision('dislike');
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    void saveSwipeDecision('like');
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    void saveSwipeDecision('not_seen');
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    void saveSwipeDecision('not_interested');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);

  if (savedNoticeTimer) {
    clearTimeout(savedNoticeTimer);
  }
});
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <section
        v-if="savedNotice"
        class="rounded-[16px] border border-app-line bg-white/[0.05] px-4 py-3 text-sm font-bold text-white"
      >
        {{ savedNotice }}
      </section>
    </transition>

    <RatingProgress
      :current="completedCount"
      :total="totalCount"
      :stage-label="stageLabel"
      :detail-current="detailCompletedCount"
      :detail-total="likedCount"
    />

    <section
      v-if="isMoreMode && recommendationStore.state.profile.totalRatings > 0"
      class="flex justify-end"
    >
      <RouterLink
        to="/recommendations"
        class="focus-ring inline-flex min-h-10 items-center justify-center rounded-[14px] border border-app-line bg-white/5 px-4 text-sm font-bold text-white"
      >
        지금 추천 보기
      </RouterLink>
    </section>

    <template v-if="isSwipeStage && currentMovie">
      <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />
      <RatingActions @decide="saveSwipeDecision" />
    </template>

    <section v-else-if="shouldPromptDetailChoice" class="rounded-[24px] border border-app-line bg-app-panel p-5">
      <p class="text-sm font-bold text-app-accent">1차 취향분석 완료</p>
      <h1 class="mt-2 text-2xl font-black text-white">상세평가는 원할 때만 하면 돼요.</h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        재밌게 고른 영화 {{ pendingDetailRatingsInPool.length }}개를 더 자세히 남길 수 있어요.
        지금 바로 해도 되고, 일단 넘어가도 괜찮아요.
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          class="app-gradient focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] px-4 text-sm font-extrabold text-white"
          @click="startDetailStage"
        >
          상세평가하기
        </button>
        <button
          type="button"
          class="focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
          @click="skipDetailStage"
        >
          넘어가기
        </button>
      </div>
    </section>

    <template v-else-if="isDetailStage && currentMovie">
      <section class="rounded-[20px] border border-app-line bg-app-panel p-4">
        <p class="text-sm font-bold text-app-accent">
          {{ isMoreMode ? '추가로 고른 영화 상세 취향분석' : '재밌게 고른 영화 상세 취향분석' }}
        </p>
        <p class="mt-2 text-sm leading-6 text-[#c8d1df]">
          별점과 좋았던 포인트를 남기고, 가장 좋았던 캐릭터도 골라 주세요.
        </p>
      </section>

      <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />

      <PositiveFeedbackForm
        :key="currentMovie.id"
        :characters="currentCharacterChoices"
        :question-text="currentQuestion"
        @submit="submitPositiveFeedback"
        @skip="submitUnknownFeedback"
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
          v-if="!isMoreMode && hasMoreTasteAnalysis && nextAdditionalBatchLink"
          :to="nextAdditionalBatchLink"
          class="focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
        >
          취향 더 분석하기
        </RouterLink>

        <RouterLink
          v-else-if="isMoreMode && nextAdditionalBatchLink"
          :to="nextAdditionalBatchLink"
          class="focus-ring inline-flex min-h-12 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
        >
          다음 20개 더 보기
        </RouterLink>
      </div>
    </section>
  </main>
</template>
