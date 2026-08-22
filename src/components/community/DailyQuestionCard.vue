<script setup lang="ts">
import { ref, watch } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import type {
  CommunityMovieReference,
  DailyQuestion,
  DailyQuestionAnswerInput
} from '@/types/community';

const props = defineProps<{ question: DailyQuestion | null; isAuthenticated: boolean; loading?: boolean; viewerId?: null | string }>();
const emit = defineEmits<{ submit: [input: DailyQuestionAnswerInput]; login: []; viewAnswers: [] }>();
const answer = ref('');
const selectedMovie = ref<CommunityMovieReference | null>(null);
const submitting = ref(false);

const getAnswerCacheKey = () =>
  props.question?.id && props.viewerId
    ? `movielist:daily-question-answer:${props.viewerId}:${props.question.id}`
    : null;

const loadCachedAnswer = () => {
  const key = getAnswerCacheKey();
  if (!key || typeof window === 'undefined') return null;

  try {
    const cached = JSON.parse(window.localStorage.getItem(key) ?? 'null') as null | {
      content?: string;
      movie?: CommunityMovieReference;
    };
    return cached?.movie ? { content: cached.content ?? '', movie: cached.movie } : null;
  } catch {
    return null;
  }
};

const cacheAnswer = () => {
  const key = getAnswerCacheKey();
  if (!key || !selectedMovie.value || typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ content: answer.value.trim(), movie: selectedMovie.value })
    );
  } catch {
    // 브라우저 저장소를 사용할 수 없어도 서버 저장은 계속 진행합니다.
  }
};

watch(
  () => [props.question?.id, props.question?.viewerAnswer, props.viewerId] as const,
  ([, viewerAnswer]) => {
    const savedAnswer = viewerAnswer?.movie ? viewerAnswer : loadCachedAnswer();
    answer.value = savedAnswer?.content ?? '';
    selectedMovie.value = savedAnswer?.movie ?? null;
  },
  { immediate: true }
);

const selectMovie = (movie: CommunityMovieReference) => {
  selectedMovie.value = movie;
};

const selectCustomMovie = (title: string) => {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return;

  selectedMovie.value = {
    id: `manual:${encodeURIComponent(normalizedTitle.toLocaleLowerCase('ko-KR')).slice(0, 180)}`,
    title: normalizedTitle,
    posterPath: null
  };
};

const submit = () => {
  if (!props.isAuthenticated) {
    emit('login');
    return;
  }

  if (!selectedMovie.value || submitting.value) {
    return;
  }

  submitting.value = true;
  cacheAnswer();
  emit('submit', { content: answer.value, movie: selectedMovie.value });
  window.setTimeout(() => {
    submitting.value = false;
  }, 250);
};
</script>

<template>
  <section class="corner-soft border border-app-line bg-app-panel p-4" aria-labelledby="daily-question-title">
    <div class="flex items-start gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-full border-2 border-app-accent bg-[#eef6ff] text-sm font-bold text-[#174a77]" aria-hidden="true">Q</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-bold text-[#15171c]">오늘의 영화 질문</p>
          <button
            v-if="question"
            type="button"
            class="focus-ring text-xs font-semibold text-[#174a77] underline underline-offset-2"
            @click="emit('viewAnswers')"
          >
            답변 보기
          </button>
        </div>
        <h2 id="daily-question-title" class="mt-2 text-base font-semibold leading-6 text-[#15171c]">
          {{ question?.question ?? (loading ? '오늘의 질문을 불러오는 중이에요.' : '오늘의 질문을 준비하고 있어요.') }}
        </h2>
        <p v-if="question" class="mt-2 text-xs text-app-muted">{{ question.answerCount }}명이 영화를 추천했어요.</p>
      </div>
    </div>

    <div v-if="question" class="mt-4 border-t border-app-line pt-3">
      <MovieSearchInput
        allow-custom
        label="이 상황에 추천할 영화"
        placeholder="영화 제목을 입력하세요"
        @custom="selectCustomMovie"
        @select="selectMovie"
      />

      <div v-if="selectedMovie" class="corner-soft mt-3 flex items-center gap-3 border border-app-line bg-app-panelSoft p-2.5">
        <img
          :src="selectedMovie.posterPath ?? '/app-icon.svg'"
          :alt="`${selectedMovie.title} 포스터`"
          class="h-12 w-8 shrink-0 border border-app-line object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-[#15171c]">{{ selectedMovie.title }}</p>
          <p v-if="selectedMovie.releaseYear" class="mt-0.5 text-xs text-app-muted">{{ selectedMovie.releaseYear }}</p>
        </div>
        <button
          type="button"
          class="focus-ring corner-pill grid size-8 shrink-0 place-items-center border border-app-line text-lg leading-none text-app-muted"
          :aria-label="`${selectedMovie.title} 선택 취소`"
          @click="selectedMovie = null"
        >
          ×
        </button>
      </div>

      <div class="mt-3 flex gap-2">
        <label class="sr-only" for="daily-answer">추천 이유</label>
        <input
          id="daily-answer"
          v-model="answer"
          maxlength="500"
          class="focus-ring corner-pill min-w-0 flex-1 border border-app-line bg-app-panelSoft px-4 text-sm text-[#15171c] placeholder:text-app-muted"
          placeholder="추천 이유 (선택)"
          @keyup.enter="submit"
        />
        <button
          type="button"
          class="focus-ring corner-pill shrink-0 border border-app-accent bg-app-accent px-4 text-sm font-bold text-white disabled:opacity-50"
          :disabled="!selectedMovie || submitting"
          @click="submit"
        >
          {{ question.viewerAnswer ? '수정' : '등록' }}
        </button>
      </div>
    </div>
  </section>
</template>
