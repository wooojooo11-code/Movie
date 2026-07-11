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
    compactControls?: boolean;
  }>(),
  {
    compactControls: false,
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
    label: '스토리',
    tags: [
      '스토리는 전개가 너무 느렸어요',
      '이야기가 이해하기 어려웠어요',
      '결말이 아쉬웠어요',
      '몰입하기 어려웠어요'
    ]
  },
  {
    label: '캐릭터',
    tags: [
      '주인공에게 공감이 안됐어요',
      '캐릭터가 매력적이지 않았어요',
      '배우연기가 아쉬웠어요',
      '등장인물이 너무 많았어요'
    ]
  },
  {
    label: '연출',
    tags: [
      '영상미가 아쉬웠어요',
      '장면 전환이 아쉬웠어요',
      '연출 의도를 이해하기 어려웠어요',
      'CG가 너무 어색했어요'
    ]
  },
  {
    label: '분위기',
    tags: [
      '액션이 부자연스러워요',
      '긴장감이 부족했어요',
      '유머가 제취향이 아니었어요',
      '감정선이 부족했어요'
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
          class="focus-ring corner-soft border text-left transition-colors"
          :class="[
            props.compactControls
              ? 'w-full max-w-[14rem] justify-self-start px-2 py-1.5 text-[11px] leading-tight'
              : 'w-full px-3 py-3 text-sm',
            form.favoriteCharacters.includes(character.name)
              ? 'border-app-accent bg-app-accent text-white'
              : 'border-app-line bg-app-panelSoft text-[#15171c]'
          ]"
          @click="toggleFavoriteCharacter(character.name)"
        >
          <span class="block font-semibold">
            {{ character.actorName ?? '배우 정보 없음' }}
          </span>
          <span
            class="block"
            :class="[
              props.compactControls ? 'mt-0.5 text-[10px]' : 'mt-1 text-xs',
              form.favoriteCharacters.includes(character.name) ? 'text-white/80' : 'text-app-muted'
            ]"
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

    <div :class="props.compactControls ? 'mt-5 flex justify-center' : 'mt-5'">
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
