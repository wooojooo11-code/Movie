<script setup lang="ts">
import { ref, watch } from 'vue';

import type { DailyQuestion } from '@/types/community';

const props = defineProps<{ question: DailyQuestion | null; isAuthenticated: boolean; loading?: boolean }>();
const emit = defineEmits<{ submit: [content: string]; login: []; viewAnswers: [] }>();
const answer = ref('');
const submitting = ref(false);

watch(() => props.question?.viewerAnswer?.content, (content) => { answer.value = content ?? ''; }, { immediate: true });

const submit = () => {
  if (!props.isAuthenticated) { emit('login'); return; }
  if (!answer.value.trim() || submitting.value) return;
  submitting.value = true;
  emit('submit', answer.value);
  window.setTimeout(() => { submitting.value = false; }, 250);
};
</script>

<template>
  <section class="corner-soft border border-app-accent bg-[#eef6ff] p-4" aria-labelledby="daily-question-title">
    <p class="text-xs font-semibold tracking-[0.12em] text-[#174a77]">TODAY'S QUESTION</p>
    <h2 id="daily-question-title" class="mt-1 text-lg font-semibold text-[#15171c]">{{ question?.question ?? (loading ? '오늘의 질문을 불러오는 중…' : '오늘의 질문이 준비 중이에요.') }}</h2>
    <p v-if="question" class="mt-2 text-xs text-app-muted">{{ question.answerCount }}명이 답했어요.</p>
    <div v-if="question" class="mt-2 flex justify-end">
      <button type="button" class="focus-ring text-xs font-semibold text-[#174a77] underline underline-offset-2" @click="emit('viewAnswers')">답변 보기</button>
    </div>
    <div v-if="question" class="mt-4 flex gap-2">
      <label class="sr-only" for="daily-answer">오늘의 질문 답변</label>
      <input id="daily-answer" v-model="answer" maxlength="500" class="focus-ring corner-soft min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c] placeholder:text-app-muted" placeholder="짧게 내 생각 남기기" @keyup.enter="submit" />
      <button type="button" class="focus-ring corner-soft shrink-0 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:opacity-50" :disabled="!answer.trim() || submitting" @click="submit">{{ question.viewerAnswer ? '수정' : '답하기' }}</button>
    </div>
  </section>
</template>
