<script setup lang="ts">
const props = defineProps<{
  current: number;
  total: number;
  stageLabel?: string;
  detailCurrent?: number;
  detailTotal?: number;
}>();

const progressPercent = () => Math.min(100, Math.round((props.current / props.total) * 100));
</script>

<template>
  <section aria-label="취향분석 진행률" class="rounded-[20px] border border-app-line bg-app-panel p-4">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-bold text-white">{{ stageLabel ?? '취향분석 진행' }}</span>
      <span class="text-sm font-bold text-app-accent">{{ current }} / {{ total }}</span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-white/10">
      <div class="app-gradient h-full rounded-full transition-all" :style="{ width: `${progressPercent()}%` }"></div>
    </div>
    <div
      v-if="detailTotal"
      class="mt-3 flex items-center justify-between text-xs font-bold text-app-muted"
    >
      <span>재밌음 상세 취향분석</span>
      <span>{{ detailCurrent ?? 0 }} / {{ detailTotal }}</span>
    </div>
  </section>
</template>
