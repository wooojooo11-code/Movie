<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import NegativeFeedbackForm from '@/components/rating/NegativeFeedbackForm.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { NegativeRatingInput, PositiveRatingInput, RatingDecision } from '@/types/rating';

const route = useRoute();
const router = useRouter();
const recommendationStore = useRecommendationStore();

const movieId = computed(() => String(route.params.movieId ?? ''));
const movie = computed(() =>
  recommendationStore.catalogMovies.find((entry) => entry.id === movieId.value) ?? null
);
const ratingRecord = computed(() => recommendationStore.getStoredRatingRecord(movieId.value));

const draftDecision = ref<RatingDecision | 'not_interested'>('like');
const isSaving = ref(false);
const detailFormContainer = ref<HTMLElement | null>(null);

const decisionLabels = {
  like: '재밌음',
  dislike: '별로',
  not_seen: '안 봄',
  not_interested: '관심 없음'
} as const;

const currentQuestion = computed(() =>
  movie.value ? getCharacterQuestionByGenre(movie.value.genres[0] ?? '') : ''
);

const currentCharacterChoices = computed(() =>
  movie.value ? getCharacterChoices(movie.value.id, movie.value.characters) : []
);

const initialFeedback = computed(() => {
  const record = ratingRecord.value;

  if (!record || record.rawDecision !== 'like') {
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

const initialNegativeFeedback = computed(() => {
  const record = ratingRecord.value;

  if (!record || (record.rawDecision !== 'dislike' && record.rawDecision !== 'not_interested')) {
    return null;
  }

  return {
    stars: record.input.rating ?? null,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacter: record.input.favoriteCharacter,
    reviewText: record.reviewText
  };
});

const currentDecisionLabel = computed(() => {
  const record = ratingRecord.value;

  if (!record) {
    return null;
  }

  return decisionLabels[record.rawDecision] ?? record.rawDecision;
});

const showPositiveDetailForm = computed(() => draftDecision.value === 'like');
const showNegativeDetailForm = computed(
  () => draftDecision.value === 'dislike' || draftDecision.value === 'not_interested'
);

const syncDraftDecision = () => {
  draftDecision.value = ratingRecord.value?.rawDecision ?? 'like';
};

syncDraftDecision();

watch(ratingRecord, () => {
  syncDraftDecision();
});

const goBackToHistory = async () => {
  await router.replace('/history');
};

const scrollToDetailForm = async () => {
  await nextTick();
  detailFormContainer.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};

const saveDecision = async (decision: RatingDecision | 'not_interested') => {
  if (!movie.value || isSaving.value) {
    return;
  }

  draftDecision.value = decision;

  if (decision === 'like' || decision === 'dislike' || decision === 'not_interested') {
    await scrollToDetailForm();
    return;
  }

  isSaving.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.value.id,
      userId: recommendationStore.state.userId,
      status: decision,
      rating: null,
      reviewTags: [],
      favoriteCharacter: null,
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie.value, input, {
      rawDecision: decision,
      detailCompleted: true
    });

    await goBackToHistory();
  } finally {
    isSaving.value = false;
  }
};

const submitPositiveFeedback = async (feedback: PositiveRatingInput) => {
  if (!movie.value || isSaving.value) {
    return;
  }

  isSaving.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.value.id,
      userId: recommendationStore.state.userId,
      status: 'like',
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacter: feedback.favoriteCharacter,
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie.value, input, {
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

    await goBackToHistory();
  } finally {
    isSaving.value = false;
  }
};

const submitNegativeFeedback = async (feedback: NegativeRatingInput) => {
  if (!movie.value || isSaving.value) {
    return;
  }

  isSaving.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.value.id,
      userId: recommendationStore.state.userId,
      status: 'dislike',
      rating: feedback.stars,
      reviewTags: feedback.reviewTags,
      favoriteCharacter: feedback.favoriteCharacter,
      answeredAt: new Date().toISOString()
    };

    await recommendationStore.submitSwipeRating(movie.value, input, {
      rawDecision: draftDecision.value === 'not_interested' ? 'not_interested' : 'dislike',
      detailCompleted: true,
      feedback: {
        rating: feedback.stars,
        reviewTags: feedback.reviewTags,
        favoriteCharacter: feedback.favoriteCharacter,
        reviewText: feedback.reviewText,
        questionText: ''
      }
    });

    await goBackToHistory();
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section class="corner-hard border border-app-line bg-app-panel px-5 py-5">
      <p class="text-sm font-semibold text-white">평가기록 수정</p>
      <h1 class="mt-2 text-[28px] font-semibold leading-tight text-white">
        {{ movie?.title ?? '평가를 찾는 중이에요' }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-app-muted">
        {{
          currentDecisionLabel
            ? `지금 기록된 평가는 ${currentDecisionLabel}이에요. 다시 고르면 바로 바뀌어요.`
            : '저장된 평가를 불러오고 있어요.'
        }}
      </p>
    </section>

    <section v-if="!movie || !ratingRecord" class="corner-hard border border-app-line bg-app-panel p-5">
      <p class="text-sm font-semibold text-white">수정할 평가를 찾지 못했어요.</p>
      <p class="mt-2 text-sm leading-6 text-app-muted">
        이미 지워졌거나, 아직 기록으로 저장되지 않은 영화일 수 있어요.
      </p>
      <RouterLink
        to="/history"
        class="focus-ring corner-soft mt-5 inline-flex min-h-12 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-white"
      >
        평가기록으로 돌아가기
      </RouterLink>
    </section>

    <template v-else>
      <RatingMovieCard :movie="movie" size="detail" @decide="saveDecision" />
      <div class="flex justify-end">
        <WatchToggleButton :movie-id="movie.id" size="md" />
      </div>
      <RatingActions @decide="saveDecision" />

      <div
        v-if="showPositiveDetailForm || showNegativeDetailForm"
        ref="detailFormContainer"
      >
        <PositiveFeedbackForm
          v-if="showPositiveDetailForm"
          :key="`${movie.id}-${draftDecision}`"
          :characters="currentCharacterChoices"
          :question-text="currentQuestion"
          :initial-value="initialFeedback"
          :show-skip-button="false"
          submit-label="변경 저장하기"
          @submit="submitPositiveFeedback"
        />

        <NegativeFeedbackForm
          v-else
          :key="`${movie.id}-${draftDecision}`"
          :characters="currentCharacterChoices"
          :initial-value="initialNegativeFeedback"
          submit-label="변경 저장하기"
          @submit="submitNegativeFeedback"
        />
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="focus-ring corner-soft min-h-12 flex-1 border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-white"
          @click="goBackToHistory"
        >
          취소
        </button>
        <RouterLink
          to="/history"
          class="focus-ring corner-soft inline-flex min-h-12 flex-1 items-center justify-center border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-white"
        >
          기록으로 돌아가기
        </RouterLink>
      </div>
    </template>
  </main>
</template>
