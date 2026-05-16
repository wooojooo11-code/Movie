<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
import type { ReviewTag } from '@/services/movie_recommendation_algorithm';
import type { CharacterChoice, PositiveRatingInput } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    characters: CharacterChoice[];
    questionText: string;
    initialValue?: Partial<PositiveRatingInput> | null;
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
    label: '스토리와 결말',
    tags: ['탄탄한 스토리', '반전', '여운 있는 결말']
  },
  {
    label: '비주얼과 연출',
    tags: ['영상미', '연출', '세계관']
  },
  {
    label: '음악',
    tags: ['OST', '감동적인 음악']
  },
  {
    label: '배우와 캐릭터',
    tags: ['배우들의 연기력', '캐릭터 매력']
  },
  {
    label: '장르 몰입',
    tags: ['액션', '긴장감', '유머', '몰입감']
  }
];

const form = reactive<PositiveRatingInput>({
  stars: 4.5,
  reviewTags: [],
  favoriteCharacter: null,
  reviewText: '',
  questionText: ''
});

const applyInitialValue = (value?: Partial<PositiveRatingInput> | null) => {
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
  <section class="rounded-[24px] border border-app-line bg-app-panel p-4">
    <h2 class="text-lg font-extrabold text-white">좋았던 포인트</h2>

    <div class="mt-4">
      <label class="mb-2 block text-sm font-bold text-app-muted">별점</label>
      <HalfStarRating
        v-model="form.stars"
        size="md"
        hint="별 반쪽은 0.5점, 별 하나는 1점으로 반영돼요."
        aria-label-prefix="영화 평점"
      />
    </div>

    <div class="mt-4">
      <p class="mb-2 block text-sm font-bold text-app-muted">좋았던 포인트</p>
      <div class="grid gap-4">
        <div
          v-for="category in reviewTagCategories"
          :key="category.label"
          class="border-t border-white/5 pt-4 first:border-t-0 first:pt-0"
        >
          <p class="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-app-muted">
            {{ category.label }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in category.tags"
              :key="tag"
              type="button"
              class="focus-ring rounded-full border px-3 py-2 text-sm font-bold"
              :class="
                form.reviewTags.includes(tag)
                  ? 'border-transparent bg-app-accent text-white'
                  : 'border-app-line bg-white/5 text-app-muted'
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
        class="focus-ring mt-3 min-h-24 w-full resize-none rounded-[16px] border border-app-line bg-white/5 px-4 py-3 text-sm text-white placeholder:text-app-muted"
        placeholder="짧게 메모 남기기"
      />
    </div>

    <div class="mt-4">
      <label class="mb-2 block text-sm font-bold text-app-muted" for="favorite-character">
        {{ props.questionText }}
      </label>
      <div class="relative">
        <select
          id="favorite-character"
          v-model="form.favoriteCharacter"
          class="focus-ring h-12 w-full appearance-none rounded-[16px] border border-app-line bg-white/5 px-4 pr-11 text-sm text-white"
        >
          <option class="bg-app-panel text-white" :value="null">선택 안 함</option>
          <option
            v-for="character in props.characters"
            :key="character.name"
            :value="character.name"
            class="bg-app-panel text-white"
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

    <div class="mt-4 flex gap-2">
      <button
        v-if="props.showSkipButton"
        type="button"
        class="focus-ring min-h-12 flex-1 rounded-[16px] border border-app-line bg-white/5 px-3 text-sm font-extrabold text-white"
        @click="$emit('skip')"
      >
        기억 안 남
      </button>
      <button
        type="button"
        class="app-gradient focus-ring min-h-12 rounded-[16px] px-3 text-sm font-extrabold text-white"
        :class="props.showSkipButton ? 'flex-[1.2]' : 'w-full'"
        @click="submitForm"
      >
        {{ props.submitLabel }}
      </button>
    </div>
  </section>
</template>
