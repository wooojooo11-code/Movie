<script setup lang="ts">
const props = defineProps<{
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
  <section aria-label="취향분석 진행률" class="border border-app-line bg-app-panel p-4">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium text-white">
        {{ stageLabel ?? '취향분석 진행' }}
      </span>
      <span class="text-sm font-medium text-app-accent">{{ current }} / {{ total }}</span>
    </div>

    <div class="h-2 bg-app-panelSoft">
      <div class="h-full bg-app-accent transition-all" :style="{ width: `${progressPercent()}%` }" />
    </div>
  </section>
</template>
