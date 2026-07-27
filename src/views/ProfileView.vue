<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ProfileEditModal from '@/components/profile/ProfileEditModal.vue';
import ProfileHeader from '@/components/profile/ProfileHeader.vue';
import MovieTasteCard from '@/components/profile/MovieTasteCard.vue';
import TitleCollectionModal from '@/components/profile/TitleCollectionModal.vue';
import TitleShowcase from '@/components/profile/TitleShowcase.vue';
import { useProfile } from '@/composables/useProfile';
import { useTitles } from '@/composables/useTitles';
import { ensureProfile, saveProfile } from '@/services/profileService';
import { saveTitlePresentation, syncProfileMovieMetadata } from '@/services/titleService';
import { useRecommendationStore } from '@/services/recommendationStore';
import { useAuthStore } from '@/stores/auth';
import type { ProfileEditInput } from '@/types/profile';

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
      // One background cache pass makes existing rating history available to the public profile RPC too.
      await syncProfileMovieMetadata(recommendationStore.ratedMoviesHistory.value.map(({ movie }) => movie));
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
      <MovieTasteCard :taste="profile.taste" :is-owner="isOwner" />
      <TitleShowcase :titles="visibleTitles" :is-owner="isOwner" @open="titleCollectionOpen = true" />
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
