<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number | null;
    maxStars?: number;
    size?: 'sm' | 'md';
    showValue?: boolean;
    hint?: string;
    ariaLabelPrefix?: string;
  }>(),
  {
    maxStars: 5,
    size: 'md',
    showValue: true,
    hint: '',
    ariaLabelPrefix: '평점'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const starWrapClass = computed(() => (props.size === 'sm' ? 'h-8 w-6' : 'h-10 w-8'));
const starIconClass = computed(() => (props.size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'));
const valueClass = computed(() =>
  props.size === 'sm'
    ? 'min-w-[2.5rem] text-xs font-bold text-white'
    : 'min-w-[2.75rem] text-sm font-bold text-white'
);
const hintClass = computed(() =>
  props.size === 'sm' ? 'mt-1 text-[11px] text-app-muted' : 'mt-2 text-xs text-app-muted'
);
const displayValue = computed(() => (props.modelValue == null ? '미평가' : props.modelValue.toFixed(1)));

const setStarRating = (rating: number) => {
  emit('update:modelValue', rating);
};

const getStarFillWidth = (starIndex: number) => {
  const relativeScore = (props.modelValue ?? 0) - (starIndex - 1);

  if (relativeScore >= 1) {
    return '100%';
  }

  if (relativeScore >= 0.5) {
    return '50%';
  }

  return '0%';
};
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <div v-for="star in maxStars" :key="star" class="relative" :class="starWrapClass">
          <div class="absolute inset-0 text-white/10">
            <svg viewBox="0 0 24 24" class="fill-current" :class="starIconClass">
              <path
                d="M12 3.75L14.557 8.932L20.276 9.763L16.138 13.798L17.115 19.492L12 16.803L6.885 19.492L7.862 13.798L3.724 9.763L9.443 8.932L12 3.75Z"
              />
            </svg>
          </div>

          <div
            class="absolute inset-0 overflow-hidden text-app-accent"
            :style="{ width: getStarFillWidth(star) }"
          >
            <svg viewBox="0 0 24 24" class="fill-current" :class="starIconClass">
              <path
                d="M12 3.75L14.557 8.932L20.276 9.763L16.138 13.798L17.115 19.492L12 16.803L6.885 19.492L7.862 13.798L3.724 9.763L9.443 8.932L12 3.75Z"
              />
            </svg>
          </div>

          <button
            type="button"
            class="focus-ring absolute inset-y-0 left-0 w-1/2"
            :aria-label="`${ariaLabelPrefix} ${star - 0.5}점 주기`"
            @click="setStarRating(star - 0.5)"
          ></button>
          <button
            type="button"
            class="focus-ring absolute inset-y-0 right-0 w-1/2"
            :aria-label="`${ariaLabelPrefix} ${star}점 주기`"
            @click="setStarRating(star)"
          ></button>
        </div>
      </div>

      <span v-if="showValue" :class="valueClass">{{ displayValue }}</span>
    </div>

    <p v-if="hint" :class="hintClass">{{ hint }}</p>
  </div>
</template>
