<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import type { ReviewTag } from '@/services/movie_recommendation_algorithm';
import {
  MAX_FAVORITE_CAST_CHOICES,
  normalizeFavoriteCharacters,
  type CharacterChoice,
  type PositiveRatingInput
} from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    questionText: string;
    initialValue?: null | Partial<PositiveRatingInput>;
    showSkipButton?: boolean;
    submitLabel?: string;
  }>(),
  {
    initialValue: null,
    showSkipButton: true,
    submitLabel: '저장하기'
  }
);

const emit = defineEmits<{
  submit: [feedback: PositiveRatingInput];
  skip: [];
}>();

const reviewTagCategories: Array<{ label: string; tags: ReviewTag[] }> = [
  {
    label: '스토리와 몰입감',
    tags: [
      '시간 가는 줄 몰랐어요',
      '스토리가 탄탄하고 짜임새 있어요',
      '반전의 반전! 전개가 예측불가해요',
      '명대사가 가슴에 와닿아요'
    ]
  },
  {
    label: '연출과 비주얼',
    tags: [
      '영상미가 아름답고 색감이 예뻐요',
      '음악/사운드가 몰입감을 높여요',
      'CG/액션 스케일이 압도적이에요',
      '배우들의 연기력이 미쳤어요'
    ]
  },
  {
    label: '감정과 무드',
    tags: [
      '아무 생각 없이 웃기 좋아요',
      '심장이 쫄깃하고 긴장감 넘쳐요',
      '여운이 길게 남아요',
      '생각할 거리를 던져주는 영화예요'
    ]
  },
  {
    label: '추천 대상과 시청 환경',
    tags: [
      '연인/친구와 데이트용으로 딱이에요',
      '가족과 함께 보기 좋아요',
      '혼자 집중해서 보기 좋은 영화예요',
      'N차 관람(재관람)하고 싶은 영화예요'
    ]
  }
];

const form = reactive<PositiveRatingInput>({
  stars: 4.5,
  reviewTags: [],
  favoriteCharacters: [],
  reviewText: '',
  questionText: ''
});

const applyInitialValue = (value?: null | Partial<PositiveRatingInput>) => {
  form.stars = value?.stars ?? 4.5;
  form.reviewTags = [...(value?.reviewTags ?? [])];
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
    reviewText: form.reviewText.trim(),
    questionText: ''
  });
};
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-[#15171c]">상세 평가</h2>
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
      <label class="mb-2 block text-sm font-medium text-app-muted">별점</label>
      <HalfStarRating
        v-model="form.stars"
        size="md"
        hint="0.5점 단위로 고를 수 있어요"
        aria-label-prefix="영화 별점"
      />
    </div>

    <div class="mt-5">
      <p class="mb-3 text-sm font-medium text-app-muted">어떤 점이 좋았나요</p>
      <p class="mb-3 text-xs text-app-muted">최대 3개까지 고를 수 있어요.</p>
      <div class="grid gap-4">
        <div
          v-for="category in reviewTagCategories"
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
        id="review"
        v-model="form.reviewText"
        class="focus-ring mt-3 min-h-24 w-full resize-none border border-app-line bg-app-panelSoft px-4 py-3 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="짧게 메모를 남겨도 좋아요"
      />
    </div>

    <div class="mt-5">
      <div class="mb-2 flex items-center justify-between gap-3">
        <label class="block text-sm font-medium text-app-muted">
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
