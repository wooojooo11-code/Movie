<script setup lang="ts">
import { Check, Clapperboard, Heart, ListPlus, X } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import ListPickerSheet from '@/components/common/ListPickerSheet.vue';
import MovieTrailerPlayer from '@/components/common/MovieTrailerPlayer.vue';
import Chip from '@/components/common/Chip.vue';
import NegativeFeedbackForm from '@/components/rating/NegativeFeedbackForm.vue';
import PositiveFeedbackForm from '@/components/rating/PositiveFeedbackForm.vue';
import { getCharacterChoices } from '@/services/movieCreditsService';
import { useLibraryStore } from '@/services/libraryStore';
import { getCharacterQuestionByGenre } from '@/services/ratingQuestionService';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type { CatalogMovie, RecommendedCatalogMovie, StoredRatingRecord } from '@/types/recommendation';

const props = withDefaults(
  defineProps<{
    isSavingRating?: boolean;
    movie: CatalogMovie | RecommendedCatalogMovie;
    ratingRecord?: null | StoredRatingRecord;
    startWithTrailer?: boolean;
  }>(),
  {
    isSavingRating: false,
    ratingRecord: null,
    startWithTrailer: false
  }
);

const emit = defineEmits<{
  close: [];
  'rate-dislike-submit': [feedback: NegativeRatingInput];
  'rate-like-submit': [feedback: PositiveRatingInput];
}>();

const libraryStore = useLibraryStore();
const root = ref<HTMLElement | null>(null);
const isTrailerOpen = ref(props.startWithTrailer);
const isListPickerOpen = ref(false);
const ratingMode = ref<null | 'negative' | 'positive'>(null);
const isRatingChoiceOpen = ref(false);
const isSavingLibrary = ref(false);
let previousBodyOverflow = '';

const saved = computed(() => libraryStore.hasMovie(props.movie.id));
const characterChoices = computed(() => getCharacterChoices(props.movie.id, props.movie.characters));
const questionText = computed(() => getCharacterQuestionByGenre(props.movie.genres[0] ?? ''));
const reasons = computed(() =>
  'recommendationReasons' in props.movie ? props.movie.recommendationReasons ?? [] : []
);
const breakdown = computed(() => {
  if (!('recommendationScoreBreakdown' in props.movie) || !props.movie.recommendationScoreBreakdown) {
    return [];
  }

  const value = props.movie.recommendationScoreBreakdown;
  const maximums = props.movie.recommendationScoreMaximums;
  if (!maximums) return [];

  return [
    { label: '개인 취향', value: value.personalPreference, maximum: maximums.personalPreference },
    { label: '비슷한 이용자', value: value.similarUser, maximum: maximums.similarUser },
    { label: '상황 적합', value: value.situation, maximum: maximums.situation },
    { label: 'TMDB 품질', value: value.tmdbQuality, maximum: maximums.tmdbQuality },
    { label: '새로움', value: value.novelty, maximum: maximums.novelty },
    { label: '배우·감독', value: value.people, maximum: maximums.people }
  ].filter((item) => item.maximum > 0);
});
const averageScore = computed(() =>
  'recommendationScore' in props.movie && typeof props.movie.recommendationScore === 'number'
    ? Math.round(props.movie.recommendationScore)
    : null
);
const actors = computed(() =>
  characterChoices.value
    .map((choice) => choice.actorName)
    .filter((actor): actor is string => Boolean(actor))
    .slice(0, 4)
);
const providerNames = computed(() => {
  const providers = props.movie.watchProvidersKr;
  return providers ? [...providers.flatrate, ...providers.rent, ...providers.buy].slice(0, 5) : [];
});
const initialPositiveFeedback = computed(() => {
  const record = props.ratingRecord;
  if (!record || record.rawDecision !== 'like') return null;
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
  if (!record || record.rawDecision !== 'dislike') return null;
  return {
    stars: record.input.rating,
    reviewTags: [...record.input.reviewTags],
    favoriteCharacters: [...record.input.favoriteCharacters],
    reviewText: record.reviewText
  };
});

const close = () => emit('close');
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !isListPickerOpen.value) close();
};
const toggleSave = async () => {
  if (isSavingLibrary.value) return;
  isSavingLibrary.value = true;
  try {
    await libraryStore.toggleMovie(props.movie.id);
  } finally {
    isSavingLibrary.value = false;
  }
};
const openRating = () => {
  if (props.ratingRecord?.rawDecision === 'like') {
    ratingMode.value = 'positive';
    return;
  }
  if (props.ratingRecord?.rawDecision === 'dislike') {
    ratingMode.value = 'negative';
    return;
  }
  isRatingChoiceOpen.value = true;
};
const selectRating = (mode: 'negative' | 'positive') => {
  isRatingChoiceOpen.value = false;
  ratingMode.value = mode;
};

watch(
  () => props.movie.id,
  () => {
    isTrailerOpen.value = props.startWithTrailer;
    isListPickerOpen.value = false;
    isRatingChoiceOpen.value = false;
    ratingMode.value = null;
  }
);

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', handleKeydown);
  root.value?.focus();
});
onUnmounted(() => {
  document.body.style.overflow = previousBodyOverflow;
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-end bg-slate-950/45 p-4 pt-10 sm:items-center" @click.self="close">
      <section
        ref="root"
        tabindex="-1"
        class="modal-enter mx-auto max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-w-[800px]"
        role="dialog"
        aria-modal="true"
        :aria-label="`${props.movie.title} 상세 정보`"
      >
        <header class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-app-line bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div class="min-w-0">
            <p v-if="averageScore !== null" class="text-xs font-semibold text-app-accent">추천 점수 {{ averageScore }}점</p>
            <h2 class="mt-0.5 truncate text-lg font-bold text-[#173a5e] sm:text-xl">{{ props.movie.title }}</h2>
          </div>
          <IconButton :icon="X" label="상세 정보 닫기" @click="close" />
        </header>

        <div class="p-4 sm:p-6">
          <div class="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <img
              :src="props.movie.posterUrl"
              :alt="props.movie.posterAlt"
              class="mx-auto aspect-[2/3] w-32 rounded-2xl bg-app-poster object-cover shadow-panel sm:mx-0 sm:w-full"
              loading="lazy"
            />
            <div class="min-w-0">
              <p class="text-sm text-app-muted">
                {{ props.movie.releaseYear }} · {{ props.movie.runtimeMinutes ? `${props.movie.runtimeMinutes}분` : '러닝타임 정보 없음' }}
              </p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <Chip v-for="genre in props.movie.genres" :key="genre" :label="genre" />
              </div>
              <p class="mt-4 text-sm leading-6 text-[#294866]">{{ props.movie.overview || '줄거리 정보가 없습니다.' }}</p>

              <div class="mt-5 flex flex-wrap gap-2">
                <IconButton
                  :icon="Clapperboard"
                  :active="isTrailerOpen"
                  :label="isTrailerOpen ? '예고편 닫기' : '예고편 보기'"
                  :aria-pressed="isTrailerOpen"
                  @click="isTrailerOpen = !isTrailerOpen"
                />
                <IconButton :icon="Heart" :active="saved" :disabled="isSavingLibrary" :label="saved ? '보고싶어요에서 제거' : '보고싶어요에 저장'" @click="toggleSave" />
                <IconButton :icon="Check" label="봤어요 평가하기" @click="openRating" />
                <IconButton :icon="ListPlus" label="리스트에 추가" @click="isListPickerOpen = true" />
              </div>
            </div>
          </div>

          <MovieTrailerPlayer v-if="isTrailerOpen" class="mt-6" :movie="props.movie" />

          <section v-if="breakdown.length" class="mt-6 border-t border-app-line pt-5" aria-labelledby="recommendation-breakdown-title">
            <div class="flex items-baseline justify-between gap-3">
              <h3 id="recommendation-breakdown-title" class="text-sm font-bold text-[#173a5e]">왜 추천했나요?</h3>
              <span v-if="averageScore !== null" class="text-sm font-bold text-app-accent">{{ averageScore }}%</span>
            </div>
            <div class="mt-3 grid gap-2.5">
              <div v-for="item in breakdown" :key="item.label" class="grid grid-cols-[4.75rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs">
                <span class="text-app-muted">{{ item.label }}</span>
                <span class="h-1.5 overflow-hidden rounded-full bg-app-panelSoft"><span class="block h-full rounded-full bg-app-accent" :style="{ width: `${Math.round((item.value / item.maximum) * 100)}%` }" /></span>
                <span class="text-right font-semibold text-[#173a5e]">{{ Math.round(item.value) }}</span>
              </div>
            </div>
            <p v-if="reasons[0]" class="mt-4 text-sm leading-6 text-[#294866]">{{ reasons.slice(0, 2).join(' ') }}</p>
          </section>

          <section v-if="actors.length" class="mt-6 border-t border-app-line pt-5">
            <h3 class="text-sm font-bold text-[#173a5e]">주요 배우</h3>
            <p class="mt-2 text-sm text-app-muted">{{ actors.join(' · ') }}</p>
          </section>

          <section class="mt-6 border-t border-app-line pt-5">
            <h3 class="text-sm font-bold text-[#173a5e]">볼 수 있는 곳</h3>
            <div v-if="providerNames.length" class="mt-3 flex flex-wrap gap-2">
              <span v-for="provider in providerNames" :key="provider.providerId" class="chip border-app-line bg-app-panelSoft text-[#294866]">{{ provider.providerName }}</span>
            </div>
            <p v-else class="mt-2 text-sm text-app-muted">현재 한국 기준 OTT 정보를 찾지 못했어요.</p>
          </section>

          <section v-if="ratingMode" class="mt-6 border-t border-app-line pt-5">
            <PositiveFeedbackForm
              v-if="ratingMode === 'positive'"
              :characters="characterChoices"
              :tmdb-movie-id="props.movie.tmdbMovieId"
              :initial-value="initialPositiveFeedback"
              :question-text="questionText"
              :show-skip-button="false"
              submit-label="평가 저장하기"
              @submit="emit('rate-like-submit', $event)"
            />
            <NegativeFeedbackForm
              v-else
              :characters="characterChoices"
              :tmdb-movie-id="props.movie.tmdbMovieId"
              :initial-value="initialNegativeFeedback"
              :show-skip-button="false"
              submit-label="평가 저장하기"
              @submit="emit('rate-dislike-submit', $event)"
            />
          </section>
        </div>

        <div v-if="isRatingChoiceOpen" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-6" @click.self="isRatingChoiceOpen = false">
          <section class="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl" aria-label="평가 선택">
            <p class="text-center text-sm font-bold text-[#173a5e]">이 영화는 어땠나요?</p>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button type="button" class="button-primary h-10 rounded-xl text-sm font-semibold" @click="selectRating('positive')">좋았어요</button>
              <button type="button" class="button-secondary h-10 rounded-xl text-sm font-semibold" @click="selectRating('negative')">별로예요</button>
            </div>
          </section>
        </div>
      </section>
    </div>
    <ListPickerSheet v-if="isListPickerOpen" :movie="props.movie" @close="isListPickerOpen = false" />
  </Teleport>
</template>
