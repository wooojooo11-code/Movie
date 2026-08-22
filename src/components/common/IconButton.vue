<script setup lang="ts">
import type { Component } from 'vue';

const props = withDefaults(
  defineProps<{
    active?: boolean;
    disabled?: boolean;
    icon: Component;
    label: string;
    size?: 'md' | 'sm';
    type?: 'button' | 'submit';
    variant?: 'ghost' | 'solid';
  }>(),
  {
    active: false,
    disabled: false,
    size: 'md',
    type: 'button',
    variant: 'ghost'
  }
);
</script>

<template>
  <button
    :type="props.type"
    :aria-label="props.label"
    :title="props.label"
    :disabled="props.disabled"
    class="focus-ring icon-button"
    :class="[
      props.size === 'sm' ? 'size-8' : 'size-10',
      props.variant === 'solid' || props.active
        ? 'border-app-accent bg-app-accent !text-white'
        : 'border-app-line bg-white/90 text-[#173a5e] hover:border-app-accent hover:text-app-accent'
    ]"
  >
    <component :is="props.icon" :size="props.size === 'sm' ? 16 : 18" :stroke-width="1.9" aria-hidden="true" />
  </button>
</template>
