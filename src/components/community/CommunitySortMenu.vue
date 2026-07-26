<script setup lang="ts">
import { COMMUNITY_SORTS, type CommunitySort } from '@/types/community';

defineProps<{ modelValue: CommunitySort }>();
defineEmits<{ 'update:modelValue': [value: CommunitySort] }>();
</script>

<template>
  <label class="block">
    <span class="sr-only">게시글 정렬</span>
    <select
      :value="modelValue"
      class="focus-ring corner-soft h-11 border border-app-line bg-app-panel px-3 text-sm text-[#15171c]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as CommunitySort)"
    >
      <option v-for="sort in COMMUNITY_SORTS" :key="sort.id" :value="sort.id">{{ sort.label }}</option>
    </select>
  </label>
</template>
