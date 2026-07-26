<script setup lang="ts">
import type { MissionProof } from '@/types/community';

defineProps<{ proof: MissionProof }>();
</script>

<template>
  <section class="corner-soft border border-[#bed3e8] bg-[#eef6ff] p-3" aria-label="미션 인증">
    <div class="flex items-start gap-3">
      <span class="corner-pill shrink-0 border border-app-accent px-2 py-1 text-[10px] font-bold tracking-wide text-[#174a77]">{{ proof.badgeLabel }}</span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-[#15171c]">{{ proof.missionName }}</p>
        <p class="mt-1 text-xs text-app-muted">완료일 {{ proof.completedAt }}</p>
      </div>
    </div>
    <RouterLink v-if="proof.movie" :to="`/movies/${proof.movie.id}`" class="focus-ring mt-3 flex items-center gap-2">
      <img :src="proof.movie.posterPath ?? '/app-icon.svg'" :alt="`${proof.movie.title} 포스터`" class="h-14 w-10 border border-app-line object-cover" />
      <span class="text-xs font-semibold text-[#174a77]">{{ proof.movie.title }}</span>
    </RouterLink>
    <p v-if="proof.reflection" class="mt-3 text-sm leading-5 text-app-muted">{{ proof.reflection }}</p>
  </section>
</template>
