<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{ hasSpoiler: boolean; preview?: boolean }>(), { preview: false });
const revealed = ref(!props.hasSpoiler);
</script>

<template>
  <div class="relative" :class="{ 'overflow-hidden': hasSpoiler }">
    <div :class="hasSpoiler && !revealed ? 'select-none blur-md' : ''" :aria-hidden="hasSpoiler && !revealed">
      <slot />
    </div>
    <div v-if="hasSpoiler && !revealed" class="absolute inset-0 grid place-items-center bg-app-panel/80 p-4 text-center">
      <div>
        <p class="text-xs font-semibold text-[#174a77]">스포일러 포함</p>
        <button type="button" class="focus-ring corner-soft mt-2 border border-app-accent bg-app-panel px-3 py-2 text-xs font-semibold text-[#174a77]" @click="revealed = true">
          스포일러 보기
        </button>
      </div>
    </div>
  </div>
</template>
