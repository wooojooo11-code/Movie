<script setup lang="ts">
import { computed, ref } from 'vue';

import { useLibraryStore } from '@/services/libraryStore';

const props = withDefaults(
  defineProps<{
    movieId: string;
    size?: 'sm' | 'md';
    fullWidth?: boolean;
  }>(),
  {
    size: 'sm',
    fullWidth: false
  }
);

const libraryStore = useLibraryStore();
const isSubmitting = ref(false);

const isSaved = computed(() => libraryStore.savedMovieIds.value.includes(props.movieId));
const sizeClassName = computed(() =>
  props.size === 'md'
    ? 'min-h-9 px-3 text-sm font-medium'
    : 'min-h-8 px-2 text-[11px] font-medium'
);

const toggle = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await libraryStore.toggleMovie(props.movieId);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <button
    type="button"
    class="focus-ring corner-soft inline-flex items-center justify-center border transition"
    :class="[
      props.fullWidth ? 'w-full' : '',
      sizeClassName,
      isSaved
        ? 'border-app-accent bg-app-accent text-white'
        : 'border-app-line bg-app-panelSoft text-[#15171c]'
    ]"
    :disabled="isSubmitting"
    @click="toggle"
  >
    {{
      isSubmitting
        ? '저장 중'
        : isSaved
          ? '보관 중'
          : '보고싶어요'
    }}
  </button>
</template>
