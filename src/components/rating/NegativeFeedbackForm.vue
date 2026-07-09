<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import type { ReviewTag } from '@/services/movie_recommendation_algorithm';
import {
  MAX_FAVORITE_CAST_CHOICES,
  normalizeFavoriteCharacters,
  type CharacterChoice,
  type NegativeRatingInput
} from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    initialValue?: null | Partial<NegativeRatingInput>;
    showSkipButton?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialValue: null,
    showSkipButton: true,
    submitLabel: '평가 저장하기'
  }
);

const emit = defineEmits<{
  submit: [feedback: NegativeRatingInput];
  skip: [];
}>();

const negativeReviewTagCategories: Array<{ label: string; tags: ReviewTag[] }> = [
  {
    label: '스토리와 개연성',
    tags: [
      '예고편이 다예요',
      '스토리가 루즈하고 지루해요',
      '결말이 허무하고 개연성 없어요',
      '무슨 내용인지 이해불가예요'
    ]
  },
  {
    label: '연출과 완성도',
    tags: [
      '연기나 CG가 어색해요',
      '눈가리고 싶을 정도로 잔인해요',
      '억지감동, 뻔한 신파극이에요'
    ]
  },
  {
    label: '대중성과 기대 대비',
    tags: [
      '소문난 잔치에 먹을 게 없어요',
      '알바 리뷰에 속은 기분이에요',
      '내 2시간 돌려내요'
    ]
  }
];

const form = reactive<NegativeRatingInput>({
  stars: null,
  reviewTags: [],
  favoriteCharacters: [],
  reviewText: ''
});

const applyInitialValue = (value?: null | Partial<NegativeRatingInput>) => {
  form.stars = value?.stars ?? null;
  form.reviewTags = [...(value?.reviewTags ?? [])];
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

const toggleReviewTag = (tag: ReviewTag) => {
  const currentIndex = form.reviewTags.indexOf(tag);

  if (currentIndex >= 0) {
    form.reviewTags.splice(currentIndex, 1);
    return;
  }

  if (form.reviewTags.length >= 3) {
    return;
  }

  form.reviewTags.push(tag);
};

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
    reviewTags: [...form.reviewTags],
    favoriteCharacters: [...form.favoriteCharacters],
    reviewText: form.reviewText.trim()
  });
};
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-[#15171c]">별로였던 이유</h2>
      <button
        v-if="props.showSkipButton"
        type="button"
        class="focus-ring corner-soft inline-flex min-h-9 shrink-0 items-center justify-center border border-app-line bg-app-panelSoft px-3 text-xs font-medium text-[#15171c]"
        @click="$emit('skip')"
      >
        건너뛰기
      </button>
    </div>

    <div class="mt-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-medium text-app-muted">별점</label>
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

    <div class="mt-5">
      <p class="mb-3 text-sm font-medium text-app-muted">어떤 점이 별로였나요</p>
      <p class="mb-3 text-xs text-app-muted">최대 3개까지 고를 수 있어요</p>

      <div class="grid gap-4">
        <div
          v-for="category in negativeReviewTagCategories"
          :key="category.label"
          class="border-t border-app-line pt-4 first:border-t-0 first:pt-0"
        >
          <p class="mb-2 text-xs font-semibold tracking-[0.08em] text-app-muted">
            {{ category.label }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in category.tags"
              :key="tag"
              type="button"
              class="focus-ring corner-pill border px-3 py-2 text-sm font-medium transition-colors"
              :class="
                form.reviewTags.includes(tag)
                  ? 'border-app-accent bg-app-accent text-white'
                  : 'border-app-line bg-app-panelSoft text-[#15171c]'
              "
              @click="toggleReviewTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <textarea
        id="negative-review"
        v-model="form.reviewText"
        class="focus-ring mt-3 min-h-24 w-full resize-none border border-app-line bg-app-panelSoft px-4 py-3 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="짧게 메모를 남겨도 좋아요"
      />
    </div>

    <div class="mt-5">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-medium text-app-muted">
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

      <div v-if="props.characters.length > 0" class="grid gap-2">
        <button
          v-for="character in props.characters"
          :key="character.name"
          type="button"
          class="focus-ring corner-soft w-full border px-3 py-3 text-left text-sm transition-colors"
          :class="
            form.favoriteCharacters.includes(character.name)
              ? 'border-app-accent bg-app-accent text-white'
              : 'border-app-line bg-app-panelSoft text-[#15171c]'
          "
          @click="toggleFavoriteCharacter(character.name)"
        >
          <span class="block font-semibold">
            {{ character.actorName ?? '배우 정보 없음' }}
          </span>
          <span
            class="mt-1 block text-xs"
            :class="form.favoriteCharacters.includes(character.name) ? 'text-white/80' : 'text-app-muted'"
          >
            {{ character.name }} 역
          </span>
        </button>
      </div>

      <p
        v-else
        class="corner-hard border border-dashed border-app-line bg-app-panelSoft px-4 py-4 text-sm text-app-muted"
      >
        선택할 배우 정보를 아직 찾지 못했어요.
      </p>
    </div>

    <div class="mt-5">
      <button
        type="button"
        class="focus-ring corner-soft min-h-11 w-full border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white"
        @click="submitForm"
      >
        {{ props.submitLabel }}
      </button>
    </div>
  </section>
</template>
