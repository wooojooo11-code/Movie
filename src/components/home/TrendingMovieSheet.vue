<script setup lang="ts">
import { Clapperboard, ExternalLink, Ticket, X } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import IconButton from '@/components/common/IconButton.vue';
import MovieTrailerPlayer from '@/components/common/MovieTrailerPlayer.vue';
import { loadKobisTmdbDetail, type KobisTmdbDetail } from '@/services/kobisTmdbDetail';
import type { TrendingMovie } from '@/types/home';

const bookingPartners = [
  {
    name: 'CGV',
    href: 'https://cgv.co.kr/cnm/movieBook'
  },
  {
    name: '롯데시네마',
    href: 'https://www.lottecinema.co.kr/NLCHS/ticketing'
  }
];

const props = defineProps<{
  movie: TrendingMovie;
}>();

const emit = defineEmits<{
  close: [];
}>();

const detail = ref<null | KobisTmdbDetail>(null);
const isDetailLoading = ref(true);
const isTrailerOpen = ref(false);
const displayedGenres = computed(() => detail.value?.genres.length ? detail.value.genres : props.movie.genres);
const displayedCast = computed(() => detail.value?.cast.length ? detail.value.cast : props.movie.cast);
const hasAudienceCounts = computed(
  () => Number.isFinite(props.movie.dailyAudienceCount) || Number.isFinite(props.movie.cumulativeAudienceCount)
);
const formattedBoxOfficeDate = computed(() => {
  const value = props.movie.boxOfficeDate;

  if (!value || !/^\d{8}$/.test(value)) {
    return null;
  }

  return `${value.slice(0, 4)}. ${value.slice(4, 6)}. ${value.slice(6, 8)}.`;
});
const trailerMovie = computed(() => detail.value ? {
  id: props.movie.id,
  title: props.movie.title,
  tmdbMovieId: detail.value.tmdbMovieId,
  trailer: null
} : null);

const formatAudienceCount = (value: null | number | undefined) =>
  Number.isFinite(value) ? `${new Intl.NumberFormat('ko-KR').format(value as number)}명` : '집계 전';

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

onMounted(async () => {
  window.addEventListener('keydown', closeOnEscape);

  try {
    detail.value = await loadKobisTmdbDetail(props.movie.title, props.movie.releaseYear ?? null);
  } catch {
    detail.value = null;
  } finally {
    isDetailLoading.value = false;
  }
});

onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape));
</script>

<template>
  <div
    class="fixed inset-0 z-40 flex items-end px-4 pb-4 pt-8"
    style="background-color: rgba(0, 0, 0, 0.36)"
    @click.self="emit('close')"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="trending-movie-detail-title"
      class="corner-hard modal-enter mx-auto max-h-full w-full max-w-md overflow-y-auto border border-app-line px-4 py-4 sm:max-w-[800px] sm:p-5"
      style="background-color: rgba(255, 255, 255, 0.96)"
    >
      <div class="flex items-start gap-3">
        <img
          :src="movie.posterUrl"
          :alt="movie.posterAlt"
          class="h-44 w-[7.25rem] shrink-0 object-cover"
          loading="lazy"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-app-accent">박스오피스 {{ movie.rank }}위</p>
              <h3 id="trending-movie-detail-title" class="mt-1 text-xl font-bold leading-snug text-[#15171c]">
                {{ movie.title }}
              </h3>
              <p v-if="movie.rating !== null" class="mt-1 text-sm text-app-muted">평점 {{ movie.rating.toFixed(1) }}</p>
            </div>

            <IconButton :icon="X" label="인기 영화 상세 닫기" @click="emit('close')" />
          </div>

          <dl class="mt-4 grid gap-3 text-sm">
            <div v-if="displayedGenres.length > 0">
              <dt class="text-app-muted">장르</dt>
              <dd class="mt-1 leading-5 text-[#15171c]">
                {{ displayedGenres.join(' · ') }}
              </dd>
            </div>
            <div v-if="displayedCast.length > 0">
              <dt class="text-app-muted">출연진</dt>
              <dd class="mt-1 leading-5 text-[#15171c]">
                {{ displayedCast.join(', ') }}
              </dd>
            </div>
          </dl>

        </div>
      </div>

      <dl v-if="hasAudienceCounts" class="mt-4 grid grid-cols-2 gap-2" aria-label="관객 수 정보">
        <div class="corner-soft bg-[#eef6ff] px-3 py-3 sm:px-4 sm:py-4">
          <dt class="text-xs font-medium text-app-muted">일일 관객수</dt>
          <dd class="mt-1 text-lg font-bold tabular-nums text-[#173a5e] sm:text-xl">
            {{ formatAudienceCount(movie.dailyAudienceCount) }}
          </dd>
        </div>
        <div class="corner-soft bg-[#eef6ff] px-3 py-3 sm:px-4 sm:py-4">
          <dt class="text-xs font-medium text-app-muted">누적 관객수</dt>
          <dd class="mt-1 text-lg font-bold tabular-nums text-[#173a5e] sm:text-xl">
            {{ formatAudienceCount(movie.cumulativeAudienceCount) }}
          </dd>
        </div>
      </dl>
      <div v-else class="corner-soft mt-4 bg-[#eef6ff] px-3 py-3">
        <p class="text-xs font-medium text-app-muted">관객수</p>
        <p class="mt-1 font-semibold text-[#173a5e]">{{ movie.audienceLabel }}</p>
      </div>
      <p class="mt-2 text-[11px] text-app-muted">
        {{ formattedBoxOfficeDate ? `${formattedBoxOfficeDate} 관람 기준 · ` : '' }}{{ movie.sourceLabel }}
      </p>

      <div class="mt-4 border-t border-app-line pt-4">
        <div class="flex items-center gap-2">
          <Ticket :size="18" :stroke-width="1.9" class="text-app-accent" aria-hidden="true" />
          <p class="text-sm font-semibold text-[#15171c]">영화관에서 예매하기</p>
        </div>
        <p class="mt-1 text-xs leading-5 text-app-muted">영화관을 선택하면 해당 예매 화면이 새 창으로 열려요.</p>

        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <a
            v-for="partner in bookingPartners"
            :key="partner.name"
            :href="partner.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${partner.name}에서 ${movie.title} 예매하기`"
            class="button-primary focus-ring corner-soft inline-flex min-h-12 items-center justify-center gap-2 px-4 text-center text-sm font-semibold"
          >
            <span>{{ partner.name }}에서 예매하기</span>
            <ExternalLink :size="16" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div v-if="isDetailLoading" class="mt-4 text-xs text-app-muted">영화 정보를 확인하고 있어요.</div>
      <p v-else-if="detail?.overview" class="mt-4 border-t border-app-line pt-4 text-sm leading-6 text-[#294866]">{{ detail.overview }}</p>

      <div v-if="trailerMovie" class="mt-4 border-t border-app-line pt-4">
        <IconButton :icon="Clapperboard" :active="isTrailerOpen" label="예고편 보기" @click="isTrailerOpen = !isTrailerOpen" />
        <MovieTrailerPlayer v-if="isTrailerOpen" class="mt-3" :movie="trailerMovie" />
      </div>

      <div v-if="movie.similarMovies.length > 0" class="mt-5 border-t border-app-line pt-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-[#15171c]">비슷한 영화</h4>
          <p class="text-[11px] text-app-muted">함께 보기 좋아요.</p>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <article v-for="similarMovie in movie.similarMovies" :key="similarMovie.id" class="min-w-0">
            <img
              :src="similarMovie.posterUrl"
              :alt="similarMovie.posterAlt"
              class="corner-soft aspect-[4/5] w-full border border-app-line object-cover"
              loading="lazy"
            />
            <p class="mt-2 line-clamp-2 text-[12px] leading-4 text-[#15171c]">
              {{ similarMovie.title }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
