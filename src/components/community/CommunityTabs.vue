<script setup lang="ts">
import { COMMUNITY_TABS, type CommunityTab } from '@/types/community';

defineProps<{ modelValue: CommunityTab }>();
defineEmits<{ 'update:modelValue': [value: CommunityTab] }>();
</script>

<template>
  <div class="scrollbar-hide flex gap-5 overflow-x-auto border-b border-app-line" role="tablist" aria-label="커뮤니티 주제">
    <button
      v-for="tab in COMMUNITY_TABS"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      class="focus-ring shrink-0 border-b-2 px-0.5 py-3 text-sm font-semibold transition-colors"
      :class="modelValue === tab.id ? 'border-[#15171c] text-[#15171c]' : 'border-transparent text-app-muted hover:text-[#15171c]'"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
