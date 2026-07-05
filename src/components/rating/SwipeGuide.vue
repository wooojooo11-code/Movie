<script setup lang="ts">
const guides = [
  { arrow: '↑', label: '관심있음' },
  { arrow: '←', label: '재미없음' },
  { arrow: '→', label: '재밌음' },
  { arrow: '↓', label: '관심없음' },
  { arrow: 'Enter', label: '안 봄', description: '아직 안 본 작품이면 건너뛰어요.' }
];
</script>

<template>
  <section aria-label="스와이프 안내" class="grid grid-cols-2 gap-2 sm:grid-cols-5">
    <div
      v-for="guide in guides"
      :key="guide.arrow"
      class="corner-hard border border-app-line bg-white/5 px-3 py-3 text-center"
    >
      <p class="text-2xl font-black leading-none text-white">{{ guide.arrow }}</p>
      <p class="mt-2 text-xs font-bold text-app-muted">{{ guide.label }}</p>
      <p v-if="guide.description" class="mt-1 text-[10px] leading-4 text-app-muted">
        {{ guide.description }}
      </p>
    </div>
  </section>
</template>
