<script setup lang="ts">
import { ref, watch } from 'vue';

import type { DailyQuestion } from '@/types/community';

const props = defineProps<{ question: DailyQuestion | null; isAuthenticated: boolean; loading?: boolean }>();
const emit = defineEmits<{ submit: [content: string]; login: []; viewAnswers: [] }>();
const answer = ref('');
const submitting = ref(false);

watch(
  () => props.question?.viewerAnswer?.content,
  (content) => {
    answer.value = content ?? '';
  },
  { immediate: true }
);

const submit = () => {
  if (!props.isAuthenticated) {
    emit('login');
    return;
  }

  if (!answer.value.trim() || submitting.value) {
    return;
  }

  submitting.value = true;
  emit('submit', answer.value);
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
        <p v-if="question" class="mt-2 text-xs text-app-muted">{{ question.answerCount }}명이 답했어요.</p>
      </div>
    </div>

    <div v-if="question" class="mt-4 flex gap-2 border-t border-app-line pt-3">
      <label class="sr-only" for="daily-answer">오늘의 질문 답변</label>
      <input
        id="daily-answer"
        v-model="answer"
        maxlength="500"
        class="focus-ring corner-pill min-w-0 flex-1 border border-app-line bg-app-panelSoft px-4 text-sm text-[#15171c] placeholder:text-app-muted"
        placeholder="내 생각 남기기"
        @keyup.enter="submit"
      />
      <button
        type="button"
        class="focus-ring corner-pill shrink-0 border border-app-accent bg-app-accent px-4 text-sm font-bold text-white disabled:opacity-50"
        :disabled="!answer.trim() || submitting"
        @click="submit"
      >
        {{ question.viewerAnswer ? '수정' : '등록' }}
      </button>
    </div>
  </section>
</template>
