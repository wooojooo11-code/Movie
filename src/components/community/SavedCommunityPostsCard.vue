<script setup lang="ts">
import type { CommunityPost } from '@/types/community';

defineProps<{
  posts: CommunityPost[];
  totalCount: number;
  isAuthenticated: boolean;
  loading?: boolean;
}>();
</script>

<template>
  <section class="corner-soft border border-app-line bg-app-panel p-4 sm:min-h-[13rem] sm:p-5" aria-labelledby="saved-community-posts-title">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-bold tracking-[0.12em] text-app-accent">SAVED</p>
        <h2 id="saved-community-posts-title" class="mt-1 text-lg font-semibold text-[#15171c]">내가 저장한 글</h2>
      </div>
      <span v-if="isAuthenticated" class="corner-pill border border-[#bed3e8] bg-[#eef6ff] px-2 py-1 text-xs font-bold text-[#174a77]">{{ totalCount }}</span>
    </div>

    <p v-if="!isAuthenticated" class="mt-4 text-sm leading-5 text-app-muted">로그인하면 저장한 글을 여기서 바로 볼 수 있어요.</p>
    <p v-else-if="loading" class="mt-4 text-sm text-app-muted">저장한 글을 불러오는 중…</p>
    <p v-else-if="!posts.length" class="mt-4 text-sm leading-5 text-app-muted">아직 저장한 글이 없어요.</p>

    <div v-else class="mt-4 grid gap-2">
      <RouterLink
        v-for="post in posts"
        :key="post.id"
        :to="`/community/${post.id}`"
        class="focus-ring corner-soft block border border-app-line bg-app-panelSoft px-3 py-2 transition-colors hover:border-app-accent"
      >
        <p class="whitespace-normal break-keep text-base font-semibold leading-5 text-[#15171c]">{{ post.title }}</p>
        <p class="mt-1 text-xs text-app-muted">{{ post.author.nickname }} · 좋아요 {{ post.likeCount }}</p>
      </RouterLink>
    </div>
  </section>
</template>
