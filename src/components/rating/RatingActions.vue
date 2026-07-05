<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import type { RatingDecision } from '@/types/rating';

const emit = defineEmits<{
  decide: [decision: RatingDecision | 'not_interested'];
}>();

const actionButtons = [
  {
    decision: 'like' as const,
    arrow: '↑',
    shortcut: 'ArrowUp',
    label: '관심있음',
    className: 'border border-app-accent bg-app-accent text-white'
  },
  {
    decision: 'dislike' as const,
    arrow: '←',
    shortcut: 'ArrowLeft',
    label: '재미없음',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'like' as const,
    arrow: '→',
    shortcut: 'ArrowRight',
    label: '재밌음',
    className: 'border border-app-accent bg-app-accent text-white'
  },
  {
    decision: 'not_interested' as const,
    arrow: '↓',
    shortcut: 'ArrowDown',
    label: '관심없음',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'not_seen' as const,
    arrow: 'Enter',
    shortcut: 'Enter',
    label: '안 봄',
    description: '아직 안 본 작품이면 건너뛰어요.',
    className: 'border border-app-line bg-app-panel text-[#15171c]'
  }
];

const keyboardDecisionByKey = {
  ArrowDown: 'not_interested',
  ArrowLeft: 'dislike',
  ArrowRight: 'like',
  ArrowUp: 'like',
  Enter: 'not_seen'
} as const satisfies Record<string, RatingDecision | 'not_interested'>;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

const handleKeyboardDecision = (event: KeyboardEvent) => {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isEditableTarget(event.target)
  ) {
    return;
  }

  const decision = keyboardDecisionByKey[event.key as keyof typeof keyboardDecisionByKey];

  if (!decision) {
    return;
  }

  event.preventDefault();
  emit('decide', decision);
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyboardDecision);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyboardDecision);
  }
});
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <div />
    <button
      type="button"
      :aria-label="actionButtons[0].label"
      :aria-keyshortcuts="actionButtons[0].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[0].className"
      @click="emit('decide', actionButtons[0].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[0].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[0].label }}</span>
    </button>
    <div />

    <button
      type="button"
      :aria-label="actionButtons[1].label"
      :aria-keyshortcuts="actionButtons[1].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[1].className"
      @click="emit('decide', actionButtons[1].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[1].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[1].label }}</span>
    </button>

    <button
      type="button"
      :aria-label="actionButtons[4].label"
      :aria-keyshortcuts="actionButtons[4].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center px-2 text-center"
      :class="actionButtons[4].className"
      @click="emit('decide', actionButtons[4].decision)"
    >
      <span class="corner-pill border border-app-line bg-app-panelSoft px-2.5 py-1 text-[10px] font-semibold leading-none text-[#15171c]">
        {{ actionButtons[4].arrow }}
      </span>
      <span class="mt-2 text-[11px] font-semibold text-inherit">{{ actionButtons[4].label }}</span>
      <span class="mt-1 text-[10px] leading-4 text-app-muted">{{ actionButtons[4].description }}</span>
    </button>

    <button
      type="button"
      :aria-label="actionButtons[2].label"
      :aria-keyshortcuts="actionButtons[2].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[2].className"
      @click="emit('decide', actionButtons[2].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[2].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[2].label }}</span>
    </button>

    <div />
    <button
      type="button"
      :aria-label="actionButtons[3].label"
      :aria-keyshortcuts="actionButtons[3].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center"
      :class="actionButtons[3].className"
      @click="emit('decide', actionButtons[3].decision)"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[3].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[3].label }}</span>
    </button>
    <div />
  </div>
</template>
