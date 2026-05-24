<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import {
  getAdditionalRatingBatchByIndex,
  getFollowingAdditionalBatchIndex,
  getUnratedMoviesFromAdditionalBatch,
  getUnratedMoviesFromPool,
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

const savedNotice = ref<null | { movieTitle: string; type: 'detail' | 'primary' }>(null);
let savedNoticeTimer: null | ReturnType<typeof setTimeout> = null;

const isDetailMode = computed(() => route.query.mode === 'detail');
const isMoreMode = computed(() => route.query.mode === 'more');
const batchIndex = computed(() => {
  const rawBatch = Number(route.query.batch ?? 0);
  return Number.isFinite(rawBatch) && rawBatch >= 0 ? Math.floor(rawBatch) : 0;
});
const detailBatchIndex = computed(() => {
  const rawBatch = Number(route.query.batch);

  if (!Number.isFinite(rawBatch) || rawBatch < 0) {
    return null;
  }

  return Math.floor(rawBatch);
});

const currentMoviePool = computed(() => {
  if (isDetailMode.value) {
    return [];
  }

  if (!isMoreMode.value) {
    return primaryRatingMovies;
  }

  return getAdditionalRatingBatchByIndex(batchIndex.value);
});

const currentPoolMovieIds = computed(() => currentMoviePool.value.map((movie) => movie.id));
const detailScopeMoviePool = computed(() => {
  if (!isDetailMode.value) {
    return [];
  }

  if (detailBatchIndex.value == null) {
    return primaryRatingMovies;
  }

  return getAdditionalRatingBatchByIndex(detailBatchIndex.value);
});
const detailScopeMovieIdSet = computed(() => new Set(detailScopeMoviePool.value.map((movie) => movie.id)));
const detailScopePendingRatings = computed(() =>
  recommendationStore.state.ratings.filter(
    (rating) =>
      rating.rawDecision === 'like' &&
      !rating.detailCompleted &&
      detailScopeMovieIdSet.value.has(rating.input.movieId)
  )
);
const detailQueue = computed(() =>
  detailScopePendingRatings.value
    .map((ratingRecord) =>
      recommendationStore.catalogMovies.find((movie) => movie.id === ratingRecord.input.movieId) ?? null
    )
    .filter((movie): movie is (typeof recommendationStore.catalogMovies)[number] => Boolean(movie))
);
const detailRecord = computed(() => detailScopePendingRatings.value[0] ?? null);
const detailTotalCount = computed(
  () =>
    recommendationStore.state.ratings.filter(
      (rating) => rating.rawDecision === 'like' && detailScopeMovieIdSet.value.has(rating.input.movieId)
    ).length
);
const currentBatchPendingDetailCount = computed(() =>
  recommendationStore.state.ratings.filter(
    (rating) =>
      rating.rawDecision === 'like' &&
      !rating.detailCompleted &&
      currentPoolMovieIds.value.includes(rating.input.movieId)
  ).length
);

const totalCount = computed(() => {
  if (isDetailMode.value) {
    return detailTotalCount.value;
  }

  return currentMoviePool.value.length;
});

const completedCount = computed(() => {
  if (isDetailMode.value) {
    return Math.max(0, detailTotalCount.value - detailScopePendingRatings.value.length);
  }

  return recommendationStore.state.ratings.filter((rating) =>
    currentPoolMovieIds.value.includes(rating.input.movieId)
  ).length;
});

const currentMovie = computed(() => {
  if (isDetailMode.value) {
    return detailQueue.value[0] ?? null;
  }

  if (isMoreMode.value) {
    return (
      getUnratedMoviesFromAdditionalBatch(recommendationStore.ratedMovieIds.value, batchIndex.value)[0] ??
      null
    );
  }

  return getUnratedMoviesFromPool(recommendationStore.ratedMovieIds.value, currentMoviePool.value)[0] ?? null;
});

const currentQuestion = computed(() =>
  currentMovie.value ? getCharacterQuestionByGenre(currentMovie.value.genres[0] ?? '') : ''
);

const currentCharacterChoices = computed(() =>
  currentMovie.value ? getCharacterChoices(currentMovie.value.id, currentMovie.value.characters) : []
);

const initialFeedback = computed(() => {
  const record = detailRecord.value;

  if (!record) {
    return null;
  }

  return {
    stars: record.input.rating ?? 4.5,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacter: record.input.favoriteCharacter,
    reviewText: record.reviewText,
    questionText: record.questionText
  };
});

const nextAdditionalBatchIndex = computed(() => {
  if (isDetailMode.value) {
    if (detailBatchIndex.value == null) {
      return recommendationStore.nextAdditionalBatchIndex.value;
    }

    return getFollowingAdditionalBatchIndex(recommendationStore.ratedMovieIds.value, detailBatchIndex.value);
  }

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

const detailRatingLink = computed(() =>
  currentBatchPendingDetailCount.value > 0
    ? isMoreMode.value
      ? `/rating?mode=detail&batch=${batchIndex.value}`
      : '/rating?mode=detail'
    : null
);

const secondaryAction = computed<null | { label: string; to: string }>(() => {
  if (!isDetailMode.value && detailRatingLink.value) {
    return {
      label: '상세 평가하러가기',
      to: detailRatingLink.value
    };
  }

  if (nextAdditionalBatchLink.value) {
    return {
      label: '더 하기',
      to: nextAdditionalBatchLink.value
    };
  }

  return null;
});

const stageLabel = computed(() => {
  if (isDetailMode.value) {
    return currentMovie.value ? '상세 평가' : '상세 평가 완료';
  }

  if (currentMovie.value) {
    return isMoreMode.value ? '추가 취향분석' : '취향분석';
  }

  return isMoreMode.value ? '추가 취향분석 완료' : '취향분석 완료';
});

const showSavedNotice = (movieTitle: string, type: 'detail' | 'primary') => {
  savedNotice.value = { movieTitle, type };

  if (savedNoticeTimer) {
    clearTimeout(savedNoticeTimer);
  }

  savedNoticeTimer = setTimeout(() => {
    savedNotice.value = null;
    savedNoticeTimer = null;
  }, 2200);

  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const saveSwipeDecision = async (decision: RatingDecision | 'not_interested') => {
  const movie = currentMovie.value;

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

  showSavedNotice(movie.title, 'primary');
};

const submitPositiveFeedback = async (feedback: PositiveRatingInput) => {
  const movie = currentMovie.value;

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

  await recommendationStore.submitSwipeRating(movie, input, {
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

  showSavedNotice(movie.title, 'detail');
};

const skipPositiveFeedback = async () => {
  const movie = currentMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: null,
    reviewTags: [],
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    detailCompleted: true
  });

  showSavedNotice(movie.title, 'detail');
};

const handleKeydown = (event: KeyboardEvent) => {
  if (isDetailMode.value || !currentMovie.value) {
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
    <RatingProgress :current="completedCount" :total="totalCount" :stage-label="stageLabel" />

    <section v-if="savedNotice" class="rounded-2xl border border-app-line bg-app-panel px-4 py-3">
      <p class="text-sm font-semibold text-white">{{ savedNotice.movieTitle }} 저장됨</p>
      <p class="mt-1 text-sm text-app-muted">
        {{
          savedNotice.type === 'detail'
            ? '상세 평가를 저장했고, 다음 영화로 넘어가고 있어요.'
            : '평가를 저장했고, 다음 영화로 넘어가고 있어요.'
        }}
      </p>
    </section>

    <section
      v-if="!isDetailMode && isMoreMode && recommendationStore.state.profile.totalRatings > 0"
      class="flex justify-end"
    >
      <RouterLink
        to="/recommendations"
        class="focus-ring inline-flex min-h-10 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white/88"
      >
        지금 추천 보기
      </RouterLink>
    </section>

    <template v-if="currentMovie">
      <template v-if="isDetailMode">
        <section class="rounded-2xl border border-app-line bg-app-panel px-5 py-4">
          <p class="text-sm font-semibold text-white">좋다고 한 영화만 다시 볼게요.</p>
          <p class="mt-2 text-sm leading-6 text-app-muted">
            별점과 좋았던 포인트를 남기면 추천이 조금 더 또렷해져요.
          </p>
        </section>

        <RatingMovieCard
          :key="currentMovie.id"
          :movie="currentMovie"
          :interactive="false"
          size="detail"
        />

        <div class="flex justify-end">
          <WatchToggleButton :movie-id="currentMovie.id" size="md" />
        </div>

        <PositiveFeedbackForm
          :key="`${currentMovie.id}-detail`"
          :characters="currentCharacterChoices"
          :question-text="currentQuestion"
          :initial-value="initialFeedback"
          submit-label="상세 평가 저장하기"
          @skip="skipPositiveFeedback"
          @submit="submitPositiveFeedback"
        />
      </template>

      <template v-else>
        <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />
        <div class="flex justify-end">
          <WatchToggleButton :movie-id="currentMovie.id" size="md" />
        </div>
        <RatingActions @decide="saveSwipeDecision" />
      </template>
    </template>

    <section v-else class="rounded-2xl border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">
        {{ isDetailMode ? 'Details' : isMoreMode ? 'More' : 'Done' }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold text-white">
        {{
          isDetailMode
            ? '상세 평가까지 저장했어요.'
            : isMoreMode
              ? '추천이 더 또렷해졌어요.'
              : '추천을 시작할 준비가 됐어요.'
        }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-app-muted">
        {{
          isDetailMode
            ? '이제 추천으로 넘어가도 좋고, 더 보고 싶다면 다음 배치도 이어서 볼 수 있어요.'
            : '몇 개만 더 쌓이면 취향이 더 선명해져요. 상세 평가는 원할 때만 이어서 하면 돼요.'
        }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          to="/recommendations"
          class="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg bg-app-accent px-4 text-sm font-semibold text-white"
        >
          추천 보러 가기
        </RouterLink>

        <RouterLink
          v-if="secondaryAction"
          :to="secondaryAction.to"
          class="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-white/88"
        >
          {{ secondaryAction.label }}
        </RouterLink>
      </div>

      <p v-if="!isDetailMode && !isMoreMode" class="mt-4 text-sm text-app-muted">
        이번 배치 {{ initialTasteAnalysisCount }}개를 모두 평가했어요.
      </p>

      <p v-else-if="!isDetailMode && !nextAdditionalBatchLink" class="mt-4 text-sm text-app-muted">
        지금 준비한 추가 취향분석은 여기까지예요.
      </p>
    </section>
  </main>
</template>
