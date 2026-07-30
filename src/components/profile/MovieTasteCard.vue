<script setup lang="ts">
import FavoritePersonCard from '@/components/profile/FavoritePersonCard.vue';
import GenreTopThree from '@/components/profile/GenreTopThree.vue';
import type { ProfileTaste, ProfileTitle } from '@/types/profile';

defineProps<{
  isOwner: boolean;
  taste: ProfileTaste;
  titles: readonly Pick<ProfileTitle, 'description' | 'icon' | 'id' | 'name'>[];
}>();

defineEmits<{ openTitles: [] }>();
</script>

<template>
  <section class="corner-hard border border-app-line bg-app-panel p-5 sm:p-6" aria-labelledby="movie-taste-title">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">MOVIE TASTE</p>
        <h2 id="movie-taste-title" class="mt-1 text-lg font-bold text-[#15171c]">내 영화 취향</h2>
      </div>
      <p class="corner-pill shrink-0 border border-app-line bg-app-panelSoft px-3 py-1.5 text-sm font-semibold text-[#34465b]">
        총 {{ taste.watchedCount }}편 감상
      </p>
    </div>

    <div class="mt-5 grid gap-5 sm:grid-cols-2">
      <section>
        <h3 class="text-sm font-bold text-[#263649]">선호 장르 TOP 3</h3>
        <div class="mt-3"><GenreTopThree :genres="taste.topGenres" /></div>
      </section>
      <div class="grid gap-3">
        <FavoritePersonCard label="가장 많이 본 감독" :person="taste.favoriteDirector" />
        <FavoritePersonCard label="가장 많이 본 배우" :person="taste.favoriteActor" />
      </div>
    </div>

    <section class="mt-5 border-t border-app-line pt-5" aria-labelledby="profile-title-section-title">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">PROFILE TITLE</p>
          <h3 id="profile-title-section-title" class="mt-1 text-base font-bold text-[#263649]">프로필 칭호</h3>
        </div>
        <button
          type="button"
          class="focus-ring corner-soft min-h-9 border border-app-line bg-app-panelSoft px-3 text-xs font-semibold text-[#34465b]"
          @click="$emit('openTitles')"
        >
          전체 칭호 보기
        </button>
      </div>

      <div v-if="titles.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="title in titles"
          :key="title.id"
          class="corner-pill inline-flex max-w-full items-center gap-1.5 border border-[#ead39a] bg-[#fff9e9] px-3 py-1.5 text-sm font-semibold text-[#6f5515]"
        >
          <span aria-hidden="true">{{ title.icon }}</span>
          <span class="truncate">{{ title.name }}</span>
        </span>
      </div>
      <p v-else class="mt-4 text-sm leading-relaxed text-app-muted">
        영화 활동을 시작하고 첫 번째 칭호를 획득해보세요.
      </p>
    </section>

    <RouterLink
      v-if="isOwner && taste.watchedCount === 0"
      to="/rating"
      class="focus-ring corner-soft mt-5 inline-flex min-h-10 items-center justify-center border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white"
    >
      영화 기록 시작하기
    </RouterLink>
  </section>
</template>
