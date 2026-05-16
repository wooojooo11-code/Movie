<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import RatingActions from '@/components/rating/RatingActions.vue';
import RatingMovieCard from '@/components/rating/RatingMovieCard.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { PositiveRatingInput, RatingDecision } from '@/types/rating';

const route = useRoute();
const router = useRouter();
const recommendationStore = useRecommendationStore();

const movieId = computed(() => String(route.params.movieId ?? ''));
const movie = computed(() =>
  recommendationStore.catalogMovies.find((entry) => entry.id === movieId.value) ?? null
);
const ratingRecord = computed(
  () => recommendationStore.state.ratings.find((entry) => entry.input.movieId === movieId.value) ?? null
);

const draftDecision = ref<RatingDecision | 'not_interested'>('like');
const isSaving = ref(false);

const decisionLabels = {
  like: '재밌음',
  dislike: '재미없음',
  not_seen: '안 봄',
  not_interested: '관심없음'
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

const currentDecisionLabel = computed(() => {
  const record = ratingRecord.value;

  if (!record) {
    return null;
  }

  return decisionLabels[record.rawDecision] ?? record.rawDecision;
});

const showDetailForm = computed(() => draftDecision.value === 'like');

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

const saveDecision = async (decision: RatingDecision | 'not_interested') => {
  if (!movie.value || isSaving.value) {
    return;
  }

  draftDecision.value = decision;

  if (decision === 'like') {
    return;
  }

  isSaving.value = true;

  try {
    const input: RatingInput = {
      movieId: movie.value.id,
      userId: recommendationStore.state.userId,
      status: decision === 'not_interested' ? 'dislike' : decision,
      rating: null,
      reviewTags: [],
      favoriteCharacter: null,
      answeredAt: new Date().toISOString()
    };

    const saveTask = recommendationStore.submitSwipeRating(movie.value, input, {
      rawDecision: decision,
      detailCompleted: true
    });

    await goBackToHistory();
    void saveTask;
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

    const saveTask = recommendationStore.submitSwipeRating(movie.value, input, {
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
    void saveTask;
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-xl"
  >
    <section
      class="rounded-[24px] border border-app-line bg-[radial-gradient(circle_at_top_right,rgba(125,123,255,0.35),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(255,93,143,0.24),transparent_28%),linear-gradient(180deg,#161a24,#10131b)] p-[22px]"
    >
      <p class="text-sm font-bold text-app-accent">평가기록 수정</p>
      <h1 class="mt-2 text-[28px] font-extrabold leading-tight text-white">
        {{ movie?.title ?? '평가를 찾는 중이에요' }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-[#c8d1df]">
        {{
          currentDecisionLabel
            ? `현재 저장된 평가는 ${currentDecisionLabel}이에요. 다시 고르면 바로 바뀌어요.`
            : '저장된 평가를 불러오고 있어요.'
        }}
      </p>
    </section>

    <section
      v-if="!movie || !ratingRecord"
      class="rounded-[24px] border border-app-line bg-app-panel p-5"
    >
      <p class="text-sm font-bold text-app-accent">수정할 평가를 찾지 못했어요.</p>
      <p class="mt-2 text-sm leading-6 text-app-muted">
        이미 지워졌거나, 아직 기록으로 저장되지 않은 영화일 수 있어요.
      </p>
      <RouterLink
        to="/history"
        class="focus-ring mt-5 inline-flex min-h-12 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
      >
        평가기록으로 돌아가기
      </RouterLink>
    </section>

    <template v-else>
      <section class="rounded-[20px] border border-app-line bg-app-panel p-4">
        <p class="text-sm font-bold text-app-accent">평가를 다시 골라보세요</p>
        <p class="mt-2 text-sm leading-6 text-[#c8d1df]">
          제스처나 버튼으로 상태를 바꾸고, 재밌음이면 아래 상세 내용도 같이 수정할 수 있어요.
        </p>
      </section>

      <RatingMovieCard :movie="movie" @decide="saveDecision" />
      <RatingActions @decide="saveDecision" />

      <PositiveFeedbackForm
        v-if="showDetailForm"
        :key="`${movie.id}-${draftDecision}`"
        :characters="currentCharacterChoices"
        :question-text="currentQuestion"
        :initial-value="initialFeedback"
        :show-skip-button="false"
        submit-label="변경 저장하기"
        @submit="submitPositiveFeedback"
      />

      <div class="flex gap-3">
        <button
          type="button"
          class="focus-ring min-h-12 flex-1 rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
          @click="goBackToHistory"
        >
          취소
        </button>
        <RouterLink
          to="/history"
          class="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-[16px] border border-app-line bg-white/5 px-4 text-sm font-extrabold text-white"
        >
          기록으로 돌아가기
        </RouterLink>
      </div>
    </template>
  </main>
</template>
