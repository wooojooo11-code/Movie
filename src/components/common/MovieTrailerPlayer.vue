<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { getYouTubeEmbedUrl, loadMovieTrailer } from '@/services/movieTrailer';
import type { CatalogMovie } from '@/types/recommendation';

type TrailerMovie = Pick<CatalogMovie, 'id' | 'title' | 'tmdbMovieId' | 'trailer'>;

const props = defineProps<{
  movie: TrailerMovie;
}>();

const isLoading = ref(false);
const failed = ref(false);
const videoKey = ref<null | string>(null);
const videoName = ref<null | string>(null);

const embedUrl = computed(() => (videoKey.value ? getYouTubeEmbedUrl(videoKey.value) : null));

const load = async () => {
  if (videoKey.value || isLoading.value) {
    return;
  }

  isLoading.value = true;
  failed.value = false;

  try {
    const trailer = await loadMovieTrailer(props.movie.tmdbMovieId, props.movie.trailer);
    videoKey.value = trailer.key;
    videoName.value = trailer.name;
  } catch {
    failed.value = true;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.movie.id,
  () => {
    videoKey.value = null;
    videoName.value = null;
    failed.value = false;
    void load();
  },
  { immediate: true }
);
</script>

<template>
  <section class="overflow-hidden rounded-2xl bg-[#101722]" :aria-label="`${props.movie.title} 예고편`">
    <div class="aspect-video">
      <div v-if="isLoading" class="grid h-full place-items-center text-sm text-slate-200">예고편을 불러오는 중…</div>
      <iframe
        v-else-if="embedUrl"
        :src="embedUrl"
        :title="`${props.movie.title} 예고편${videoName ? ` - ${videoName}` : ''}`"
        class="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <div v-else class="grid h-full place-items-center px-6 text-center text-sm leading-6 text-slate-200">
        {{ failed ? '예고편 정보가 없습니다.' : '예고편을 준비하고 있어요.' }}
      </div>
    </div>
  </section>
</template>
