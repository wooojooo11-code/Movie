<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import type { PositiveRatingInput } from '@/types/rating';
import type { RecommendedCatalogMovie, StoredRatingRecord } from '@/types/recommendation';

const props = defineProps<{
  alreadySeen: boolean;
  isSavingRating?: boolean;
  movie: RecommendedCatalogMovie;
  ratingRecord?: null | StoredRatingRecord;
}>();

defineEmits<{
  close: [];
  'already-seen': [movieId: string];
  'rate-decision': [decision: 'dislike'];
  'rate-like-submit': [feedback: PositiveRatingInput];
}>();

const visibleTags = computed(() => props.movie.tags.slice(0, 3));
const isRatingFlowOpen = ref(false);
const isPositiveFeedbackOpen = ref(false);

const currentQuestion = computed(() => getCharacterQuestionByGenre(props.movie.genres[0] ?? ''));
const currentCharacterChoices = computed(() =>
  getCharacterChoices(props.movie.id, props.movie.characters)
);

const initialFeedback = computed(() => {
  const record = props.ratingRecord;

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

const ratingButtonLabel = computed(() => (props.ratingRecord ? '평가 수정하기' : '평가하기'));

const openRatingFlow = () => {
  isRatingFlowOpen.value = true;
  isPositiveFeedbackOpen.value = props.ratingRecord?.rawDecision === 'like';
};

const choosePositiveRating = () => {
  isRatingFlowOpen.value = true;
  isPositiveFeedbackOpen.value = true;
};

watch(
  () => props.movie.id,
  () => {
    isRatingFlowOpen.value = false;
    isPositiveFeedbackOpen.value = false;
  }
);
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.36)"
    @click.self="$emit('close')"
  >
    <section
      class="mx-auto max-h-[calc(100vh-3rem)] w-full max-w-[19.3rem] overflow-y-auto border border-app-line px-4 py-4"
      style="background-color: rgba(255, 255, 255, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-20 w-[3.35rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-[15px] font-semibold leading-5 text-[#15171c]">
            {{ movie.title }}
          </h3>
          <p class="mt-1 line-clamp-1 text-[11px] text-app-muted">
            {{ movie.genres.join(' · ') }}
          </p>

          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in visibleTags"
              :key="tag"
              class="border border-app-line bg-app-panelSoft px-1.5 py-1 text-[10px] text-[#15171c]"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <WatchToggleButton :movie-id="movie.id" size="sm" />

            <button
              v-if="!alreadySeen"
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[10px] text-[#15171c]"
              @click="$emit('already-seen', movie.id)"
            >
              이미 봤어요
            </button>

            <button
              v-else
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center border border-app-accent bg-app-accent px-3 text-[10px] text-white"
              @click="openRatingFlow"
            >
              {{ ratingButtonLabel }}
            </button>

            <button
              type="button"
              class="focus-ring inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[10px] text-[#15171c]"
              @click="$emit('close')"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <section v-if="alreadySeen && isRatingFlowOpen" class="mt-4 border-t border-app-line pt-4">
        <div v-if="!isPositiveFeedbackOpen" class="grid gap-2">
          <p class="text-xs font-medium text-app-muted">이 영화는 어떻게 느꼈는지 골라주세요.</p>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-3 text-xs font-semibold text-white"
              :disabled="props.isSavingRating"
              @click="choosePositiveRating"
            >
              좋았어요
            </button>
            <button
              type="button"
              class="focus-ring inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-[#15171c]"
              :disabled="props.isSavingRating"
              @click="$emit('rate-decision', 'dislike')"
            >
              별로였어요
            </button>
          </div>
        </div>

        <PositiveFeedbackForm
          v-else
          :characters="currentCharacterChoices"
          :initial-value="initialFeedback"
          :question-text="currentQuestion"
          :show-skip-button="false"
          submit-label="평가 저장하기"
          @submit="$emit('rate-like-submit', $event)"
        />
      </section>
    </section>
  </div>
</template>
