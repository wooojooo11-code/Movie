<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import WatchToggleButton from '@/components/common/WatchToggleButton.vue';
import NegativeFeedbackForm from '@/components/rating/NegativeFeedbackForm.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import { getWatchProviderLinks } from '@/services/watchProviderLinks';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type { RecommendedCatalogMovie, StoredRatingRecord } from '@/types/recommendation';

const props = defineProps<{
  isSavingRating?: boolean;
  movie: RecommendedCatalogMovie;
  ratingRecord?: null | StoredRatingRecord;
}>();

const emit = defineEmits<{
  close: [];
  'rate-dislike-submit': [feedback: NegativeRatingInput, rawDecision: 'dislike' | 'not_interested'];
  'rate-like-submit': [feedback: PositiveRatingInput];
}>();

const visibleTags = computed(() => props.movie.tags.slice(0, 3));
const isDecisionDialogOpen = ref(false);
const ratingFlowMode = ref<null | 'negative' | 'positive'>(null);
const watchProviders = computed(() => props.movie.watchProvidersKr);

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
    favoriteCharacters: [...record.input.favoriteCharacters],
    reviewText: record.reviewText,
    questionText: record.questionText
  };
});

const initialNegativeFeedback = computed(() => {
  const record = props.ratingRecord;

  if (!record || (record.rawDecision !== 'dislike' && record.rawDecision !== 'not_interested')) {
    return null;
  }

  return {
    stars: record.input.rating ?? null,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacters: [...record.input.favoriteCharacters],
    reviewText: record.reviewText
  };
});
const negativeRatingDecision = computed<'dislike' | 'not_interested'>(() =>
  props.ratingRecord?.rawDecision === 'not_interested' ? 'not_interested' : 'dislike'
);

const ratingButtonLabel = computed(() =>
  props.ratingRecord ? '평가 수정하기' : '평가하기'
);
const quickWatchLinks = computed(() => getWatchProviderLinks(props.movie));

const watchProviderSections = computed(() => {
  if (!watchProviders.value) {
    return [];
  }

  return [
    {
      key: 'flatrate',
      label: '스트리밍',
      providers: watchProviders.value.flatrate
    },
    {
      key: 'rent',
      label: '대여',
      providers: watchProviders.value.rent
    },
    {
      key: 'buy',
      label: '구매',
      providers: watchProviders.value.buy
    }
  ].filter((section) => section.providers.length > 0);
});

const openRatingFlow = () => {
  if (props.ratingRecord?.rawDecision === 'like') {
    ratingFlowMode.value = 'positive';
    return;
  }

  if (props.ratingRecord?.rawDecision === 'dislike' || props.ratingRecord?.rawDecision === 'not_interested') {
    ratingFlowMode.value = 'negative';
    return;
  }

  isDecisionDialogOpen.value = true;
};

const choosePositiveRating = () => {
  isDecisionDialogOpen.value = false;
  ratingFlowMode.value = 'positive';
};

const chooseNegativeRating = () => {
  isDecisionDialogOpen.value = false;
  ratingFlowMode.value = 'negative';
};

watch(
  () => props.movie.id,
  () => {
    isDecisionDialogOpen.value = false;
    ratingFlowMode.value = null;
  }
);
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.36)"
    @click.self="emit('close')"
  >
    <section
      class="corner-hard mx-auto max-h-[calc(100vh-3rem)] w-full max-w-[21rem] overflow-y-auto border border-app-line px-4 py-4"
      style="background-color: rgba(255, 255, 255, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-24 w-[4.1rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-[16px] font-semibold leading-5 text-[#15171c]">
            {{ movie.title }}
          </h3>
          <p class="mt-1 text-[11px] text-app-muted">
            {{ movie.releaseYear }} · {{ movie.genres.join(' · ') }}
          </p>

          <section v-if="visibleTags.length > 0" class="corner-hard mt-3 bg-app-panelSoft px-2.5 py-2">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in visibleTags"
                :key="tag"
                class="corner-pill bg-white px-1.5 py-1 text-[10px] text-[#15171c]"
              >
                {{ tag }}
              </span>
            </div>
          </section>
        </div>
      </div>

      <section v-if="movie.overview" class="mt-4 border-t border-app-line pt-4">
        <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-app-muted">Overview</p>
        <p class="mt-2 text-sm leading-6 text-[#15171c]">
          {{ movie.overview }}
        </p>
      </section>

      <section class="mt-4 border-t border-app-line pt-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-app-muted">
              OTT
            </p>
            <p class="mt-1 text-xs text-app-muted">TMDB 한국 기준 시청 정보</p>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-1.5">
            <a
              v-for="link in quickWatchLinks"
              :key="link.key"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center px-3 text-[10px] font-medium"
              :class="link.accentClassName"
            >
              {{ link.buttonLabel }}
            </a>

            <a
              v-if="watchProviders?.link"
              :href="watchProviders.link"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[10px] font-medium text-[#15171c]"
            >
              TMDB 링크 열기
            </a>
          </div>
        </div>

        <div
          v-if="watchProviderSections.length === 0"
          class="corner-hard mt-3 border border-dashed border-app-line bg-app-panelSoft px-3 py-3 text-xs text-app-muted"
        >
          현재 한국 기준 OTT 정보를 찾지 못했어요.
        </div>

        <div v-else class="mt-3 space-y-3">
          <section
            v-for="section in watchProviderSections"
            :key="section.key"
            class="corner-hard border border-app-line bg-app-panelSoft px-3 py-3"
          >
            <p class="text-xs font-semibold text-[#15171c]">{{ section.label }}</p>

            <div class="mt-2 flex flex-wrap gap-2">
              <div
                v-for="provider in section.providers"
                :key="`${section.key}-${provider.providerId}`"
                class="corner-soft inline-flex items-center gap-2 border border-app-line bg-white px-2 py-1.5"
              >
                <img
                  v-if="provider.logoUrl"
                  :src="provider.logoUrl"
                  :alt="provider.providerName"
                  class="corner-soft h-5 w-5 object-cover"
                  loading="lazy"
                />
                <span class="text-[11px] font-medium text-[#15171c]">
                  {{ provider.providerName }}
                </span>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section class="mt-4 border-t border-app-line pt-4">
        <div class="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-app-muted">
          Quick Actions
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <WatchToggleButton :movie-id="movie.id" size="sm" />

          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-accent bg-app-accent px-3 text-[10px] text-white"
            :disabled="props.isSavingRating"
            @click="openRatingFlow"
          >
            {{ ratingButtonLabel }}
          </button>

          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-[10px] text-[#15171c]"
            @click="emit('close')"
          >
            닫기
          </button>
        </div>
      </section>

      <section v-if="ratingFlowMode" class="mt-4 border-t border-app-line pt-4">
        <PositiveFeedbackForm
          v-if="ratingFlowMode === 'positive'"
          :characters="currentCharacterChoices"
          :initial-value="initialFeedback"
          :question-text="currentQuestion"
          :show-skip-button="false"
          submit-label="평가 저장하기"
          @submit="emit('rate-like-submit', $event)"
        />

        <NegativeFeedbackForm
          v-else
          :characters="currentCharacterChoices"
          :initial-value="initialNegativeFeedback"
          :show-skip-button="false"
          submit-label="평가 저장하기"
          @submit="emit('rate-dislike-submit', $event, negativeRatingDecision)"
        />
      </section>
    </section>

    <div
      v-if="isDecisionDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center px-6"
      style="background-color: rgba(0, 0, 0, 0.18)"
      @click.self="isDecisionDialogOpen = false"
    >
      <section class="corner-hard w-full max-w-[16.5rem] border border-app-line bg-white px-4 py-4">
        <p class="text-center text-sm font-semibold text-[#15171c]">이 콘텐츠는 어떠셨나요?</p>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-3 text-xs font-semibold text-white"
            :disabled="props.isSavingRating"
            @click="choosePositiveRating"
          >
            좋았어요
          </button>
          <button
            type="button"
            class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-[#15171c]"
            :disabled="props.isSavingRating"
            @click="chooseNegativeRating"
          >
            별로였어요
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
