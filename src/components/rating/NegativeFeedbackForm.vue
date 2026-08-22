<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import CastChoiceGrid from '@/components/rating/CastChoiceGrid.vue';
import {
  MAX_FAVORITE_CAST_CHOICES,
  normalizeFavoriteCharacters,
  type CharacterChoice,
  type NegativeRatingInput
} from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    tmdbMovieId?: null | number;
    initialValue?: null | Partial<NegativeRatingInput>;
    showSkipButton?: boolean;
    submitLabel?: string;
    compactControls?: boolean;
  }>(),
  {
    compactControls: false,
    initialValue: null,
    showSkipButton: true,
    tmdbMovieId: null,
    submitLabel: '평가 저장하기'
  }
);

const emit = defineEmits<{
  submit: [feedback: NegativeRatingInput];
  skip: [];
}>();

const form = reactive<NegativeRatingInput>({
  stars: null,
  reviewTags: [],
  favoriteCharacters: [],
  reviewText: ''
});

const applyInitialValue = (value?: null | Partial<NegativeRatingInput>) => {
  form.stars = value?.stars ?? null;
  form.reviewTags = [];
  form.favoriteCharacters = normalizeFavoriteCharacters(
    value?.favoriteCharacters ??
      (value as Partial<NegativeRatingInput> & { favoriteCharacter?: null | string | string[] })
        ?.favoriteCharacter
  );
  form.reviewText = value?.reviewText ?? '';
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
    reviewText: form.reviewText.trim()
  });
};
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4 shadow-[0_14px_32px_rgba(21,23,28,0.08)] sm:p-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold tracking-[0.16em] text-[#c24d4d]">DETAIL REVIEW</p>
        <h2 class="mt-1 text-lg font-semibold text-[#15171c]">아쉬웠던 점을 남겨주세요</h2>
        <p class="mt-1 text-xs text-app-muted">다음 추천에서 비슷한 아쉬움은 줄여볼게요.</p>
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
        <button
          v-if="form.stars != null"
          type="button"
          class="focus-ring corner-soft inline-flex min-h-8 items-center justify-center border border-app-line bg-app-panelSoft px-2.5 text-[11px] font-medium text-[#15171c]"
          @click="form.stars = null"
        >
          별점 지우기
        </button>
      </div>
      <HalfStarRating
        v-model="form.stars"
        size="md"
        hint="선택하지 않아도 저장할 수 있어요"
        aria-label-prefix="영화 평점"
      />
    </div>

    <div class="corner-soft mt-4 border border-app-line bg-app-panelSoft p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label for="negative-review" class="block text-sm font-semibold text-[#15171c]">한 줄평</label>
        <span class="text-[11px] text-app-muted">선택</span>
      </div>
      <input
        id="negative-review"
        v-model="form.reviewText"
        maxlength="120"
        class="focus-ring h-11 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="이 영화에 대한 한 줄평을 남겨주세요 (선택)"
      />
    </div>

    <div class="corner-soft mt-4 border border-app-line bg-app-panelSoft p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-semibold text-[#15171c]">
          아쉬웠던 배우/역할은 누구였나요?
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
