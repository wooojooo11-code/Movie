<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import NegativeFeedbackForm from '@/components/rating/NegativeFeedbackForm.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import TasteAnalysisResult from '@/components/rating/TasteAnalysisResult.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import { createRatingInput } from '@/services/ratingInput';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { RatingResumeSurface, StoredRatingRecord } from '@/types/recommendation';
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

const activeAdditionalBatchIndex = ref<null | number>(null);
const editRatingIndex = ref(0);
const isSavingPrimaryDecision = ref(false);
const primaryFlowTop = ref<HTMLElement | null>(null);
const detailFlowTop = ref<HTMLElement | null>(null);

const isDetailMode = computed(() => route.query.mode === 'detail');
const isMoreMode = computed(() => route.query.mode === 'more');
const isEditMode = computed(() => route.query.mode === 'edit');
const isDetailPaused = computed(() => route.query.detailPaused === 'true');
const pendingDetailedRatings = computed(() => recommendationStore.pendingDetailedRatings.value);
const detailRatingRecords = computed(() =>
  recommendationStore.state.ratings.filter(
    (rating) => getDetailedRatingFeedbackMode(rating.rawDecision, rating.rawDirection) != null
  )
);
const editRatingMovies = computed(() => {
  const seenMovieIds = new Set<string>();
  const tasteAnalysisMovies = [
    ...recommendationStore.primaryRatingMovies.value,
    ...recommendationStore.state.additionalTasteAnalysisBatches.flatMap((_, batchIndex) =>
      recommendationStore.getAdditionalTasteAnalysisBatchMovies(batchIndex)
    )
  ];

  return tasteAnalysisMovies.filter((movie) => {
    if (seenMovieIds.has(movie.id) || !recommendationStore.getStoredRatingRecord(movie.id)) {
      return false;
    }

    seenMovieIds.add(movie.id);
    return true;
  });
});
const currentEditMovie = computed(() => editRatingMovies.value[editRatingIndex.value] ?? null);
const currentEditRating = computed(() => {
  const movie = currentEditMovie.value;
  const record = movie ? recommendationStore.getStoredRatingRecord(movie.id) : null;

  return record
    ? {
        decision: record.rawDecision,
        direction: record.rawDirection
      }
    : null;
});
const latestEditableRating = computed(() => {
  const latestMovie = editRatingMovies.value[editRatingMovies.value.length - 1];
  const record = latestMovie ? recommendationStore.getStoredRatingRecord(latestMovie.id) : null;

  return record
    ? {
        decision: record.rawDecision,
        direction: record.rawDirection
      }
    : null;
});
const hasEditableTasteAnalysisRatings = computed(() => editRatingMovies.value.length > 0);
const activeRatingMovies = computed(() => {
  if (isEditMode.value) {
    return editRatingMovies.value;
  }

  return activeAdditionalBatchIndex.value != null
    ? recommendationStore.getAdditionalTasteAnalysisBatchMovies(activeAdditionalBatchIndex.value)
    : recommendationStore.primaryRatingMovies.value;
});
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
const currentMovie = computed(() => {
  if (isDetailPaused.value) {
    return null;
  }

  if (isEditMode.value) {
    return currentEditMovie.value;
  }

  return isDetailMode.value ? currentDetailMovie.value : currentRatingMovie.value;
});
const isAdditionalTasteAnalysisSurface = computed(() => {
  const surface = recommendationStore.state.ratingResumeSurface;

  return (
    !isEditMode.value &&
    isMoreMode.value &&
    (activeAdditionalBatchIndex.value != null || surface === 'more' || surface === 'more_completion')
  );
});
const currentRatingResumeSurface = computed<null | RatingResumeSurface>(() => {
  if (isDetailMode.value) {
    return currentMovie.value ? 'detail' : 'detail_completion';
  }

  if (isEditMode.value) {
    return currentMovie.value ? 'primary' : 'primary_completion';
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

const syncAdditionalBatchIndex = () => {
  if (isDetailMode.value || isEditMode.value) {
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
  isEditMode,
  (isEditing) => {
    if (isEditing) {
      editRatingIndex.value = 0;
    }
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

  if (isEditMode.value) {
    return editRatingMovies.value.length;
  }

  return activeRatingMovies.value.length;
});

const completedCount = computed(() => {
  if (isDetailMode.value) {
    return detailRatingRecords.value.filter((rating) => rating.detailCompleted).length;
  }

  if (isEditMode.value) {
    return Math.min(editRatingIndex.value, editRatingMovies.value.length);
  }

  return activeRatedCount.value;
});

const stageLabel = computed(() => {
  if (isDetailPaused.value) {
    return '상세 평가 잠시 멈춤';
  }

  if (isDetailMode.value) {
    return currentDetailMovie.value ? '상세 평가 진행' : '상세 평가 완료';
  }

  if (isEditMode.value) {
    return currentEditMovie.value ? '이전 평가 수정' : '평가 수정 완료';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return currentRatingMovie.value ? '추가 취향분석 진행' : '추가 취향분석 완료';
  }

  return currentRatingMovie.value ? '취향분석 진행' : '취향분석 완료';
});

const completionTitle = computed(() => {
  if (isDetailPaused.value) {
    return '상세 평가를 잠시 멈췄어요.';
  }

  if (isDetailMode.value) {
    return '상세 평가를 마쳤어요.';
  }

  if (isEditMode.value) {
    return '이전 평가 수정을 마쳤어요.';
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return '추가 10편 평가가 끝났어요.';
  }

  return '취향분석이 끝났어요.';
});

const completionDescription = computed<null | string>(() => {
  if (isDetailPaused.value) {
    return '남은 상세 평가는 그대로 두었어요. 다음 10편을 평가하거나 원하는 영화를 직접 찾아 평가할 수 있어요.';
  }

  if (isDetailMode.value) {
    return '남겨준 감상을 더 자세히 반영해서 추천을 더 정확하게 맞출게요.';
  }

  if (isEditMode.value) {
    return '수정한 평가를 취향분석 결과에 바로 반영했어요.';
  }

  if (currentDetailMovie.value) {
    return null;
  }

  if (isAdditionalTasteAnalysisSurface.value) {
    return '이번 10편 평가도 기존 취향기록에 누적했어요. 더 이어서 평가하거나 바로 추천을 볼 수 있어요.';
  }

  return '영화를 하나씩 남긴 평가를 바탕으로 추천을 준비했어요.';
});

const secondaryAction = computed<null | { isMoreAction?: boolean; label: string; to: string }>(() => {
  if (isEditMode.value && currentRatingMovie.value) {
    return {
      label: '취향분석 이어가기',
      to: '/rating'
    };
  }

  if (isDetailPaused.value && currentDetailMovie.value) {
    return {
      label: '상세 평가 이어하기',
      to: '/rating?mode=detail'
    };
  }

  if (isDetailPaused.value && recommendationStore.hasAdditionalTasteAnalysisMovies.value) {
    return {
      label: '다음 10편 평가하기',
      to: '/rating?mode=more',
      isMoreAction: true
    };
  }

  if (!isDetailMode.value && currentDetailMovie.value) {
    return {
      label: '상세 평가하러 가기',
      to: '/rating?mode=detail'
    };
  }

  if (recommendationStore.hasAdditionalTasteAnalysisMovies.value) {
    return {
      label: '다음 10편 평가하기',
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

const openRatingEditor = async (startAt: 'first' | 'latest' = 'first') => {
  if (!hasEditableTasteAnalysisRatings.value) {
    return;
  }

  await router.push({
    path: '/rating',
    query: {
      mode: 'edit'
    }
  });
  editRatingIndex.value = startAt === 'latest' ? editRatingMovies.value.length - 1 : 0;
  await scrollToContainer(primaryFlowTop);
};

const showPreviousEditMovie = async () => {
  if (!isEditMode.value || editRatingIndex.value === 0) {
    return;
  }

  editRatingIndex.value -= 1;
  await scrollToContainer(primaryFlowTop);
};

const showNextEditMovie = async () => {
  if (!isEditMode.value || editRatingIndex.value >= editRatingMovies.value.length - 1) {
    return;
  }

  editRatingIndex.value += 1;
  await scrollToContainer(primaryFlowTop);
};

const pauseDetailedRating = async () => {
  if (!isDetailMode.value) {
    return;
  }

  await router.replace({
    path: '/rating',
    query: {
      detailPaused: 'true'
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

const savePrimaryMovieDecision = async (selection: RatingSelection | RatingSelection['decision']) => {
  const movie = isEditMode.value ? currentEditMovie.value : currentRatingMovie.value;

  if (!movie || isDetailMode.value || isSavingPrimaryDecision.value) {
    return;
  }

  const { decision, direction } = normalizeSelection(selection);

  isSavingPrimaryDecision.value = true;

  try {
    const input = createRatingInput(
      recommendationStore.state.userId,
      movie.id,
      toStoredRatingStatus(decision)
    );

    await recommendationStore.submitSwipeRating(movie, input, {
      rawDecision: decision,
      rawDirection: direction,
      detailCompleted: getDetailedRatingFeedbackMode(decision, direction) == null
    });

    if (isEditMode.value) {
      editRatingIndex.value += 1;
      await scrollToContainer(primaryFlowTop);
    } else {
      await scrollToNextPrimaryMovie();
    }
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

  const input = createRatingInput(recommendationStore.state.userId, movie.id, 'dislike', feedback);

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

  const input = createRatingInput(recommendationStore.state.userId, movie.id, 'like', feedback);

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

  const input = createRatingInput(recommendationStore.state.userId, movie.id, 'like', {
    rating: currentDetailRecord.value?.input.rating ?? null
  });

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

  const input = createRatingInput(recommendationStore.state.userId, movie.id, 'dislike', {
    rating: record.input.rating ?? null
  });

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
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-[880px]"
  >
    <div ref="primaryFlowTop">
      <RatingProgress :current="completedCount" :total="totalCount" :stage-label="stageLabel" />
    </div>

    <template v-if="isDetailMode && currentMovie">
      <div ref="detailFlowTop">
        <RatingMovieCard
          :key="currentMovie.id"
          :movie="currentMovie"
          :interactive="false"
          detail-layout
          size="detail"
          show-trailer
          :show-watch-options="false"
        />
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-[#15171c]"
          @click="pauseDetailedRating"
        >
          상세 평가 멈추기
        </button>
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
        primary-layout
        size="compact"
        show-trailer
        :show-watch-options="false"
        :show-previous-rating-edit="!isDetailMode && !isEditMode && hasEditableTasteAnalysisRatings"
        :previous-rating="isEditMode ? currentEditRating : latestEditableRating"
        class="w-full"
        @decide="savePrimaryMovieDecision"
        @edit-previous-rating="openRatingEditor('latest')"
      />

      <RatingActions class="sm:hidden" @decide="savePrimaryMovieDecision" />

      <button
        v-if="!isDetailMode && !isEditMode && hasEditableTasteAnalysisRatings"
        type="button"
        class="focus-ring corner-soft inline-flex min-h-11 w-full items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c] sm:hidden"
        @click="openRatingEditor('latest')"
      >
        이전 평가 수정하기
      </button>

      <div
        v-if="isEditMode"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-app-line pt-4"
      >
        <button
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-[#15171c] disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="editRatingIndex === 0"
          @click="showPreviousEditMovie"
        >
          이전 영화
        </button>
        <p class="text-xs text-app-muted">
          평가를 바꾸면 다음 영화로 넘어가요.
        </p>
        <button
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-[#15171c] disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="editRatingIndex >= editRatingMovies.length - 1"
          @click="showNextEditMovie"
        >
          다음 영화
        </button>
      </div>
    </template>

    <section v-else class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">
        {{ isDetailMode ? 'Details' : 'Done' }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold text-[#15171c]">
        {{ completionTitle }}
      </h1>
      <p v-if="completionDescription" class="mt-3 text-sm leading-6 text-app-muted">
        {{ completionDescription }}
      </p>

      <TasteAnalysisResult
        v-if="!isDetailMode"
        class="mt-5"
        :entries="recommendationStore.ratedMoviesHistory.value"
      />

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          to="/recommendations"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          추천 보러 가기
        </RouterLink>

        <button
          v-if="!isEditMode && hasEditableTasteAnalysisRatings"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
          @click="openRatingEditor()"
        >
          이전 평가 수정하기
        </button>

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

        <button
          v-if="!isEditMode && !secondaryAction?.isMoreAction && recommendationStore.hasAdditionalTasteAnalysisMovies.value"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
          @click="openNextAdditionalTasteAnalysis"
        >
          다음 10편 평가하기
        </button>
      </div>

    </section>
  </main>
</template>
