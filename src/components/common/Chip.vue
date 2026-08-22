<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean;
    as?: 'button' | 'span';
    label: string;
  }>(),
  {
    active: false,
    as: 'span'
  }
);

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <component
    :is="props.as"
    class="chip"
    :class="props.active ? 'border-app-accent bg-app-accent text-white' : 'border-app-line bg-app-panelSoft text-app-muted'"
    @click="props.as === 'button' && emit('click')"
  >
    {{ props.label }}
  </component>
</template>
