<script setup lang="ts">
import AuthSessionDebugBanner from '@/components/debug/AuthSessionDebugBanner.vue';
import Header from '@/components/home/Header.vue';
</script>

<template>
  <div class="min-h-dvh bg-app-surface text-[#f5f7fb]">
    <Header />
    <AuthSessionDebugBanner />
    <RouterView />
  </div>
</template>
