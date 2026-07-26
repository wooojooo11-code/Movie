<script setup lang="ts">
import { computed, ref } from 'vue';

import MovieSearchInput from '@/components/community/MovieSearchInput.vue';
import type { CommunityMovieReference } from '@/types/community';
import type { RecommendationRelay as RecommendationRelayItem } from '@/types/relay';

const props = defineProps<{ relays: RecommendationRelayItem[]; isAuthenticated: boolean; submitting?: boolean }>();
const emit = defineEmits<{ add: [payload: { parentRelayId: null | string; movie: CommunityMovieReference; reason: string }]; login: [] }>();
const selectedMovie = ref<CommunityMovieReference | null>(null);
const parentRelayId = ref<null | string>(null);
const reason = ref('');

const depthById = computed(() => {
  const parentMap = new Map(props.relays.map((relay) => [relay.id, relay.parentRelayId]));
  return new Map(props.relays.map((relay) => {
    let depth = 0; let parentId = relay.parentRelayId; const visited = new Set<string>();
    while (parentId && !visited.has(parentId)) { visited.add(parentId); depth += 1; parentId = parentMap.get(parentId) ?? null; }
    return [relay.id, Math.min(depth, 3)];
  }));
});

const submit = () => {
  if (!props.isAuthenticated) { emit('login'); return; }
  if (!selectedMovie.value || props.submitting) return;
  emit('add', { parentRelayId: parentRelayId.value, movie: selectedMovie.value, reason: reason.value });
  selectedMovie.value = null; parentRelayId.value = null; reason.value = '';
};
</script>

<template>
  <section class="corner-soft border border-app-line bg-app-panel p-4" aria-labelledby="relay-title">
    <p class="text-xs font-semibold text-app-accent">RECOMMENDATION RELAY</p>
    <h2 id="relay-title" class="mt-1 text-base font-semibold text-[#15171c]">다음 영화 추천</h2>
    <p class="mt-1 text-xs leading-4 text-app-muted">이어 보고 싶은 영화와 짧은 이유를 추천해 주세요.</p>
    <div class="mt-4 grid gap-3">
      <article v-for="relay in relays" :key="relay.id" class="corner-soft border border-app-line bg-app-panelSoft p-3" :style="{ marginLeft: `${(depthById.get(relay.id) ?? 0) * 16}px` }">
        <div class="flex gap-3"><RouterLink :to="`/movies/${relay.movie.id}`" class="focus-ring shrink-0"><img :src="relay.movie.posterPath ?? '/app-icon.svg'" :alt="`${relay.movie.title} 포스터`" class="h-16 w-11 border border-app-line object-cover" /></RouterLink><div class="min-w-0"><RouterLink :to="`/movies/${relay.movie.id}`" class="focus-ring block truncate text-sm font-semibold text-[#174a77]">{{ relay.movie.title }}</RouterLink><p v-if="relay.reason" class="mt-1 text-xs leading-4 text-app-muted">{{ relay.reason }}</p><p class="mt-2 text-[11px] text-app-muted">{{ relay.author.nickname }}의 추천</p></div></div>
      </article>
      <p v-if="!relays.length" class="text-sm text-app-muted">첫 번째 다음 영화를 추천해 보세요.</p>
    </div>
    <form class="mt-4 grid gap-3 border-t border-app-line pt-4" @submit.prevent="submit">
      <MovieSearchInput @select="selectedMovie = $event" />
      <p v-if="selectedMovie" class="text-xs font-semibold text-[#174a77]">선택한 영화: {{ selectedMovie.title }}</p>
      <label><span class="mb-1 block text-xs font-semibold text-app-muted">어떤 추천 뒤에 이어 볼까요?</span><select v-model="parentRelayId" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]"><option :value="null">원 게시글의 영화 다음</option><option v-for="relay in relays" :key="relay.id" :value="relay.id">{{ relay.movie.title }} 다음</option></select></label>
      <label><span class="mb-1 block text-xs font-semibold text-app-muted">추천 이유</span><input v-model="reason" maxlength="300" class="focus-ring corner-soft h-10 w-full border border-app-line bg-app-panel px-3 text-sm text-[#15171c]" placeholder="짧은 이유를 적어주세요" /></label>
      <button type="submit" class="focus-ring corner-soft min-h-10 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:opacity-50" :disabled="!selectedMovie || submitting">다음 영화 추천</button>
    </form>
  </section>
</template>
