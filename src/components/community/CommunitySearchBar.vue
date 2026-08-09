<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <label class="relative block">
    <span class="sr-only">게시글 검색</span>
    <svg
      class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
    <input
      :value="modelValue"
      type="search"
      placeholder="영화, 제목, 작성자 검색"
      class="focus-ring corner-pill h-11 w-full border border-app-line bg-app-panelSoft py-2 pl-10 pr-4 text-sm text-[#15171c] placeholder:text-app-muted"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
