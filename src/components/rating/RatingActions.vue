<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';

import type { RatingDecision, RatingDirection, RatingSelection } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    activeDirection?: null | RatingDirection;
    selectedButtonClassName?: string;
    selectedDescriptionClassName?: string;
    selectedEnterBadgeClassName?: string;
  }>(),
  {
    activeDirection: null,
    selectedButtonClassName: 'border-[#15171c] bg-[#15171c] text-[#ffffff]',
    selectedDescriptionClassName: 'text-[#d9dde3]',
    selectedEnterBadgeClassName: 'border border-[#15171c] bg-[#15171c] text-[#ffffff]'
  }
);

const emit = defineEmits<{
  decide: [selection: RatingSelection];
}>();

type ActionButton = {
  arrow: string;
  className: string;
  decision: RatingDecision | 'not_interested';
  description?: string;
  direction: RatingDirection;
  label: string;
  shortcut: string;
};

const actionButtons: ActionButton[] = [
  {
    decision: 'like' as const,
    direction: 'up' as const,
    arrow: '↑',
    shortcut: 'ArrowUp',
    label: '관심있음',
    className: 'border border-app-accent bg-app-accent text-white'
  },
  {
    decision: 'dislike' as const,
    direction: 'left' as const,
    arrow: '←',
    shortcut: 'ArrowLeft',
    label: '별로였음',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'like' as const,
    direction: 'right' as const,
    arrow: '→',
    shortcut: 'ArrowRight',
    label: '재밌음',
    className: 'border border-app-accent bg-app-accent text-white'
  },
  {
    decision: 'not_interested' as const,
    direction: 'down' as const,
    arrow: '↓',
    shortcut: 'ArrowDown',
    label: '관심없음',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'not_seen' as const,
    direction: 'enter' as const,
    arrow: 'Enter',
    shortcut: 'Enter',
    label: '안 봄',
    description: '아직 안 본 작품이면 건너뛰어요.',
    className: 'border border-app-line bg-app-panel text-[#15171c]'
  }
];

const defaultEnterBadgeClassName = 'border border-app-line bg-app-panelSoft text-[#15171c]';

const keyboardSelectionByKey = {
  ArrowDown: { decision: 'not_interested', direction: 'down' },
  ArrowLeft: { decision: 'dislike', direction: 'left' },
  ArrowRight: { decision: 'like', direction: 'right' },
  ArrowUp: { decision: 'like', direction: 'up' },
  Enter: { decision: 'not_seen', direction: 'enter' }
} as const satisfies Record<string, RatingSelection>;

const activeDirection = computed(() => props.activeDirection ?? null);

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

const isActiveDirection = (direction: RatingDirection) => activeDirection.value === direction;

const getButtonClassName = (button: ActionButton) =>
  isActiveDirection(button.direction) ? props.selectedButtonClassName : button.className;

const getEnterBadgeClassName = (button: ActionButton) =>
  isActiveDirection(button.direction) ? props.selectedEnterBadgeClassName : defaultEnterBadgeClassName;

const getDescriptionClassName = (button: ActionButton) =>
  isActiveDirection(button.direction) ? props.selectedDescriptionClassName : 'text-app-muted';

const emitSelection = (button: ActionButton) =>
  emit('decide', {
    decision: button.decision,
    direction: button.direction
  });

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

  const selection = keyboardSelectionByKey[event.key as keyof typeof keyboardSelectionByKey];

  if (!selection) {
    return;
  }

  event.preventDefault();
  emit('decide', selection);
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
      :class="getButtonClassName(actionButtons[0])"
      @click="emitSelection(actionButtons[0])"
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
      :class="getButtonClassName(actionButtons[1])"
      @click="emitSelection(actionButtons[1])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[1].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[1].label }}</span>
    </button>

    <button
      type="button"
      :aria-label="actionButtons[4].label"
      :aria-keyshortcuts="actionButtons[4].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center px-2 text-center"
      :class="getButtonClassName(actionButtons[4])"
      @click="emitSelection(actionButtons[4])"
    >
      <span
        class="corner-pill px-2.5 py-1 text-[10px] font-semibold leading-none"
        :class="getEnterBadgeClassName(actionButtons[4])"
      >
        {{ actionButtons[4].arrow }}
      </span>
      <span class="mt-2 text-[11px] font-semibold text-inherit">{{ actionButtons[4].label }}</span>
      <span class="mt-1 text-[10px] leading-4" :class="getDescriptionClassName(actionButtons[4])">
        {{ actionButtons[4].description }}
      </span>
    </button>

    <button
      type="button"
      :aria-label="actionButtons[2].label"
      :aria-keyshortcuts="actionButtons[2].shortcut"
      class="focus-ring corner-soft flex min-h-[72px] flex-col items-center justify-center"
      :class="getButtonClassName(actionButtons[2])"
      @click="emitSelection(actionButtons[2])"
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
      :class="getButtonClassName(actionButtons[3])"
      @click="emitSelection(actionButtons[3])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[3].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[3].label }}</span>
    </button>
    <div />
  </div>
</template>
