<script setup lang="ts">
import type { RatingDecision } from '@/types/rating';

defineEmits<{
  decide: [decision: RatingDecision | 'not_interested'];
}>();

const actionButtons = [
  {
    decision: 'not_seen' as const,
    arrow: '↑',
    label: '안 봄',
    className: 'border border-app-line bg-white/5 text-white'
  },
  {
    decision: 'dislike' as const,
    arrow: '←',
    label: '재미없음',
    className: 'border border-app-line bg-white/5 text-white'
  },
  {
    decision: 'like' as const,
    arrow: '→',
    label: '재밌음',
    className: 'app-gradient text-white'
  },
  {
    decision: 'not_interested' as const,
    arrow: '↓',
    label: '관심없음',
    className: 'border border-app-line bg-white/5 text-white'
  }
];
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <div />
    <button
      type="button"
      :aria-label="actionButtons[0].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center rounded-[18px] text-white"
      :class="actionButtons[0].className"
      @click="$emit('decide', actionButtons[0].decision)"
    >
      <span class="text-[28px] font-black leading-none">{{ actionButtons[0].arrow }}</span>
      <span class="mt-1 text-[11px] font-bold text-white/80">{{ actionButtons[0].label }}</span>
    </button>
    <div />

    <button
      type="button"
      :aria-label="actionButtons[1].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center rounded-[18px] text-white"
      :class="actionButtons[1].className"
      @click="$emit('decide', actionButtons[1].decision)"
    >
      <span class="text-[28px] font-black leading-none">{{ actionButtons[1].arrow }}</span>
      <span class="mt-1 text-[11px] font-bold text-white/80">{{ actionButtons[1].label }}</span>
    </button>

    <div class="flex min-h-[72px] items-center justify-center rounded-[18px] border border-app-line bg-white/[0.03] px-2 text-center">
      <p class="text-[11px] font-bold leading-4 text-app-muted">방향키로 빠르게 취향분석</p>
    </div>

    <button
      type="button"
      :aria-label="actionButtons[2].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center rounded-[18px] text-white"
      :class="actionButtons[2].className"
      @click="$emit('decide', actionButtons[2].decision)"
    >
      <span class="text-[28px] font-black leading-none">{{ actionButtons[2].arrow }}</span>
      <span class="mt-1 text-[11px] font-bold text-white/80">{{ actionButtons[2].label }}</span>
    </button>

    <div />
    <button
      type="button"
      :aria-label="actionButtons[3].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center rounded-[18px] text-white"
      :class="actionButtons[3].className"
      @click="$emit('decide', actionButtons[3].decision)"
    >
      <span class="text-[28px] font-black leading-none">{{ actionButtons[3].arrow }}</span>
      <span class="mt-1 text-[11px] font-bold text-white/80">{{ actionButtons[3].label }}</span>
    </button>
    <div />
  </div>
</template>
