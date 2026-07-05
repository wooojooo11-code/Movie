<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import type { ReviewTag } from '@/services/movie_recommendation_algorithm';
import type { CharacterChoice, PositiveRatingInput } from '@/types/rating';

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
  favoriteCharacter: null,
  reviewText: '',
  questionText: ''
});

const applyInitialValue = (value?: null | Partial<PositiveRatingInput>) => {
  form.stars = value?.stars ?? 4.5;
  form.reviewTags = [...(value?.reviewTags ?? [])];
  form.favoriteCharacter = value?.favoriteCharacter ?? null;
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

const submitForm = () => {
  emit('submit', {
    stars: form.stars,
    reviewTags: [...form.reviewTags],
    favoriteCharacter: form.favoriteCharacter,
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
      <label class="mb-2 block text-sm font-medium text-app-muted" for="favorite-character">
        {{ props.questionText || '가장 기억에 남는 캐릭터는 누구였나요?' }}
      </label>
      <div class="relative">
        <select
          id="favorite-character"
          v-model="form.favoriteCharacter"
          class="focus-ring h-12 w-full appearance-none border border-app-line bg-app-panelSoft px-4 pr-11 text-sm text-[#15171c]"
        >
          <option class="bg-app-panel text-[#15171c]" :value="null">선택 안 함</option>
          <option
            v-for="character in props.characters"
            :key="character.name"
            :value="character.name"
            class="bg-app-panel text-[#15171c]"
          >
            {{ character.name }} · {{ character.actorName ?? '배우 정보 없음' }}
          </option>
        </select>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-app-muted"
          aria-hidden="true"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
      </div>
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
