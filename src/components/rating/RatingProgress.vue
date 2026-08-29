<script setup lang="ts">
const props = defineProps<{
  compact?: boolean;
  current: number;
  total: number;
  stageLabel?: string;
}>();

const progressPercent = () => {
  if (props.total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((props.current / props.total) * 100));
};
</script>

<template>
  <section
    aria-label="취향분석 진행률"
    class="corner-hard shrink-0 border border-app-line bg-app-panel"
    :class="compact ? 'px-3 py-2.5 sm:px-4 sm:py-3' : 'p-4'"
  >
    <div class="flex items-center justify-between" :class="compact ? 'mb-2' : 'mb-3'">
      <span class="font-medium text-[#15171c]" :class="compact ? 'text-xs sm:text-sm' : 'text-sm'">
        {{ stageLabel ?? '취향분석 진행' }}
      </span>
      <span class="font-medium text-app-accent" :class="compact ? 'text-xs sm:text-sm' : 'text-sm'">
        {{ current }} / {{ total }}
      </span>
    </div>

    <div class="corner-hard bg-app-panelSoft" :class="compact ? 'h-1.5' : 'h-2'">
      <div class="corner-hard h-full bg-app-accent transition-all" :style="{ width: `${progressPercent()}%` }" />
    </div>
  </section>
</template>
