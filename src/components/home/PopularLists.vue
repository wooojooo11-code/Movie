<script setup lang="ts">
import PopularListCard from '@/components/home/PopularListCard.vue';
import type { PopularList } from '@/types/home';

defineProps<{
  lists: PopularList[];
}>();
</script>

<template>
  <section id="lists" aria-labelledby="popular-lists-title">
    <div class="mb-4 flex items-end justify-between gap-4">
      <h2 id="popular-lists-title" class="text-lg font-extrabold text-white">인기 리스트</h2>
    </div>

    <div class="grid gap-3">
      <PopularListCard v-for="list in lists" :key="list.id" :list="list" />
    </div>
  </section>
</template>
