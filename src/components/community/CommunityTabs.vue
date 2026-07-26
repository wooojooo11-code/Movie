<script setup lang="ts">
import { COMMUNITY_TABS, type CommunityTab } from '@/types/community';

defineProps<{ modelValue: CommunityTab }>();
defineEmits<{ 'update:modelValue': [value: CommunityTab] }>();
</script>

<template>
  <div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="커뮤니티 주제">
    <button
      v-for="tab in COMMUNITY_TABS"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      class="focus-ring corner-pill shrink-0 border px-3 py-1.5 text-xs font-semibold transition-colors active:scale-[0.98]"
      :class="modelValue === tab.id ? 'border-app-accent bg-[#dcecff] text-[#174a77]' : 'border-app-line bg-app-panel text-app-muted hover:border-app-accent'"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
