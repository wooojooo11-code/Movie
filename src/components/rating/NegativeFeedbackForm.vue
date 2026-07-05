<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import type { ReviewTag } from '@/services/movie_recommendation_algorithm';
import type { CharacterChoice, NegativeRatingInput } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    initialValue?: null | Partial<NegativeRatingInput>;
    submitLabel?: string;
  }>(),
  {
    initialValue: null,
    submitLabel: '평가 저장하기'
  }
);

const emit = defineEmits<{
  submit: [feedback: NegativeRatingInput];
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
  favoriteCharacter: null,
  reviewText: ''
});

const applyInitialValue = (value?: null | Partial<NegativeRatingInput>) => {
  form.stars = value?.stars ?? null;
  form.reviewTags = [...(value?.reviewTags ?? [])];
  form.favoriteCharacter = value?.favoriteCharacter ?? null;
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

const submitForm = () => {
  emit('submit', {
    stars: form.stars,
    reviewTags: [...form.reviewTags],
    favoriteCharacter: form.favoriteCharacter,
    reviewText: form.reviewText.trim()
  });
};
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-4">
    <h2 class="text-lg font-semibold text-[#15171c]">별로였던 이유</h2>

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
      <label class="mb-2 block text-sm font-medium text-app-muted" for="negative-character">
        제일 아쉬웠던 역할/배우는 누구였나요?
      </label>
      <div class="relative">
        <select
          id="negative-character"
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
