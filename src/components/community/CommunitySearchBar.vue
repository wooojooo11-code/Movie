<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <label class="block">
    <span class="sr-only">게시글 검색</span>
    <input
      :value="modelValue"
      type="search"
      placeholder="제목, 내용, 영화, 작성자 검색"
      class="focus-ring corner-soft h-11 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c] placeholder:text-app-muted"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
