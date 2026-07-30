<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ProfileEditModal from '@/components/profile/ProfileEditModal.vue';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';
import MovieTasteCard from '@/components/profile/MovieTasteCard.vue';
import TitleCollectionModal from '@/components/profile/TitleCollectionModal.vue';
import { useProfile } from '@/composables/useProfile';
import { useTitles } from '@/composables/useTitles';
import { movieCreditsById } from '@/data/movieCredits';
import { ensureProfile, saveProfile } from '@/services/profileService';
import { saveTitlePresentation } from '@/services/titleService';
import { useRecommendationStore } from '@/services/recommendationStore';
import { useAuthStore } from '@/stores/auth';
import type { ProfileEditInput, ProfileTaste, ProfileTastePerson } from '@/types/profile';

const route = useRoute();
const authStore = useAuthStore();
const recommendationStore = useRecommendationStore();
const { errorMessage, loadProfile, loading, profile } = useProfile();
const {
  errorMessage: titlesError,
  loadTitles,
  loading: titlesLoading,
  titles
} = useTitles();
const editOpen = ref(false);
const titleCollectionOpen = ref(false);
const saving = ref(false);
const saveError = ref('');

const userId = computed(() => (typeof route.params.userId === 'string' ? route.params.userId : ''));
const isOwner = computed(() => Boolean(authStore.user?.id && authStore.user.id === userId.value));
const loadingPage = computed(() => loading.value || titlesLoading.value);
const visibleTitles = computed(() => profile.value?.displayTitles ?? []);

const getLocalFavoritePerson = (kind: 'actor' | 'director'): null | ProfileTastePerson => {
  const counts = new Map<string, number>();

  for (const { movie, ratingRecord } of recommendationStore.ratedMoviesHistory.value) {
    if (ratingRecord.input.status !== 'like' && ratingRecord.input.status !== 'dislike') continue;

    const credits = movieCreditsById[movie.id];
    const people = kind === 'director' ? [credits?.director] : credits?.cast ?? [];
    for (const person of new Set(people.filter((value): value is string => Boolean(value?.trim())))) {
      counts.set(person, (counts.get(person) ?? 0) + 1);
    }
  }

  const [person, count] = [...counts.entries()].sort(
    ([leftName, leftCount], [rightName, rightCount]) =>
      rightCount - leftCount || leftName.localeCompare(rightName, 'ko-KR')
  )[0] ?? [];

  return person && count ? { name: person, profileUrl: null, count } : null;
};

const displayedTaste = computed<null | ProfileTaste>(() => {
  const taste = profile.value?.taste;
  if (!taste || !isOwner.value) return taste ?? null;

  return {
    ...taste,
    favoriteDirector: taste.favoriteDirector ?? getLocalFavoritePerson('director'),
    favoriteActor: taste.favoriteActor ?? getLocalFavoritePerson('actor')
  };
});

const load = async () => {
  if (!userId.value) return;
  saveError.value = '';

  if (isOwner.value && authStore.user) {
    try {
      await ensureProfile(
        authStore.user.id,
        authStore.displayName,
        (authStore.user.user_metadata.avatar_url as string | undefined) ?? null
      );
    } catch (error) {
      saveError.value = error instanceof Error ? error.message : '프로필 준비에 실패했습니다.';
    }
  }

  await Promise.all([loadProfile(userId.value), loadTitles(userId.value)]);
};

const updatePresentation = async (featuredTitleId: null | string, displayTitleIds: readonly string[]) => {
  saving.value = true;
  saveError.value = '';
  try {
    await saveTitlePresentation(featuredTitleId, displayTitleIds);
    await load();
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : '칭호 전시 설정을 저장하지 못했습니다.';
  } finally {
    saving.value = false;
  }
};

const saveEdit = async (payload: {
  displayTitleIds: string[];
  featuredTitleId: null | string;
  profile: ProfileEditInput;
}) => {
  if (!authStore.user) return;
  saving.value = true;
  saveError.value = '';
  try {
    await saveProfile(authStore.user.id, payload.profile);
    await saveTitlePresentation(payload.featuredTitleId, payload.displayTitleIds);
    editOpen.value = false;
    await load();
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : '프로필을 저장하지 못했습니다.';
  } finally {
    saving.value = false;
  }
};

const setFeatured = (titleId: string) => {
  const displayedIds = titles.value.filter((title) => title.isDisplayed).map((title) => title.id);
  void updatePresentation(titleId, displayedIds);
};

const toggleDisplayed = (titleId: string) => {
  const currentIds = titles.value.filter((title) => title.isDisplayed).map((title) => title.id);
  const displayIds = currentIds.includes(titleId)
    ? currentIds.filter((id) => id !== titleId)
    : [...currentIds, titleId];
  if (displayIds.length > 3) {
    saveError.value = '프로필에 전시할 칭호는 최대 3개입니다.';
    return;
  }
  const featuredId = titles.value.find((title) => title.isFeatured)?.id ?? null;
  void updatePresentation(featuredId, displayIds);
};

watch(userId, () => { void load(); });
watch(() => authStore.user?.id, () => { void load(); });
onMounted(() => { void load(); });
</script>

<template>
  <main class="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-xl">
    <div v-if="loadingPage" class="space-y-5" aria-live="polite" aria-label="프로필을 불러오는 중">
      <div class="corner-hard h-48 animate-pulse border border-app-line bg-app-panelSoft" />
      <div class="corner-hard h-72 animate-pulse border border-app-line bg-app-panelSoft" />
      <div class="corner-hard h-36 animate-pulse border border-app-line bg-app-panelSoft" />
    </div>

    <section v-else-if="errorMessage" class="corner-hard border border-[#d9a7a7] bg-[#fff6f6] p-5 text-center">
      <h1 class="text-lg font-bold text-[#8b3434]">프로필을 불러오지 못했습니다.</h1>
      <p class="mt-2 text-sm leading-relaxed text-[#a13c3c]">{{ errorMessage }}</p>
      <button type="button" class="focus-ring corner-soft mt-4 min-h-10 border border-[#d9a7a7] bg-white px-4 text-sm font-semibold text-[#8b3434]" @click="load">다시 시도</button>
    </section>

    <section v-else-if="!profile" class="corner-hard border border-app-line bg-app-panel p-6 text-center">
      <h1 class="text-lg font-bold text-[#15171c]">프로필을 찾을 수 없습니다.</h1>
      <p class="mt-2 text-sm text-app-muted">아직 프로필이 만들어지지 않았거나 삭제된 사용자입니다.</p>
    </section>

    <div v-else class="space-y-5">
      <ProfileHeader :overview="profile" :is-owner="isOwner" @edit="editOpen = true" />
      <p v-if="saveError || titlesError" class="corner-soft border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ saveError || titlesError }}</p>
      <MovieTasteCard
        :taste="displayedTaste ?? profile.taste"
        :is-owner="isOwner"
        :titles="visibleTitles"
        @open-titles="titleCollectionOpen = true"
      />
      <RouterLink
        v-if="isOwner"
        to="/history"
        class="focus-ring corner-hard flex items-center justify-between gap-4 border border-app-line bg-app-panel p-5 transition-colors hover:border-app-accent sm:p-6"
      >
        <div>
          <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">RATINGS</p>
          <h2 class="mt-1 text-lg font-bold text-[#15171c]">평가기록</h2>
          <p class="mt-2 text-sm text-app-muted">내가 평가한 영화와 감상 기록을 확인하세요.</p>
        </div>
        <span class="shrink-0 text-sm font-semibold text-app-accent">보기</span>
      </RouterLink>
    </div>

    <ProfileEditModal
      v-if="profile"
      :open="editOpen"
      :profile="profile.profile"
      :titles="titles"
      :saving="saving"
      @close="editOpen = false"
      @save="saveEdit"
    />
    <TitleCollectionModal
      :open="titleCollectionOpen"
      :titles="titles"
      :is-owner="isOwner"
      @close="titleCollectionOpen = false"
      @set-featured="setFeatured"
      @toggle-displayed="toggleDisplayed"
    />
  </main>
</template>
