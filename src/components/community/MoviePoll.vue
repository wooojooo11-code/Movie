<script setup lang="ts">
import { computed, ref } from 'vue';

import type { CommunityPoll } from '@/types/poll';

const props = defineProps<{ poll: CommunityPoll; disabled?: boolean }>();
const emit = defineEmits<{ vote: [optionId: string]; clear: [] }>();
const submitting = ref(false);
const totalVotes = computed(() => props.poll.options.reduce((sum, option) => sum + option.voteCount, 0));

const vote = async (optionId: string) => {
  if (props.disabled || submitting.value) return;
  submitting.value = true;
  emit('vote', optionId);
  window.setTimeout(() => { submitting.value = false; }, 250);
};
</script>

<template>
  <section class="corner-soft border border-app-line bg-app-panelSoft p-3" aria-label="영화 투표">
    <p class="text-xs font-semibold text-[#174a77]">영화 투표</p>
    <h3 class="mt-1 text-sm font-semibold text-[#15171c]">{{ poll.question }}</h3>
    <div class="mt-3 grid gap-2">
      <button
        v-for="option in poll.options"
        :key="option.id"
        type="button"
        class="focus-ring corner-soft relative overflow-hidden border border-app-line bg-app-panel px-3 py-2.5 text-left active:scale-[0.99]"
        :class="poll.viewerOptionId === option.id ? 'border-app-accent' : ''"
        :disabled="disabled || submitting"
        @click="vote(option.id)"
      >
        <span class="absolute inset-y-0 left-0 bg-[#dcecff] transition-[width]" :style="{ width: `${totalVotes ? Math.round((option.voteCount / totalVotes) * 100) : 0}%` }" />
        <span class="relative flex items-center justify-between gap-3">
          <span class="min-w-0 text-xs font-semibold text-[#15171c]">{{ option.optionText }}</span>
          <span class="shrink-0 text-xs text-app-muted">{{ option.voteCount }}표 · {{ totalVotes ? Math.round((option.voteCount / totalVotes) * 100) : 0 }}%</span>
        </span>
      </button>
    </div>
    <button v-if="poll.viewerOptionId" type="button" class="focus-ring mt-3 text-xs font-medium text-[#174a77] underline" :disabled="disabled" @click="$emit('clear')">투표 취소</button>
  </section>
</template>
