<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  getManualSituationLabels,
  getSituationPreset,
  isCompleteSituationSelection,
  situationOptionGroups,
  situationPresets
} from '@/data/situations';
import { popularRecommendedLists } from '@/data/popularLists';
import RecommendationListCard from '@/components/recommendations/RecommendationListCard.vue';
import RecommendationMovieCard from '@/components/recommendations/RecommendationMovieCard.vue';
import RecommendationMovieSheet from '@/components/recommendations/RecommendationMovieSheet.vue';
import type { RatingInput } from '@/services/movie_recommendation_algorithm';
import { useListStore } from '@/services/listStore';
import { useRecommendationStore } from '@/services/recommendationStore';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type {
  RecommendedCatalogList,
  RecommendedCatalogMovie,
  SituationSelection,
  StoredRatingRecord
} from '@/types/recommendation';
import type { RatingFeedbackPayload } from '@/types/recommendation';

const listStore = useListStore();
const recommendationStore = useRecommendationStore();
const router = useRouter();
const selectedMovie = ref<null | RecommendedCatalogMovie>(null);
const isSavingRecommendationRating = ref(false);
const manualSelection = ref<Partial<SituationSelection>>({});

const hasMoreTasteAnalysis = computed(() => recommendationStore.hasAdditionalTasteAnalysisMovies.value);
const isManualSelectionComplete = computed(() => isCompleteSituationSelection(manualSelection.value));
const activeSituation = computed(() => recommendationStore.activeSituation.value);
const activeSituationTitle = computed(() => {
  if (activeSituation.value.kind === 'preset') {
    return getSituationPreset(activeSituation.value.presetId)?.label ?? '추천 상황';
  }

  return activeSituation.value.kind === 'manual' ? '내가 설정한 상황' : '지금의 나에게 맞는 영화';
});
const activeSituationLabels = computed(() =>
  activeSituation.value.kind === 'manual' ? getManualSituationLabels(activeSituation.value.selection) : []
);

const openMovieSheet = (movie: RecommendedCatalogMovie) => {
  selectedMovie.value = movie;
};

const closeMovieSheet = () => {
  selectedMovie.value = null;
};

const selectedMovieRatingRecord = computed(() => {
  if (!selectedMovie.value) {
    return null;
  }

  const record = recommendationStore.getStoredRatingRecord(selectedMovie.value.id);

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
  } satisfies StoredRatingRecord;
});

const saveRecommendationRating = async (
  input: RatingInput,
  options: {
    detailCompleted: boolean;
    feedback?: RatingFeedbackPayload;
    rawDecision: StoredRatingRecord['rawDecision'];
  }
) => {
  if (!selectedMovie.value || isSavingRecommendationRating.value) {
    return;
  }

  isSavingRecommendationRating.value = true;

  try {
    await recommendationStore.submitSwipeRating(selectedMovie.value, input, options);
    closeMovieSheet();
  } finally {
    isSavingRecommendationRating.value = false;
  }
};

const handleRecommendationDislike = async (feedback: NegativeRatingInput) => {
  if (!selectedMovie.value) {
    return;
  }

  const payload: RatingFeedbackPayload = {
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    reviewText: feedback.reviewText,
    questionText: ''
  };

  await saveRecommendationRating(
    {
      movieId: selectedMovie.value.id,
      userId: recommendationStore.state.userId,
      status: 'dislike',
      rating: payload.rating,
      reviewTags: payload.reviewTags,
      favoriteCharacters: payload.favoriteCharacters,
      answeredAt: new Date().toISOString()
    },
    {
      rawDecision: 'dislike',
      detailCompleted: true,
      feedback: payload
    }
  );
};

const handleRecommendationLike = async (feedback: PositiveRatingInput) => {
  if (!selectedMovie.value) {
    return;
  }

  const payload: RatingFeedbackPayload = {
    rating: feedback.stars,
    reviewTags: feedback.reviewTags,
    favoriteCharacters: feedback.favoriteCharacters,
    reviewText: feedback.reviewText,
    questionText: feedback.questionText
  };

  await saveRecommendationRating(
    {
      movieId: selectedMovie.value.id,
      userId: recommendationStore.state.userId,
      status: 'like',
      rating: payload.rating,
      reviewTags: payload.reviewTags,
      favoriteCharacters: payload.favoriteCharacters,
      answeredAt: new Date().toISOString()
    },
    {
      rawDecision: 'like',
      detailCompleted: true,
      feedback: payload
    }
  );
};

const saveRecommendedList = (list: RecommendedCatalogList) => {
  void listStore.saveRecommendedList(list);
};

const openListsPage = () => {
  void router.push('/lists');
};

const openMoreTasteAnalysis = async () => {
  if (
    recommendationStore.pendingDetailedRatings.value.length > 0 &&
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value == null
  ) {
    recommendationStore.setRatingResumeSurface('detail');
    await router.push('/rating?mode=detail');
    return;
  }

  const nextBatchIndex = recommendationStore.ensureAdditionalTasteAnalysisBatch(
    recommendationStore.activeAdditionalTasteAnalysisBatchIndex.value
  );

  if (nextBatchIndex == null) {
    return;
  }

  recommendationStore.setRatingResumeSurface('more');
  await router.push({
    path: '/rating',
    query: {
      mode: 'more',
      batch: String(Date.now())
    }
  });
};

const getManualSelectionValue = (key: keyof SituationSelection) => manualSelection.value[key];

const setManualSelection = (key: keyof SituationSelection, value: string) => {
  manualSelection.value = {
    ...manualSelection.value,
    [key]: value
  } as Partial<SituationSelection>;
};

const applyManualSituation = () => {
  if (!isCompleteSituationSelection(manualSelection.value)) {
    return;
  }

  void recommendationStore.setActiveSituation({
    kind: 'manual',
    selection: { ...manualSelection.value }
  });
};

const applyPreset = (presetId: (typeof situationPresets)[number]['id']) => {
  void recommendationStore.setActiveSituation({ kind: 'preset', presetId });
};

const applyDefaultSituation = () => {
  void recommendationStore.setActiveSituation({ kind: 'none' });
};
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-7 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-5xl"
  >
    <section class="grid gap-3">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[25px] font-semibold leading-tight text-[#15171c]">지금, 어떤 영화가 필요해?</h1>
        </div>
        <span class="shrink-0 text-xs font-medium text-app-muted">
          {{ recommendationStore.state.profile.totalRatings }}개 평가
        </span>
      </div>

      <div class="flex flex-wrap gap-2.5">
        <RouterLink
          v-if="recommendationStore.state.profile.totalRatings === 0"
          to="/rating"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-4 text-sm font-semibold text-white"
        >
          취향 분석 시작
        </RouterLink>

        <button
          v-else-if="hasMoreTasteAnalysis"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center gap-2 border border-app-line bg-app-panelSoft px-4 text-sm font-semibold text-[#15171c]"
          @click="openMoreTasteAnalysis"
        >
          <span
            class="corner-pill inline-flex h-5 w-5 items-center justify-center border border-app-line text-[13px] leading-none text-[#15171c]"
          >
            +
          </span>
          취향 분석 더하기
        </button>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="corner-hard border border-app-line bg-app-panel p-4">
        <div class="mb-3">
          <h2 class="text-base font-semibold text-[#15171c]">직접 상황 설정</h2>
        </div>

        <div class="grid max-w-sm grid-cols-3 gap-2.5">
          <label v-for="group in situationOptionGroups" :key="group.key" class="grid min-w-0 gap-1">
            <span class="text-xs font-semibold text-[#15171c]">{{ group.label }}</span>
            <select
              class="focus-ring corner-soft min-h-9 w-full border border-app-line bg-app-panelSoft px-2.5 text-xs font-medium text-[#15171c]"
              :value="getManualSelectionValue(group.key) ?? ''"
              @change="setManualSelection(group.key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>선택</option>
              <option v-for="option in group.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <button
          type="button"
          class="focus-ring corner-soft mt-4 inline-flex min-h-10 items-center justify-center bg-app-accent px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-app-line disabled:text-app-muted"
          :disabled="!isManualSelectionComplete"
          @click="applyManualSituation"
        >
          이 상황으로 추천받기
        </button>
      </article>

      <article class="corner-hard border border-app-line bg-app-panel p-4 sm:p-5">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-[#15171c]">추천 상황</h2>
          <p class="mt-1 text-sm text-app-muted">지금 마음에 가까운 문구를 누르면 바로 추천해 드려요.</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="focus-ring corner-pill min-h-9 border px-3 text-left text-xs font-medium transition-colors"
            :class="
              activeSituation.kind === 'none'
                ? 'border-app-accent bg-app-accent text-white'
                : 'border-app-line bg-app-panelSoft text-app-muted hover:border-app-accent hover:text-[#15171c]'
            "
            @click="applyDefaultSituation"
          >
            기본
          </button>
          <button
            v-for="preset in situationPresets"
            :key="preset.id"
            type="button"
            class="focus-ring corner-pill min-h-9 border px-3 text-left text-xs font-medium transition-colors"
            :class="
              activeSituation.kind === 'preset' && activeSituation.presetId === preset.id
                ? 'border-app-accent bg-app-accent text-white'
                : 'border-app-line bg-app-panelSoft text-app-muted hover:border-app-accent hover:text-[#15171c]'
            "
            @click="applyPreset(preset.id)"
          >
            {{ preset.label }}
          </button>
        </div>
      </article>
    </section>

    <section>
      <div class="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#15171c]">{{ activeSituationTitle }}에 추천하는 영화</h2>
          <div v-if="activeSituationLabels.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="label in activeSituationLabels"
              :key="label"
              class="corner-pill border border-app-line bg-app-panelSoft px-2.5 py-1 text-[11px] font-medium text-app-muted"
            >
              {{ label }}
            </span>
          </div>
        </div>
        <span class="shrink-0 text-xs text-app-muted">
          {{ recommendationStore.contextAwareRecommendedMovies.value.length }}개
        </span>
      </div>

      <div
        v-if="recommendationStore.contextAwareRecommendedMovies.value.length > 0"
        class="grid grid-cols-5 gap-2"
      >
        <RecommendationMovieCard
          v-for="movie in recommendationStore.contextAwareRecommendedMovies.value"
          :key="movie.id"
          :movie="movie"
          size="compact"
          @open="openMovieSheet"
        />
      </div>

      <div
        v-else
        class="corner-hard border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm text-app-muted"
      >
        지금 조건과 맞는 영화가 없어요. 다른 상황을 선택해 보세요.
      </div>
    </section>

    <section>
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-[#15171c]">다른 사람들이 좋아한 리스트</h2>
      </div>

      <div class="grid gap-3">
        <RecommendationListCard
          v-for="list in popularRecommendedLists"
          :key="list.id"
          :is-saved="listStore.hasImportedList(list.id)"
          :list="list"
          @save="saveRecommendedList(list)"
          @open-lists="openListsPage"
        />
      </div>
    </section>

    <RecommendationMovieSheet
      v-if="selectedMovie"
      :is-saving-rating="isSavingRecommendationRating"
      :movie="selectedMovie"
      :rating-record="selectedMovieRatingRecord"
      @rate-dislike-submit="handleRecommendationDislike"
      @rate-like-submit="handleRecommendationLike"
      @close="closeMovieSheet"
    />
  </main>
</template>
