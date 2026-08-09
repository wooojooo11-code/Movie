<script setup lang="ts">
defineEmits<{ compose: [] }>();
</script>

<template>
  <section class="flex items-center justify-between gap-4 border-b border-app-line pb-4" aria-labelledby="community-title">
    <div class="min-w-0">
      <p class="text-[11px] font-bold tracking-[0.18em] text-app-accent">MOVIE PEOPLE</p>
      <h1 id="community-title" class="mt-1 text-2xl font-bold tracking-tight text-[#15171c]">커뮤니티</h1>
    </div>
    <button
      type="button"
      class="focus-ring corner-pill inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 border border-app-accent bg-app-accent px-4 text-sm font-bold text-white active:scale-[0.98]"
      @click="$emit('compose')"
    >
      <span aria-hidden="true" class="text-base leading-none">＋</span>
      새 글
    </button>
  </section>
</template>
