<script setup lang="ts">
import { reactive, watch } from 'vue';

import HalfStarRating from '@/components/common/HalfStarRating.vue';
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
    compactControls?: boolean;
  }>(),
  {
    compactControls: false,
    initialValue: null,
    showSkipButton: true,
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
      <label for="review" class="mb-2 block text-sm font-medium text-app-muted">한 줄평</label>
      <input
        id="review"
        v-model="form.reviewText"
        maxlength="120"
        class="focus-ring h-11 w-full border border-app-line bg-app-panelSoft px-3 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="이 영화에 대한 한 줄평을 남겨주세요 (선택)"
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
