<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import CastChoiceGrid from '@/components/rating/CastChoiceGrid.vue';
import {
  MAX_FAVORITE_CAST_CHOICES,
  normalizeFavoriteCharacters,
  type CharacterChoice,
  type PositiveRatingInput
} from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    tmdbMovieId?: null | number;
    questionText: string;
    initialValue?: null | Partial<PositiveRatingInput>;
    showSkipButton?: boolean;
    submitLabel?: string;
    compactControls?: boolean;
  }>(),
  {
    compactControls: false,
    initialValue: null,
    showSkipButton: true,
    tmdbMovieId: null,
    submitLabel: '저장하기'
  }
);

const emit = defineEmits<{
  submit: [feedback: PositiveRatingInput];
  skip: [];
}>();

const form = reactive<PositiveRatingInput>({
  stars: 4.5,
  reviewTags: [],
  favoriteCharacters: [],
  reviewText: '',
  questionText: ''
});

const applyInitialValue = (value?: null | Partial<PositiveRatingInput>) => {
  form.stars = value?.stars ?? 4.5;
  form.reviewTags = [];
  form.favoriteCharacters = normalizeFavoriteCharacters(
    value?.favoriteCharacters ??
      (value as Partial<PositiveRatingInput> & { favoriteCharacter?: null | string | string[] })
        ?.favoriteCharacter
  );
  form.reviewText = value?.reviewText ?? '';
  form.questionText = value?.questionText ?? '';
};

watch(
  () => props.initialValue,
  (value) => {
    applyInitialValue(value);
  },
  {
    immediate: true,
    deep: true
  }
);

const toggleFavoriteCharacter = (name: string) => {
  const currentIndex = form.favoriteCharacters.indexOf(name);

  if (currentIndex >= 0) {
    form.favoriteCharacters.splice(currentIndex, 1);
    return;
  }

  if (form.favoriteCharacters.length >= MAX_FAVORITE_CAST_CHOICES) {
    return;
  }

  form.favoriteCharacters.push(name);
};

const submitForm = () => {
  emit('submit', {
    stars: form.stars,
    reviewTags: [],
    favoriteCharacters: [...form.favoriteCharacters],
    reviewText: form.reviewText.trim(),
    questionText: ''
  });
};
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4 shadow-[0_14px_32px_rgba(21,23,28,0.08)] sm:p-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold tracking-[0.16em] text-app-accent">DETAIL REVIEW</p>
        <h2 class="mt-1 text-lg font-semibold text-[#15171c]">좋았던 순간을 남겨주세요</h2>
        <p class="mt-1 text-xs text-app-muted">별점과 한 줄평이 다음 추천에 반영돼요.</p>
      </div>
      <button
        v-if="props.showSkipButton"
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 shrink-0 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-[#15171c]"
        @click="$emit('skip')"
      >
        건너뛰기
      </button>
    </div>

    <div class="corner-soft mt-5 border border-app-line bg-app-panelSoft p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-semibold text-[#15171c]">내 별점</label>
        <span class="text-[11px] text-app-muted">0.5점 단위</span>
      </div>
      <HalfStarRating
        v-model="form.stars"
        size="md"
        hint="0.5점 단위로 고를 수 있어요"
        aria-label-prefix="영화 별점"
      />
    </div>

    <div class="corner-soft mt-4 border border-app-line bg-app-panelSoft p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label for="review" class="block text-sm font-semibold text-[#15171c]">한 줄평</label>
        <span class="text-[11px] text-app-muted">선택</span>
      </div>
      <input
        id="review"
        v-model="form.reviewText"
        maxlength="120"
        class="focus-ring h-11 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="이 영화에 대한 한 줄평을 남겨주세요 (선택)"
      />
    </div>

    <div class="corner-soft mt-4 border border-app-line bg-app-panelSoft p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-semibold text-[#15171c]">
          좋았던 배우/역할은 누구였나요?
        </label>
        <button
          v-if="form.favoriteCharacters.length > 0"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-2.5 text-[11px] font-medium text-[#15171c]"
          @click="form.favoriteCharacters = []"
        >
          선택 지우기
        </button>
      </div>
      <p class="mb-3 text-xs text-app-muted">
        최대 {{ MAX_FAVORITE_CAST_CHOICES }}명까지 고를 수 있어요.
      </p>

      <CastChoiceGrid
        v-if="props.characters.length > 0"
        :characters="props.characters"
        :compact="props.compactControls"
        :selected-characters="form.favoriteCharacters"
        :tmdb-movie-id="props.tmdbMovieId"
        @toggle="toggleFavoriteCharacter"
      />

      <p
        v-else
        class="corner-hard border border-dashed border-app-line bg-app-panelSoft px-4 py-4 text-sm text-app-muted"
      >
        선택할 배우 정보를 아직 찾지 못했어요.
      </p>
    </div>

    <div
      class="mt-5 border-t border-app-line pt-4"
      :class="props.compactControls ? 'flex justify-center' : ''"
    >
      <button
        type="button"
        class="focus-ring corner-soft border border-app-accent bg-app-accent font-semibold text-white"
        :class="
          props.compactControls
            ? 'inline-flex min-h-10 items-center justify-center px-4 text-xs'
            : 'min-h-11 w-full px-3 text-sm'
        "
        @click="submitForm"
      >
        {{ props.submitLabel }}
      </button>
    </div>
  </section>
</template>
