<script setup lang="ts">
import type { RatingDecision } from '@/types/rating';

defineEmits<{
  decide: [decision: RatingDecision | 'not_interested'];
}>();

const actionButtons = [
  {
    decision: 'not_seen' as const,
    arrow: '↑',
    label: '안 봤어요',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'dislike' as const,
    arrow: '←',
    label: '별로예요',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'like' as const,
    arrow: '→',
    label: '재밌어요',
    className: 'border border-app-accent bg-app-accent text-white'
  },
  {
    decision: 'not_interested' as const,
    arrow: '↓',
    label: '관심 없어요',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  }
];
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <div />
    <button
      type="button"
      :aria-label="actionButtons[0].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[0].className"
      @click="$emit('decide', actionButtons[0].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[0].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[0].label }}</span>
    </button>
    <div />

    <button
      type="button"
      :aria-label="actionButtons[1].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[1].className"
      @click="$emit('decide', actionButtons[1].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[1].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[1].label }}</span>
    </button>

    <div class="flex min-h-[72px] items-center justify-center border border-app-line bg-app-panel px-2 text-center">
      <p class="text-[11px] leading-4 text-app-muted">버튼이나 방향키로 빠르게 넘길 수 있어요.</p>
    </div>

    <button
      type="button"
      :aria-label="actionButtons[2].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[2].className"
      @click="$emit('decide', actionButtons[2].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[2].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[2].label }}</span>
    </button>

    <div />
    <button
      type="button"
      :aria-label="actionButtons[3].label"
      class="focus-ring flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[3].className"
      @click="$emit('decide', actionButtons[3].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[3].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[3].label }}</span>
    </button>
    <div />
  </div>
</template>
