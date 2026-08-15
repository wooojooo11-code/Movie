<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import TitleProgressCard from '@/components/profile/TitleProgressCard.vue';
import { useTitles } from '@/composables/useTitles';
import { filterBingoProfileTitles } from '@/services/profileTitleVisibility';
import { saveTitlePresentation } from '@/services/titleService';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const { errorMessage, loadTitles, loading, titles } = useTitles();
const saveError = ref('');
const saving = ref(false);
const userId = computed(() => (typeof route.params.userId === 'string' ? route.params.userId : ''));
const isOwner = computed(() => authStore.user?.id === userId.value);
const profileTitles = computed(() => filterBingoProfileTitles(titles.value));

const load = () => userId.value && loadTitles(userId.value);

const save = async (featuredTitleId: null | string, displayTitleIds: readonly string[]) => {
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

const setFeatured = (titleId: string) => {
  void save(titleId, profileTitles.value.filter((title) => title.isDisplayed).map((title) => title.id));
};

const toggleDisplayed = (titleId: string) => {
  const current = profileTitles.value.filter((title) => title.isDisplayed).map((title) => title.id);
  const next = current.includes(titleId) ? current.filter((id) => id !== titleId) : [...current, titleId];
  if (next.length > 3) {
    saveError.value = '프로필에 전시할 칭호는 최대 3개입니다.';
    return;
  }
  void save(titles.value.find((title) => title.isFeatured)?.id ?? null, next);
};

watch(userId, load);
onMounted(load);
</script>

<template>
  <main class="mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:max-w-[800px]">
    <RouterLink :to="`/profile/${userId}`" class="focus-ring corner-soft inline-flex min-h-9 items-center border border-app-line bg-app-panelSoft px-3 text-sm font-semibold text-[#34465b]">← 프로필로 돌아가기</RouterLink>
    <section class="mt-5">
      <p class="text-xs font-semibold tracking-[0.12em] text-app-accent">TITLE COLLECTION</p>
      <h1 class="mt-1 text-2xl font-bold text-[#15171c]">칭호 보관함</h1>
      <p class="mt-2 text-sm leading-relaxed text-app-muted">획득한 칭호와 앞으로의 진행도를 확인하세요.</p>
    </section>
    <p v-if="errorMessage || saveError" class="corner-soft mt-5 border border-[#d9a7a7] bg-[#fff6f6] p-3 text-sm text-[#a13c3c]">{{ errorMessage || saveError }}</p>
    <div v-if="loading" class="mt-5 space-y-3" aria-live="polite">
      <div v-for="index in 4" :key="index" class="corner-soft h-40 animate-pulse border border-app-line bg-app-panelSoft" />
    </div>
    <div v-else-if="profileTitles.length" class="mt-5 space-y-3">
      <TitleProgressCard
        v-for="title in profileTitles"
        :key="title.id"
        :title="title"
        :is-owner="isOwner"
        @set-featured="setFeatured"
        @toggle-displayed="toggleDisplayed"
      />
    </div>
    <section v-else class="corner-hard mt-5 border border-app-line bg-app-panel p-5 text-center">
      <p class="text-sm text-app-muted">칭호 정보를 아직 불러오지 못했습니다.</p>
      <button type="button" class="focus-ring corner-soft mt-3 min-h-10 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white" :disabled="saving" @click="load">다시 시도</button>
    </section>
  </main>
</template>
