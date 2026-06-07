<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import RatingProgress from '@/components/rating/RatingProgress.vue';
import { getUnratedMoviesFromPool, primaryRatingMovies } from '@/data/rating';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { CatalogMovie } from '@/types/recommendation';
import type { PositiveRatingInput, RatingDecision } from '@/types/rating';

const recommendationStore = useRecommendationStore();
const route = useRoute();
const router = useRouter();

const savedNotice = ref<null | { movieTitle: string; type: 'detail' | 'primary' }>(null);
const manualSearchQuery = ref('');
const manualSelectedMovie = ref<null | CatalogMovie>(null);
const manualDetailMovie = ref<null | CatalogMovie>(null);
let savedNoticeTimer: null | ReturnType<typeof setTimeout> = null;

const isDetailMode = computed(() => route.query.mode === 'detail');
const isMoreMode = computed(() => route.query.mode === 'more');
const requestedBatchIndex = computed(() => {
  const rawBatch = route.query.batch;

  if (rawBatch == null) {
    return null;
  }

  const parsedBatch = Number(rawBatch);
  return Number.isFinite(parsedBatch) && parsedBatch >= 0 ? Math.floor(parsedBatch) : null;
});
const resolvedAdditionalBatchIndex = ref<null | number>(null);

const syncAdditionalBatchRoute = () => {
  if (isMoreMode.value) {
    const nextBatchIndex = recommendationStore.ensureAdditionalTasteAnalysisBatch(
      requestedBatchIndex.value
    );
    resolvedAdditionalBatchIndex.value = nextBatchIndex;

    if (nextBatchIndex != null && requestedBatchIndex.value !== nextBatchIndex) {
      void router.replace({
        query: {
          ...route.query,
          batch: String(nextBatchIndex)
        }
      });
    }

    return;
  }

  if (isDetailMode.value) {
    resolvedAdditionalBatchIndex.value = requestedBatchIndex.value;
    return;
  }

  resolvedAdditionalBatchIndex.value = null;
};

const currentMoviePool = computed(() => {
  if (isDetailMode.value) {
    return [];
  }

  if (!isMoreMode.value) {
    return primaryRatingMovies;
  }

  if (resolvedAdditionalBatchIndex.value == null) {
    return [];
  }

  return recommendationStore.getAdditionalTasteAnalysisBatchMovies(resolvedAdditionalBatchIndex.value);
});

const currentPoolMovieIds = computed(() => currentMoviePool.value.map((movie) => movie.id));
const detailScopeMoviePool = computed(() => {
  if (!isDetailMode.value) {
    return [];
  }

  if (resolvedAdditionalBatchIndex.value == null) {
    return primaryRatingMovies;
  }

  return recommendationStore.getAdditionalTasteAnalysisBatchMovies(resolvedAdditionalBatchIndex.value);
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
  manualDetailMovie.value ? getCharacterQuestionByGenre(manualDetailMovie.value.genres[0] ?? '') : ''
);

const manualMovieCharacterChoices = computed(() =>
  manualDetailMovie.value
    ? getCharacterChoices(manualDetailMovie.value.id, manualDetailMovie.value.characters)
    : []
);

const nextAdditionalBatchLink = computed(() => {
  if (!recommendationStore.hasAdditionalTasteAnalysisMovies.value) {
    return null;
  }

  return '/rating?mode=more';
});

const detailRatingLink = computed(() =>
  currentBatchPendingDetailCount.value > 0
    ? isMoreMode.value
      ? resolvedAdditionalBatchIndex.value == null
        ? null
        : `/rating?mode=detail&batch=${resolvedAdditionalBatchIndex.value}`
      : '/rating?mode=detail'
    : null
);

const secondaryAction = computed<null | { label: string; to: string }>(() => {
  if (!isDetailMode.value && detailRatingLink.value) {
    return {
      label: '상세 평가하러 가기',
      to: detailRatingLink.value
    };
  }

  if (nextAdditionalBatchLink.value) {
    return {
      label: '더 분석하기',
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

const completionTitle = computed(() => {
  if (isDetailMode.value) {
    return '상세 평가까지 마쳤어요.';
  }

  if (isMoreMode.value) {
    return '다음 추천을 준비해뒀어요.';
  }

  return '추천을 시작할 준비가 됐어요.';
});

const completionDescription = computed(() => {
  if (isDetailMode.value) {
    return '';
  }

  return '';
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

const resetManualRatingFlow = () => {
  manualSelectedMovie.value = null;
  manualDetailMovie.value = null;
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

const selectManualMovie = (movie: CatalogMovie) => {
  manualSelectedMovie.value = movie;
  manualDetailMovie.value = null;
};

const saveManualMovieDecision = async (decision: RatingDecision | 'not_interested') => {
  const movie = manualSelectedMovie.value;

  if (!movie) {
    return;
  }

  if (decision === 'like') {
    manualDetailMovie.value = movie;
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

  showSavedNotice(movie.title, 'primary');
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

const submitManualPositiveFeedback = async (feedback: PositiveRatingInput) => {
  const movie = manualDetailMovie.value;

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
  resetManualRatingFlow();
  manualSearchQuery.value = '';
};

const skipManualPositiveFeedback = async () => {
  const movie = manualDetailMovie.value;

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
  resetManualRatingFlow();
  manualSearchQuery.value = '';
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

watch(
  [() => route.query.mode, () => route.query.batch, () => recommendationStore.state.userId],
  () => {
    syncAdditionalBatchRoute();
  },
  { immediate: true }
);

onMounted(() => {
  syncAdditionalBatchRoute();
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

    <section v-if="savedNotice" class="border border-app-line bg-app-panel px-4 py-3">
      <p class="text-sm font-semibold text-[#15171c]">{{ savedNotice.movieTitle }} 저장됨</p>
      <p class="mt-1 text-sm text-app-muted">
        {{
          savedNotice.type === 'detail'
            ? '상세 평가를 저장했어요. 다음 흐름에 바로 반영할게요.'
            : '평가를 저장했어요. 다음 영화로 이어갈게요.'
        }}
      </p>
    </section>

    <section
      v-if="!isDetailMode && isMoreMode && recommendationStore.state.profile.totalRatings > 0"
      class="flex justify-end"
    >
      <RouterLink
        to="/recommendations"
        class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
      >
        지금 추천 보기
      </RouterLink>
    </section>

    <template v-if="currentMovie">
      <template v-if="isDetailMode">
        <section class="border border-app-line bg-app-panel px-5 py-4">
          <p class="text-sm font-semibold text-[#15171c]">좋아요를 누른 영화의 상세 평가예요.</p>
          <p class="mt-2 text-sm leading-6 text-app-muted">별점과 감상을 더 남기면 추천 정확도가 올라가요.</p>
        </section>

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

      <template v-else>
        <RatingMovieCard :key="currentMovie.id" :movie="currentMovie" @decide="saveSwipeDecision" />
        <div class="flex justify-end">
          <WatchToggleButton :movie-id="currentMovie.id" size="md" />
        </div>
        <RatingActions @decide="saveSwipeDecision" />
      </template>
    </template>

    <section v-else class="border border-app-line bg-app-panel px-5 py-5">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-app-muted">
        {{ isDetailMode ? 'Details' : isMoreMode ? 'More' : 'Done' }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold text-[#15171c]">
        {{ completionTitle }}
      </h1>
      <p v-if="completionDescription" class="mt-3 text-sm leading-6 text-app-muted">
        {{ completionDescription }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink
          to="/recommendations"
          class="focus-ring inline-flex min-h-11 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          추천 보러 가기
        </RouterLink>

        <RouterLink
          v-if="secondaryAction"
          :to="secondaryAction.to"
          class="focus-ring inline-flex min-h-11 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-medium text-[#15171c]"
        >
          {{ secondaryAction.label }}
        </RouterLink>
      </div>

      <p v-if="!isDetailMode && isMoreMode && !nextAdditionalBatchLink" class="mt-4 text-sm text-app-muted">
        지금 준비된 추가 취향분석은 여기까지예요.
      </p>

      <section v-if="!isDetailMode" class="mt-6 border-t border-app-line pt-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[#15171c]">직접 영화 찾아서 평가하기</h2>
            <p class="mt-1 text-sm leading-6 text-app-muted">
              보고 싶은 영화를 검색해서 바로 평가하면 추천이 더 정교해져요.
            </p>
          </div>
          <button
            v-if="manualSelectedMovie || manualDetailMovie"
            type="button"
            class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-sm font-medium text-[#15171c]"
            @click="resetManualRatingFlow"
          >
            닫기
          </button>
        </div>

        <div class="mt-4">
          <input
            v-model="manualSearchQuery"
            type="search"
            placeholder="영화 제목, 장르, 태그로 검색"
            class="focus-ring h-12 w-full border border-app-line bg-app-panelSoft px-4 text-sm text-[#15171c] placeholder:text-app-muted"
          />
        </div>

        <div v-if="manualDetailMovie" class="mt-4 space-y-4">
          <RatingMovieCard :key="`${manualDetailMovie.id}-manual-detail`" :movie="manualDetailMovie" :interactive="false" size="detail" />
          <div class="flex justify-end">
            <WatchToggleButton :movie-id="manualDetailMovie.id" size="md" />
          </div>
          <PositiveFeedbackForm
            :key="`${manualDetailMovie.id}-manual-feedback`"
            :characters="manualMovieCharacterChoices"
            :question-text="manualMovieQuestion"
            submit-label="이 영화 평가 저장하기"
            @skip="skipManualPositiveFeedback"
            @submit="submitManualPositiveFeedback"
          />
        </div>

        <div v-else-if="manualSelectedMovie" class="mt-4 space-y-4">
          <RatingMovieCard
            :key="`${manualSelectedMovie.id}-manual-primary`"
            :movie="manualSelectedMovie"
            @decide="saveManualMovieDecision"
          />
          <div class="flex justify-end">
            <WatchToggleButton :movie-id="manualSelectedMovie.id" size="md" />
          </div>
          <RatingActions @decide="saveManualMovieDecision" />
        </div>

        <div v-else class="mt-4 space-y-3">
          <button
            v-for="movie in searchableManualMovies"
            :key="movie.id"
            type="button"
            class="focus-ring flex w-full items-center gap-3 border border-app-line bg-app-panelSoft p-3 text-left transition-colors hover:bg-app-panel"
            @click="selectManualMovie(movie)"
          >
            <img
              :src="movie.posterUrl"
              :alt="movie.posterAlt"
              class="h-20 w-14 flex-none object-cover"
              loading="lazy"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-[#15171c]">{{ movie.title }}</p>
              <p class="mt-1 text-xs text-app-muted">{{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}</p>
              <p class="mt-2 line-clamp-2 text-xs text-app-muted">{{ movie.tags.join(' · ') }}</p>
            </div>
          </button>

          <p
            v-if="searchableManualMovies.length === 0"
            class="border border-dashed border-app-line bg-app-panelSoft px-4 py-5 text-sm text-app-muted"
          >
            아직 평가하지 않은 영화 중에서 검색 결과가 없어요.
          </p>
        </div>
      </section>
    </section>
  </main>
</template>
