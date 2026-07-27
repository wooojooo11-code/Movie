<script setup lang="ts">
import Header from '@/components/home/Header.vue';
import TitleUnlockedModal from '@/components/profile/TitleUnlockedModal.vue';
import { useTitleUnlocks } from '@/services/titleUnlockStore';

const titleUnlocks = useTitleUnlocks();
</script>

<template>
  <div class="min-h-dvh bg-app-surface text-[#15171c]">
    <Header />
    <RouterView />
    <TitleUnlockedModal :title="titleUnlocks.activeTitle.value" @close="titleUnlocks.dismiss" />
  </div>
</template>
