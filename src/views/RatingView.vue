<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import NegativeFeedbackForm from '@/components/rating/NegativeFeedbackForm.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { CatalogMovie, RatingResumeSurface, StoredRatingRecord } from '@/types/recommendation';
import { getDetailedRatingFeedbackMode, toStoredRatingStatus } from '@/types/rating';
import type {
  NegativeRatingInput,
  PositiveRatingInput,
  RatingDirection,
  RatingSelection
} from '@/types/rating';

const recommendationStore = useRecommendationStore();
const route = useRoute();
const router = useRouter();

const manualSearchQuery = ref('');
const manualSelectedMovie = ref<null | CatalogMovie>(null);
const manualFeedbackMode = ref<null | 'dislike' | 'positive'>(null);
const manualRatingDirection = ref<null | RatingDirection>(null);
const activeAdditionalBatchIndex = ref<null | number>(null);
const isSavingManualDecision = ref(false);
const isSavingPrimaryDecision = ref(false);
const manualFeedbackFormContainer = ref<HTMLElement | null>(null);
const primaryFlowTop = ref<HTMLElement | null>(null);
const detailFlowTop = ref<HTMLElement | null>(null);

const isDetailMode = computed(() => route.query.mode === 'detail');
const isMoreMode = computed(() => route.query.mode === 'more');
const pendingDetailedRatings = computed(() => recommendationStore.pendingDetailedRatings.value);
const tasteAnalysisMovieIdSet = computed(
  () =>
    new Set([
      ...recommendationStore.primaryRatingMovies.value.map((movie) => movie.id),
      ...recommendationStore.state.additionalTasteAnalysisBatches.flatMap((batch) => batch.movieIds)
    ])
);
const detailRatingRecords = computed(() =>
  recommendationStore.state.ratings.filter(
    (rating) =>
      tasteAnalysisMovieIdSet.value.has(rating.input.movieId) &&
      getDetailedRatingFeedbackMode(rating.rawDecision, rating.rawDirection) != null
  )
);
const pendingDetailedTasteAnalysisRatings = computed(() =>
  pendingDetailedRatings.value.filter((rating) => tasteAnalysisMovieIdSet.value.has(rating.input.movieId))
);
const activeRatingMovies = computed(() =>
  activeAdditionalBatchIndex.value != null
    ? recommendationStore.getAdditionalTasteAnalysisBatchMovies(activeAdditionalBatchIndex.value)
    : recommendationStore.primaryRatingMovies.value
);
const activeRatingMovieIdSet = computed(() => new Set(activeRatingMovies.value.map((movie) => movie.id)));
const activeRatedCount = computed(
  () =>
    recommendationStore.state.ratings.filter((rating) =>
      activeRatingMovieIdSet.value.has(rating.input.movieId)
    ).length
);
const currentRatingMovie = computed(() =>
  activeAdditionalBatchIndex.value != null
    ? recommendationStore.getNextRatingMovie({
        additionalBatchIndex: activeAdditionalBatchIndex.value
      })
    : recommendationStore.getNextRatingMovie()
);
const currentDetailMovie = computed(() => recommendationStore.getPendingDetailMovie());
const currentMovie = computed(() => (isDetailMode.value ? currentDetailMovie.value : currentRatingMovie.value));
const isAdditionalTasteAnalysisSurface = computed(() => {
  const surface = recommendationStore.state.ratingResumeSurface;

  return (
    isMoreMode.value &&
    (activeAdditionalBatchIndex.value != null || surface === 'more' || surface === 'more_completion')
  );
});
const currentRatingResumeSurface = computed<null | RatingResumeSurface>(() => {
  if (isDetailMode.value) {
    return currentMovie.value ? 'detail' : 'detail_completion';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return currentMovie.value ? 'more' : 'more_completion';
  }

  return currentMovie.value ? 'primary' : 'primary_completion';
});

const currentDetailRecord = computed<null | StoredRatingRecord>(() => {
  if (!currentDetailMovie.value) {
    return null;
  }

  const record =
    recommendationStore.state.ratings.find(
      (rating) =>
        rating.input.movieId === currentDetailMovie.value?.id &&
        rating.rawDecision !== 'not_seen' &&
        !rating.detailCompleted
    ) ?? null;

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
  };
});

const currentQuestion = computed(() =>
  currentDetailMovie.value ? getCharacterQuestionByGenre(currentDetailMovie.value.genres[0] ?? '') : ''
);
const currentCharacterChoices = computed(() =>
  currentDetailMovie.value
    ? getCharacterChoices(currentDetailMovie.value.id, currentDetailMovie.value.characters)
    : []
);
const currentDetailFeedbackMode = computed(() => {
  const record = currentDetailRecord.value;
  return record ? getDetailedRatingFeedbackMode(record.rawDecision, record.rawDirection) : null;
});
const isCurrentDetailPositive = computed(() => currentDetailFeedbackMode.value === 'positive');

const initialFeedback = computed(() => {
  const record = currentDetailRecord.value;

  if (!record || currentDetailFeedbackMode.value !== 'positive') {
    return null;
  }

  return {
    stars: record.input.rating ?? 4.5,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacters: [...record.input.favoriteCharacters],
    reviewText: record.reviewText,
    questionText: record.questionText
  };
});

const initialNegativeFeedback = computed(() => {
  const record = currentDetailRecord.value;

  if (!record || currentDetailFeedbackMode.value !== 'negative') {
    return null;
  }

  return {
    stars: record.input.rating ?? null,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacters: [...record.input.favoriteCharacters],
    reviewText: record.reviewText
  };
});

const searchableManualMovies = computed(() => {
  const query = manualSearchQuery.value.trim().toLocaleLowerCase();
  const ratedMovieIdSet = new Set(recommendationStore.ratedMovieIds.value);

  return recommendationStore.catalogMovies
    .filter((movie) => !ratedMovieIdSet.has(movie.id))
    .filter((movie) => {
      if (!query) {
        return true;
      }

      const haystack = [
        movie.title,
        String(movie.releaseYear),
        movie.overview,
        ...movie.genres,
        ...movie.tags,
        ...movie.characters
      ]
        .join(' ')
        .toLocaleLowerCase();

      return haystack.includes(query);
    })
    .slice(0, 8);
});

const manualMovieQuestion = computed(() =>
  manualSelectedMovie.value ? getCharacterQuestionByGenre(manualSelectedMovie.value.genres[0] ?? '') : ''
);
const manualMovieCharacterChoices = computed(() =>
  manualSelectedMovie.value
    ? getCharacterChoices(manualSelectedMovie.value.id, manualSelectedMovie.value.characters)
    : []
);

const syncAdditionalBatchIndex = () => {
  if (isDetailMode.value) {
    activeAdditionalBatchIndex.value = null;
    return;
  }

  if (recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value != null) {
    activeAdditionalBatchIndex.value = recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value;
    return;
  }

  if (isMoreMode.value) {
    if (pendingDetailedRatings.value.length > 0) {
      activeAdditionalBatchIndex.value = null;
      return;
    }

    activeAdditionalBatchIndex.value = null;
    return;
  }

  activeAdditionalBatchIndex.value = null;
};

watch(
  [
    isDetailMode,
    isMoreMode,
    () => route.fullPath,
    () => recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value,
    () => recommendationStore.hasAdditionalTasteAnalysisMovies.value,
    () => recommendationStore.state.ratings.length
  ],
  () => {
    syncAdditionalBatchIndex();
  },
  { immediate: true }
);

watch(
  currentRatingResumeSurface,
  (surface) => {
    if (!surface) {
      return;
    }

    recommendationStore.setRatingResumeSurface(surface);
  },
  { immediate: true }
);

const totalCount = computed(() => {
  if (isDetailMode.value) {
    return detailRatingRecords.value.length;
  }

  return activeRatingMovies.value.length;
});

const completedCount = computed(() => {
  if (isDetailMode.value) {
    return Math.max(0, detailRatingRecords.value.length - pendingDetailedTasteAnalysisRatings.value.length);
  }

  return activeRatedCount.value;
});

const stageLabel = computed(() => {
  if (isDetailMode.value) {
    return currentDetailMovie.value ? '상세 평가 진행' : '상세 평가 완료';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return currentRatingMovie.value ? '추가 취향분석 진행' : '추가 취향분석 완료';
  }

  return currentRatingMovie.value ? '취향분석 진행' : '취향분석 완료';
});

const completionTitle = computed(() => {
  if (isDetailMode.value) {
    return '상세 평가를 마쳤어요.';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return '추가 20편 평가가 끝났어요.';
  }

  return '취향분석이 끝났어요.';
});

const completionDescription = computed(() => {
  if (isDetailMode.value) {
    return '남겨준 감상을 더 자세히 반영해서 추천을 더 정확하게 맞출게요.';
  }

  if (currentDetailMovie.value) {
    return '재밌음과 재미없음으로 남긴 영화들을 마지막에 한 번에 상세 평가할 수 있어요.';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return '이번 20편 평가도 기존 취향기록에 누적했어요. 더 이어서 평가하거나 바로 추천을 볼 수 있어요.';
  }

  return '영화를 하나씩 남긴 평가를 바탕으로 추천을 준비했어요.';
});

const secondaryAction = computed<null | { isMoreAction?: boolean; label: string; to: string }>(() => {
  if (!isDetailMode.value && currentDetailMovie.value) {
    return {
      label: '상세 평가하러 가기',
      to: '/rating?mode=detail'
    };
  }

  if (!isDetailMode.value && recommendationStore.hasAdditionalTasteAnalysisMovies.value) {
    return {
      label: '다음 20편 평가하기',
      to: '/rating?mode=more',
      isMoreAction: true
    };
  }

  if (isDetailMode.value && currentRatingMovie.value) {
    return {
      label: '평가 이어가기',
      to: activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating'
    };
  }

  return null;
});

const openNextAdditionalTasteAnalysis = async () => {
  const nextBatchIndex = recommendationStore.ensureAdditionalTasteAnalysisBatch(
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value
  );

  if (nextBatchIndex == null) {
    return;
  }

  activeAdditionalBatchIndex.value = nextBatchIndex;
  recommendationStore.setRatingResumeSurface('more');

  await router.push({
    path: '/rating',
    query: {
      mode: 'more',
      batch: String(Date.now())
    }
  });
};

const scrollToContainer = async (containerRef: { value: HTMLElement | null }) => {
  await nextTick();
  containerRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};

const scrollToNextDetailMovie = async () => {
  if (!isDetailMode.value || !recommendationStore.getPendingDetailMovie()) {
    return;
  }

  await scrollToContainer(detailFlowTop);
};

const scrollToNextPrimaryMovie = async () => {
  if (isDetailMode.value || !currentRatingMovie.value) {
    return;
  }

  await scrollToContainer(primaryFlowTop);
};

const fallbackDirectionByDecision: Record<RatingSelection['decision'], RatingDirection> = {
  like: 'right',
  dislike: 'left',
  not_interested: 'down',
  not_seen: 'enter'
};

const normalizeSelection = (
  selection: RatingSelection | RatingSelection['decision']
): RatingSelection =>
  typeof selection === 'string'
    ? {
        decision: selection,
        direction: fallbackDirectionByDecision[selection]
      }
    : selection;

const resetManualRatingFlow = () => {
  manualSelectedMovie.value = null;
  manualFeedbackMode.value = null;
  manualRatingDirection.value = null;
};

const savePrimaryMovieDecision = async (selection: RatingSelection | RatingSelection['decision']) => {
  const movie = currentRatingMovie.value;

  if (!movie || isDetailMode.value || isSavingPrimaryDecision.value) {
    return;
  }

  const { decision, direction } = normalizeSelection(selection);

  isSavingPrimaryDecision.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.id,
      userId: recommendationStore.state.userId,
      status: toStoredRatingStatus(decision),
      rating: null,
      reviewTags: [],
      favoriteCharacters: [],
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie, input, {
      rawDecision: decision,
      rawDirection: direction,
      detailCompleted: getDetailedRatingFeedbackMode(decision, direction) == null
    });
    await scrollToNextPrimaryMovie();
  } finally {
    isSavingPrimaryDecision.value = false;
  }
};

const submitNegativeFeedback = async (feedback: NegativeRatingInput) => {
  const movie = currentDetailMovie.value;
  const record = currentDetailRecord.value;

  if (!movie || !record || getDetailedRatingFeedbackMode(record.rawDecision, record.rawDirection) !== 'negative') {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'dislike',
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: record.rawDecision,
    rawDirection: record.rawDirection,
    detailCompleted: true,
    feedback: {
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacters: feedback.favoriteCharacters,
      reviewText: feedback.reviewText,
      questionText: ''
    }
  });
  await scrollToNextDetailMovie();

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }
};

const submitPositiveFeedback = async (feedback: PositiveRatingInput) => {
  const movie = currentDetailMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    rawDirection: currentDetailRecord.value?.rawDirection ?? null,
    detailCompleted: true,
    feedback: {
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacters: feedback.favoriteCharacters,
      reviewText: feedback.reviewText,
      questionText: ''
    }
  });
  await scrollToNextDetailMovie();

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }
};

const skipPositiveFeedback = async () => {
  const movie = currentDetailMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: currentDetailRecord.value?.input.rating ?? null,
    reviewTags: [],
    favoriteCharacters: [],
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    rawDirection: currentDetailRecord.value?.rawDirection ?? null,
    detailCompleted: true
  });
  await scrollToNextDetailMovie();

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }
};

const skipNegativeFeedback = async () => {
  const movie = currentDetailMovie.value;
  const record = currentDetailRecord.value;

  if (!movie || !record || getDetailedRatingFeedbackMode(record.rawDecision, record.rawDirection) !== 'negative') {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'dislike',
    rating: record.input.rating ?? null,
    reviewTags: [],
    favoriteCharacters: [],
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: record.rawDecision,
    rawDirection: record.rawDirection,
    detailCompleted: true
  });
  await scrollToNextDetailMovie();

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }
};

const selectManualMovie = (movie: CatalogMovie) => {
  manualSelectedMovie.value = movie;
  manualFeedbackMode.value = null;
  manualRatingDirection.value = null;
};

const saveManualMovieDecision = async (selection: RatingSelection | RatingSelection['decision']) => {
  const movie = manualSelectedMovie.value;

  if (!movie || isSavingManualDecision.value) {
    return;
  }

  const { decision, direction } = normalizeSelection(selection);
  const feedbackMode = getDetailedRatingFeedbackMode(decision, direction);

  if (feedbackMode === 'positive') {
    manualFeedbackMode.value = 'positive';
    manualRatingDirection.value = direction;
    await scrollToContainer(manualFeedbackFormContainer);
    return;
  }

  if (feedbackMode === 'negative') {
    manualFeedbackMode.value = 'dislike';
    manualRatingDirection.value = direction;
    await scrollToContainer(manualFeedbackFormContainer);
    return;
  }

  manualFeedbackMode.value = null;
  manualRatingDirection.value = direction;
  isSavingManualDecision.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.id,
      userId: recommendationStore.state.userId,
      status: toStoredRatingStatus(decision),
      rating: null,
      reviewTags: [],
      favoriteCharacters: [],
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie, input, {
      rawDecision: decision,
      rawDirection: direction,
      detailCompleted: true
    });
    resetManualRatingFlow();
    manualSearchQuery.value = '';
  } finally {
    isSavingManualDecision.value = false;
  }
};

const submitManualPositiveFeedback = async (feedback: PositiveRatingInput) => {
  const movie = manualSelectedMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    rawDirection: manualRatingDirection.value,
    detailCompleted: true,
    feedback: {
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacters: feedback.favoriteCharacters,
      reviewText: feedback.reviewText,
      questionText: ''
    }
  });
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

const submitManualNegativeFeedback = async (feedback: NegativeRatingInput) => {
  const movie = manualSelectedMovie.value;

  if (!movie) {
    return;
  }

    const input: RatingInput = {
      movieId: movie.id,
      userId: recommendationStore.state.userId,
    status: 'dislike',
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'dislike',
    rawDirection: manualRatingDirection.value,
    detailCompleted: true,
      feedback: {
        rating: feedback.stars,
        reviewTags: feedback.reviewTags,
        favoriteCharacters: feedback.favoriteCharacters,
        reviewText: feedback.reviewText,
        questionText: ''
      }
  });
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

const skipManualPositiveFeedback = async () => {
  const movie = manualSelectedMovie.value;

  if (!movie) {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'like',
    rating: null,
    reviewTags: [],
    favoriteCharacters: [],
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    rawDirection: manualRatingDirection.value,
    detailCompleted: true
  });
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

const skipManualNegativeFeedback = async () => {
  const movie = manualSelectedMovie.value;

  if (!movie || manualFeedbackMode.value !== 'dislike') {
    return;
  }

  const input: RatingInput = {
    movieId: movie.id,
    userId: recommendationStore.state.userId,
    status: 'dislike',
    rating: null,
    reviewTags: [],
    favoriteCharacters: [],
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'dislike',
    rawDirection: manualRatingDirection.value,
    detailCompleted: true
  });
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

watch(
  () => route.query.reset,
  async (resetValue) => {
    if (!resetValue) {
      return;
    }

    await router.replace('/rating');
  },
  { immediate: true }
);

</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <div ref="primaryFlowTop">
      <RatingProgress :current="completedCount" :total="totalCount" :stage-label="stageLabel" />
    </div>

    <template v-if="isDetailMode && currentMovie">
      <div ref="detailFlowTop">
        <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" :interactive="false" size="detail" />
      </div>

      <div class="flex justify-end">
        <WatchToggleButton :movie-id="currentMovie.id" size="md" />
      </div>

      <PositiveFeedbackForm
        v-if="isCurrentDetailPositive"
        :key="`${currentMovie.id}-detail`"
        :characters="currentCharacterChoices"
        :question-text="currentQuestion"
        :initial-value="initialFeedback"
        compact-controls
        submit-label="상세 평가 저장하기"
        @skip="skipPositiveFeedback"
        @submit="submitPositiveFeedback"
      />

      <NegativeFeedbackForm
        v-else
        :key="`${currentMovie.id}-detail-negative`"
        :characters="currentCharacterChoices"
        :initial-value="initialNegativeFeedback"
        compact-controls
        submit-label="상세 평가 저장하기"
        @skip="skipNegativeFeedback"
        @submit="submitNegativeFeedback"
      />
    </template>

    <template v-else-if="currentMovie">
      <RatingMovieCard
        :key="`${currentMovie.id}-primary`"
        :movie="currentMovie"
        :interactive="true"
        size="compact"
        class="mx-auto w-[82%] sm:w-full"
        @decide="savePrimaryMovieDecision"
      />

      <div class="flex justify-end">
        <WatchToggleButton :movie-id="currentMovie.id" size="md" />
      </div>

      <RatingActions @decide="savePrimaryMovieDecision" />
    </template>

    <section v-else class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">
        {{ isDetailMode ? 'Details' : 'Done' }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold text-[#15171c]">
        {{ completionTitle }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-app-muted">
        {{ completionDescription }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          to="/recommendations"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          추천 보러 가기
        </RouterLink>

        <button
          v-if="secondaryAction?.isMoreAction"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
          @click="openNextAdditionalTasteAnalysis"
        >
          {{ secondaryAction.label }}
        </button>

        <RouterLink
          v-else-if="secondaryAction"
          :to="secondaryAction.to"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
        >
          {{ secondaryAction.label }}
        </RouterLink>
      </div>

      <section v-if="!isDetailMode" class="mt-6 border-t border-app-line pt-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[#15171c]">직접 영화 찾아서 평가하기</h2>
            <p class="mt-1 text-sm leading-6 text-app-muted">
              보고 싶었던 영화를 검색해서 바로 평가하면 추천을 더 빨리 다듬을 수 있어요.
            </p>
          </div>
          <button
            v-if="manualSelectedMovie"
            type="button"
            class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-[#15171c]"
            @click="resetManualRatingFlow"
          >
            닫기
          </button>
        </div>

        <div class="mt-4">
          <input
            v-model="manualSearchQuery"
            type="search"
            placeholder="영화 제목, 장르, 줄거리로 검색"
            class="focus-ring h-12 w-full border border-app-line bg-app-panelSoft px-4 text-sm text-[#15171c] placeholder:text-app-muted"
          />
        </div>

        <div v-if="manualSelectedMovie" class="mt-4 space-y-4">
          <RatingMovieCard
            :key="`${manualSelectedMovie.id}-${manualFeedbackMode ?? 'manual-primary'}`"
            :movie="manualSelectedMovie"
            :interactive="manualFeedbackMode == null"
            @decide="saveManualMovieDecision"
          />
          <div class="flex justify-end">
            <WatchToggleButton :movie-id="manualSelectedMovie.id" size="md" />
          </div>
          <RatingActions @decide="saveManualMovieDecision" />

          <div
            v-if="
              manualFeedbackMode === 'positive' ||
              manualFeedbackMode === 'dislike'
            "
            ref="manualFeedbackFormContainer"
          >
            <PositiveFeedbackForm
              v-if="manualFeedbackMode === 'positive'"
              :key="`${manualSelectedMovie.id}-manual-feedback`"
              :characters="manualMovieCharacterChoices"
              :question-text="manualMovieQuestion"
              compact-controls
              submit-label="이 영화 평가 저장하기"
              @skip="skipManualPositiveFeedback"
              @submit="submitManualPositiveFeedback"
            />

            <NegativeFeedbackForm
              v-else
              :key="`${manualSelectedMovie.id}-manual-negative`"
              :characters="manualMovieCharacterChoices"
              compact-controls
              submit-label="이 영화 평가 저장하기"
              @skip="skipManualNegativeFeedback"
              @submit="submitManualNegativeFeedback"
            />
          </div>
        </div>

        <div v-else class="mt-4 space-y-3">
          <button
            v-for="movie in searchableManualMovies"
            :key="movie.id"
            type="button"
            class="focus-ring corner-hard flex w-full items-center gap-3 border border-app-line bg-app-panelSoft p-3 text-left transition-colors hover:bg-app-panel"
            @click="selectManualMovie(movie)"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.posterAlt"
            class="corner-soft h-20 w-14 flex-none object-cover"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-[#15171c]">{{ movie.title }}</p>
              <p class="mt-1 text-xs text-app-muted">
                {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
              </p>
              <p class="mt-2 line-clamp-2 text-xs text-app-muted">
                {{ movie.overview || movie.tags.join(' · ') }}
              </p>
            </div>
          </button>

          <p
            v-if="searchableManualMovies.length === 0"
            class="corner-hard border border-dashed border-app-line bg-app-panelSoft px-4 py-5 text-sm text-app-muted"
          >
            아직 평가하지 않은 영화 중에서는 검색 결과가 없어요.
          </p>
        </div>
      </section>
    </section>
  </main>
</template>
