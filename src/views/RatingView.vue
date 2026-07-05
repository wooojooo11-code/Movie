<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
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
import type { CatalogMovie, StoredRatingRecord } from '@/types/recommendation';
import type { NegativeRatingInput, PositiveRatingInput, RatingDecision } from '@/types/rating';

const recommendationStore = useRecommendationStore();
const route = useRoute();
const router = useRouter();

const savedNotice = ref<null | { description: string; title: string }>(null);
const manualSearchQuery = ref('');
const manualSelectedMovie = ref<null | CatalogMovie>(null);
const manualFeedbackMode = ref<null | 'negative' | 'positive'>(null);
const activeAdditionalBatchIndex = ref<null | number>(null);
const lastActivatedMoreModeKey = ref<null | string>(null);
const isSavingManualDecision = ref(false);
const isSavingPrimaryDecision = ref(false);
const primaryNegativeMovieId = ref<null | string>(null);
const primaryNegativeFormContainer = ref<HTMLElement | null>(null);
const manualFeedbackFormContainer = ref<HTMLElement | null>(null);
let savedNoticeTimer: null | ReturnType<typeof setTimeout> = null;

const isDetailMode = computed(() => route.query.mode === 'detail');
const isMoreMode = computed(() => route.query.mode === 'more');
const likedRatingRecords = computed(() =>
  recommendationStore.state.ratings.filter((rating) => rating.rawDecision === 'like')
);
const pendingDetailedRatings = computed(() => recommendationStore.pendingDetailedRatings.value);
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

const currentDetailRecord = computed<null | StoredRatingRecord>(() => {
  if (!currentDetailMovie.value) {
    return null;
  }

  const record =
    recommendationStore.state.ratings.find(
      (rating) =>
        rating.input.movieId === currentDetailMovie.value?.id &&
        rating.rawDecision === 'like' &&
        !rating.detailCompleted
    ) ?? null;

  if (!record) {
    return null;
  }

  return {
    ...record,
    input: {
      ...record.input,
      reviewTags: [...record.input.reviewTags]
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

const initialFeedback = computed(() => {
  const record = currentDetailRecord.value;

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

const showPrimaryNegativeFeedback = computed(
  () => !isDetailMode.value && primaryNegativeMovieId.value === currentRatingMovie.value?.id
);

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
    lastActivatedMoreModeKey.value = null;
    return;
  }

  if (recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value != null) {
    activeAdditionalBatchIndex.value = recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value;

    if (isMoreMode.value) {
      lastActivatedMoreModeKey.value = route.fullPath;
    } else {
      lastActivatedMoreModeKey.value = null;
    }

    return;
  }

  if (isMoreMode.value) {
    if (lastActivatedMoreModeKey.value !== route.fullPath) {
      activeAdditionalBatchIndex.value = recommendationStore.ensureAdditionalTasteAnalysisBatch(
        activeAdditionalBatchIndex.value
      );
      lastActivatedMoreModeKey.value = route.fullPath;
      return;
    }

    activeAdditionalBatchIndex.value = null;
    return;
  }

  lastActivatedMoreModeKey.value = null;
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
  () => currentRatingMovie.value?.id,
  () => {
    primaryNegativeMovieId.value = null;
  }
);

const totalCount = computed(() => {
  if (isDetailMode.value) {
    return likedRatingRecords.value.length;
  }

  return activeRatingMovies.value.length;
});

const completedCount = computed(() => {
  if (isDetailMode.value) {
    return Math.max(0, likedRatingRecords.value.length - pendingDetailedRatings.value.length);
  }

  return activeRatedCount.value;
});

const stageLabel = computed(() => {
  if (isDetailMode.value) {
    return currentDetailMovie.value ? '좋아요 상세평가' : '상세평가 완료';
  }

  if (activeAdditionalBatchIndex.value != null) {
    return currentRatingMovie.value ? '추가 취향분석 진행' : '추가 취향분석 완료';
  }

  return currentRatingMovie.value ? '취향분석 진행' : '취향분석 완료';
});

const completionTitle = computed(() => {
  if (isDetailMode.value) {
    return '상세 평가를 마쳤어요.';
  }

  if (activeAdditionalBatchIndex.value != null) {
    return '추가 20편 평가가 끝났어요.';
  }

  return '취향분석이 끝났어요.';
});

const completionDescription = computed(() => {
  if (isDetailMode.value) {
    return '좋아요 이유까지 반영해서 추천을 더 정확하게 맞출게요.';
  }

  if (currentDetailMovie.value) {
    return '좋아요로 남긴 영화는 마지막에 한 번에 상세 평가를 이어서 할 수 있어요.';
  }

  if (activeAdditionalBatchIndex.value != null) {
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
  await router.push({
    path: '/rating',
    query: {
      mode: 'more',
      batch: String(Date.now())
    }
  });
};

const showSavedNotice = (title: string, description: string) => {
  savedNotice.value = { title, description };

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

const scrollToContainer = async (containerRef: { value: HTMLElement | null }) => {
  await nextTick();
  containerRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};

const resetManualRatingFlow = () => {
  manualSelectedMovie.value = null;
  manualFeedbackMode.value = null;
};

const savePrimaryMovieDecision = async (decision: RatingDecision | 'not_interested') => {
  const movie = currentRatingMovie.value;

  if (!movie || isDetailMode.value || isSavingPrimaryDecision.value) {
    return;
  }

  if (decision === 'dislike') {
    primaryNegativeMovieId.value = movie.id;
    await scrollToContainer(primaryNegativeFormContainer);
    return;
  }

  primaryNegativeMovieId.value = null;
  isSavingPrimaryDecision.value = true;

  try {
    if (decision === 'like') {
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
        detailCompleted: false
      });

      showSavedNotice(`${movie.title} 좋아요를 저장했어요.`, '상세 평가는 마지막에 한 번에 이어서 할 수 있어요.');
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
      detailCompleted: true
    });

    showSavedNotice(`${movie.title} 평가를 저장했어요.`, '추천 결과에도 바로 반영할게요.');
  } finally {
    isSavingPrimaryDecision.value = false;
  }
};

const submitPrimaryNegativeFeedback = async (feedback: NegativeRatingInput) => {
  const movie = currentRatingMovie.value;

  if (
    !movie ||
    isDetailMode.value ||
    isSavingPrimaryDecision.value ||
    primaryNegativeMovieId.value !== movie.id
  ) {
    return;
  }

  isSavingPrimaryDecision.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.id,
      userId: recommendationStore.state.userId,
      status: 'dislike',
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacter: null,
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie, input, {
      rawDecision: 'dislike',
      detailCompleted: true,
      feedback: {
        rating: feedback.stars,
        reviewTags: feedback.reviewTags,
        favoriteCharacter: null,
        reviewText: feedback.reviewText,
        questionText: ''
      }
    });

    showSavedNotice(`${movie.title} 평가를 저장했어요.`, '별로 기록도 추천에 바로 반영할게요.');
  } finally {
    primaryNegativeMovieId.value = null;
    isSavingPrimaryDecision.value = false;
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

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }

  showSavedNotice('상세 평가를 저장했어요.', '다음 추천에도 바로 반영할게요.');
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
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    detailCompleted: true
  });

  if (!recommendationStore.getPendingDetailMovie()) {
    await router.replace(activeAdditionalBatchIndex.value != null ? '/rating?mode=more' : '/rating');
  }

  showSavedNotice('상세 평가를 건너뛰었어요.', '나중에 평가기록에서 다시 수정할 수 있어요.');
};

const selectManualMovie = (movie: CatalogMovie) => {
  manualSelectedMovie.value = movie;
  manualFeedbackMode.value = null;
};

const saveManualMovieDecision = async (decision: RatingDecision | 'not_interested') => {
  const movie = manualSelectedMovie.value;

  if (!movie || isSavingManualDecision.value) {
    return;
  }

  if (decision === 'like') {
    manualFeedbackMode.value = 'positive';
    await scrollToContainer(manualFeedbackFormContainer);
    return;
  }

  if (decision === 'dislike') {
    manualFeedbackMode.value = 'negative';
    await scrollToContainer(manualFeedbackFormContainer);
    return;
  }

  manualFeedbackMode.value = null;
  isSavingManualDecision.value = true;

  try {
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
      detailCompleted: true
    });

    showSavedNotice(`${movie.title} 평가를 저장했어요.`, '누적 취향기록에도 바로 반영했어요.');
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

  showSavedNotice(`${movie.title} 평가를 저장했어요.`, '좋아요 이유까지 누적해서 추천에 반영할게요.');
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
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'dislike',
    detailCompleted: true,
    feedback: {
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacter: null,
      reviewText: feedback.reviewText,
      questionText: ''
    }
  });

  showSavedNotice(`${movie.title} 평가를 저장했어요.`, '별로 기록도 누적해서 추천에 반영할게요.');
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
    favoriteCharacter: null,
    answeredAt: new Date().toISOString()
  };

  await recommendationStore.submitSwipeRating(movie, input, {
    rawDecision: 'like',
    detailCompleted: true
  });

  showSavedNotice(`${movie.title} 평가를 저장했어요.`, '간단한 좋아요 기록으로도 누적 반영됐어요.');
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

onUnmounted(() => {
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

    <section v-if="savedNotice" class="corner-hard border border-app-line bg-app-panel px-4 py-3">
      <p class="text-sm font-semibold text-[#15171c]">{{ savedNotice.title }}</p>
      <p class="mt-1 text-sm text-app-muted">{{ savedNotice.description }}</p>
    </section>

    <template v-if="isDetailMode && currentMovie">
      <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" :interactive="false" size="detail" />

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

    <template v-else-if="currentMovie">
      <RatingMovieCard
        :key="`${currentMovie.id}-${showPrimaryNegativeFeedback ? 'negative' : 'primary'}`"
        :movie="currentMovie"
        :interactive="!showPrimaryNegativeFeedback"
        @decide="savePrimaryMovieDecision"
      />

      <div class="flex justify-end">
        <WatchToggleButton :movie-id="currentMovie.id" size="md" />
      </div>

      <RatingActions @decide="savePrimaryMovieDecision" />

      <div v-if="showPrimaryNegativeFeedback" ref="primaryNegativeFormContainer">
        <NegativeFeedbackForm
          :key="`${currentMovie.id}-primary-negative`"
          submit-label="이 평가 저장하기"
          @submit="submitPrimaryNegativeFeedback"
        />
      </div>
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
            v-if="manualFeedbackMode === 'positive' || manualFeedbackMode === 'negative'"
            ref="manualFeedbackFormContainer"
          >
            <PositiveFeedbackForm
              v-if="manualFeedbackMode === 'positive'"
              :key="`${manualSelectedMovie.id}-manual-feedback`"
              :characters="manualMovieCharacterChoices"
              :question-text="manualMovieQuestion"
              submit-label="이 영화 평가 저장하기"
              @skip="skipManualPositiveFeedback"
              @submit="submitManualPositiveFeedback"
            />

            <NegativeFeedbackForm
              v-else
              :key="`${manualSelectedMovie.id}-manual-negative`"
              submit-label="이 영화 평가 저장하기"
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
