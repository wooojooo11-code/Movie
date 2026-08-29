<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';

import type { RatingDecision, RatingDirection, RatingSelection } from '@/types/rating';

const props = withDefaults(
  defineProps<{
    activeDirection?: null | RatingDirection;
    compact?: boolean;
    layout?: 'cross' | 'keyboard';
    selectedButtonClassName?: string;
    selectedDescriptionClassName?: string;
    selectedEnterBadgeClassName?: string;
  }>(),
  {
    activeDirection: null,
    compact: false,
    layout: 'cross',
    selectedButtonClassName: 'border-[#15171c] bg-[#15171c] !text-white',
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
  contextLabel?: string;
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
    contextLabel: '안 본 영화',
    className: 'border border-app-accent bg-app-accent !text-white'
  },
  {
    decision: 'dislike' as const,
    direction: 'left' as const,
    arrow: '←',
    shortcut: 'ArrowLeft',
    label: '재미없음',
    contextLabel: '본 영화',
    className: 'border border-app-line bg-app-panelSoft text-[#15171c]'
  },
  {
    decision: 'like' as const,
    direction: 'right' as const,
    arrow: '→',
    shortcut: 'ArrowRight',
    label: '재미있음',
    contextLabel: '본 영화',
    className: 'border border-app-accent bg-app-accent !text-white'
  },
  {
    decision: 'not_interested' as const,
    direction: 'down' as const,
    arrow: '↓',
    shortcut: 'ArrowDown',
    label: '관심없음',
    contextLabel: '안 본 영화',
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
const keyboardActionButtons = [
  actionButtons[0],
  actionButtons[1],
  actionButtons[3],
  actionButtons[2],
  actionButtons[4]
];
const keyboardGridClassByDirection: Record<RatingDirection, string> = {
  up: 'col-start-2 row-start-1',
  left: 'col-start-1 row-start-2',
  down: 'col-start-2 row-start-2',
  right: 'col-start-3 row-start-2',
  enter: 'col-start-4 row-span-2 row-start-1'
};

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
  <div
    v-if="props.layout === 'keyboard'"
    class="grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2"
    @click.stop
    @pointercancel.stop
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
  >
    <button
      v-for="button in keyboardActionButtons"
      :key="button.direction"
      type="button"
      :aria-label="button.label"
      :aria-keyshortcuts="button.shortcut"
      class="focus-ring corner-soft flex flex-col items-center justify-center px-1 text-center"
      :class="[
        keyboardGridClassByDirection[button.direction],
        props.compact ? 'min-h-12' : 'min-h-[72px]',
        getButtonClassName(button)
      ]"
      @click="emitSelection(button)"
    >
      <span class="text-[24px] font-bold leading-none">{{ button.arrow }}</span>
      <span class="mt-1 text-[10px] font-semibold leading-4 text-inherit">{{ button.label }}</span>
      <span v-if="button.contextLabel" class="text-[9px] leading-3 text-inherit opacity-75">
        {{ button.contextLabel }}
      </span>
    </button>
  </div>

  <div
    v-else
    class="grid grid-cols-3 gap-2"
    @click.stop
    @pointercancel.stop
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
  >
    <div />
    <button
      type="button"
      :aria-label="actionButtons[0].label"
      :aria-keyshortcuts="actionButtons[0].shortcut"
      class="focus-ring corner-soft flex flex-col items-center justify-center"
      :class="[props.compact ? 'min-h-12' : 'min-h-[72px]', getButtonClassName(actionButtons[0])]"
      @click="emitSelection(actionButtons[0])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[0].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[0].label }}</span>
      <span class="text-[9px] leading-3 text-inherit opacity-75">{{ actionButtons[0].contextLabel }}</span>
    </button>
    <div />

    <button
      type="button"
      :aria-label="actionButtons[1].label"
      :aria-keyshortcuts="actionButtons[1].shortcut"
      class="focus-ring corner-soft flex flex-col items-center justify-center"
      :class="[props.compact ? 'min-h-12' : 'min-h-[72px]', getButtonClassName(actionButtons[1])]"
      @click="emitSelection(actionButtons[1])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[1].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[1].label }}</span>
      <span class="text-[9px] leading-3 text-inherit opacity-75">{{ actionButtons[1].contextLabel }}</span>
    </button>

    <button
      type="button"
      :aria-label="actionButtons[4].label"
      :aria-keyshortcuts="actionButtons[4].shortcut"
      class="focus-ring corner-soft flex flex-col items-center justify-center px-2 text-center"
      :class="[props.compact ? 'min-h-12' : 'min-h-[72px]', getButtonClassName(actionButtons[4])]"
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
      class="focus-ring corner-soft flex flex-col items-center justify-center"
      :class="[props.compact ? 'min-h-12' : 'min-h-[72px]', getButtonClassName(actionButtons[2])]"
      @click="emitSelection(actionButtons[2])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[2].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[2].label }}</span>
      <span class="text-[9px] leading-3 text-inherit opacity-75">{{ actionButtons[2].contextLabel }}</span>
    </button>

    <div />
    <button
      type="button"
      :aria-label="actionButtons[3].label"
      :aria-keyshortcuts="actionButtons[3].shortcut"
      class="focus-ring corner-soft flex flex-col items-center justify-center"
      :class="[props.compact ? 'min-h-12' : 'min-h-[72px]', getButtonClassName(actionButtons[3])]"
      @click="emitSelection(actionButtons[3])"
    >
      <span class="text-[28px] font-bold leading-none">{{ actionButtons[3].arrow }}</span>
      <span class="mt-1 text-[11px] text-inherit">{{ actionButtons[3].label }}</span>
      <span class="text-[9px] leading-3 text-inherit opacity-75">{{ actionButtons[3].contextLabel }}</span>
    </button>
    <div />
  </div>
</template>
