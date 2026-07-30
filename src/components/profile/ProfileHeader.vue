<script setup lang="ts">
import ProfileShareButton from '@/components/profile/ProfileShareButton.vue';
import type { ProfileOverview } from '@/types/profile';

defineProps<{
  isOwner: boolean;
  overview: ProfileOverview;
}>();

defineEmits<{ edit: [] }>();
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-5 sm:p-6">
    <div class="flex items-start gap-4">
      <img
        v-if="overview.profile.avatarUrl"
        :src="overview.profile.avatarUrl"
        :alt="`${overview.profile.nickname} 프로필 사진`"
        class="size-20 shrink-0 rounded-full border border-app-line object-cover sm:size-24"
      />
      <div
        v-else
        aria-hidden="true"
        class="grid size-20 shrink-0 place-items-center rounded-full border border-app-line bg-app-panelSoft text-3xl sm:size-24"
      >
        🎬
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="truncate text-xl font-bold text-[#15171c] sm:text-2xl">{{ overview.profile.nickname }}</h1>
          <span
            v-if="overview.featuredTitle?.name"
            class="corner-pill inline-flex max-w-full items-center gap-1 border border-[#9bcda6] bg-[#edf8ef] px-2.5 py-1 text-xs font-bold text-[#24623a]"
          >
            <span aria-hidden="true">{{ overview.featuredTitle.icon }}</span>
            <span class="truncate">{{ overview.featuredTitle.name }}</span>
          </span>
        </div>
        <p v-if="overview.profile.bio" class="mt-2 break-words text-sm leading-relaxed text-app-muted">
          {{ overview.profile.bio }}
        </p>
        <p v-else class="mt-2 text-sm text-app-muted">아직 한줄소개가 없어요.</p>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap gap-2 border-t border-app-line pt-4">
      <ProfileShareButton />
      <button
        v-if="isOwner"
        type="button"
        class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white"
        @click="$emit('edit')"
      >
        프로필 수정
      </button>
    </div>
  </section>
</template>
