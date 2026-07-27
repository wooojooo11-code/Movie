<script setup lang="ts">
import { computed } from 'vue';

import type { DailyQuestion, DailyQuestionAnswer } from '@/types/community';

const props = defineProps<{
  open: boolean;
  question: DailyQuestion | null;
  answers: DailyQuestionAnswer[];
  loading?: boolean;
  errorMessage?: string;
}>();
const emit = defineEmits<{ close: [] }>();

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const answerCountLabel = computed(() => `${props.answers.length}개의 답변`);
const formatCreatedAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};

const initial = (nickname: string) => nickname.trim().slice(0, 1) || '?';
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center bg-black/40 p-4" role="presentation" @click.self="emit('close')">
    <section class="mx-auto flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-app-panel shadow-xl sm:max-w-xl" role="dialog" aria-modal="true" aria-labelledby="daily-answer-list-title">
      <header class="flex items-start justify-between gap-4 border-b border-app-line px-4 py-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">TODAY'S QUESTION</p>
          <h2 id="daily-answer-list-title" class="mt-1 text-lg font-semibold text-[#15171c]">다른 사람들의 답변</h2>
          <p class="mt-1 text-sm text-app-muted">{{ question?.question }}</p>
        </div>
        <button type="button" class="focus-ring grid size-9 shrink-0 place-items-center rounded-full border border-app-line text-lg leading-none text-app-muted" aria-label="답변 목록 닫기" @click="emit('close')">×</button>
      </header>

      <div class="min-h-0 overflow-y-auto p-4">
        <p v-if="loading" class="py-8 text-center text-sm text-app-muted">답변을 불러오는 중이에요.</p>
        <p v-else-if="errorMessage" class="corner-soft border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage }}</p>
        <p v-else-if="answers.length === 0" class="corner-soft border border-dashed border-app-line p-5 text-center text-sm text-app-muted">아직 다른 사람이 남긴 답변이 없어요.</p>
        <template v-else>
          <p class="mb-3 text-xs text-app-muted">{{ answerCountLabel }} · 최신순</p>
          <ol class="space-y-3">
            <li v-for="answer in answers" :key="answer.id" class="corner-soft border border-app-line bg-app-bg p-3">
              <div class="flex items-start gap-3">
                <img v-if="answer.author.avatarUrl" :src="answer.author.avatarUrl" :alt="`${answer.author.nickname} 프로필`" class="size-8 shrink-0 rounded-full object-cover" />
                <span v-else class="grid size-8 shrink-0 place-items-center rounded-full bg-[#dcecfb] text-xs font-bold text-[#174a77]" aria-hidden="true">{{ initial(answer.author.nickname) }}</span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline justify-between gap-3">
                    <p class="truncate text-sm font-semibold text-[#15171c]">{{ answer.author.nickname }}</p>
                    <time class="shrink-0 text-[11px] text-app-muted" :datetime="answer.createdAt">{{ formatCreatedAt(answer.createdAt) }}</time>
                  </div>
                  <p class="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#30343b]">{{ answer.content }}</p>
                </div>
              </div>
            </li>
          </ol>
        </template>
      </div>
    </section>
  </div>
</template>
