<script setup lang="ts">
import { computed, ref } from 'vue';

import {
  academyAwardMovieIds,
  getAcademyAwardCategories,
  type AcademyAwardCategory
} from '@/data/academyAwards';
import { catalogMovies } from '@/data/catalog';
import { getYouTubeEmbedUrl, loadMovieTrailer } from '@/services/movieTrailer';
import type { CatalogMovie } from '@/types/recommendation';

const props = defineProps<{
  movies: readonly CatalogMovie[];
}>();

type PreviewTab = 'all' | 'apply' | 'results' | 'videos' | 'academy';
type AcademyFilter = 'all' | AcademyAwardCategory;

const tabs: { id: PreviewTab; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'apply', label: '신청' },
  { id: 'results', label: '당첨 결과' },
  { id: 'videos', label: '영상' },
  { id: 'academy', label: '아카데미' }
];

const academyFilters: { id: AcademyFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'bestPicture', label: '최우수 작품상' },
  { id: 'bestDirector', label: '감독상 수상 감독' },
  { id: 'actingWinner', label: '연기상 수상 배우' }
];

const academyCategoryLabels: Record<AcademyAwardCategory, string> = {
  bestPicture: '최우수 작품상',
  bestDirector: '감독상 수상 감독',
  actingWinner: '연기상 수상 배우 출연'
};

const officialSources = [
  {
    name: '롯데시네마',
    detail: '이벤트 · 시사회/무대인사',
    href: 'https://www.lottecinema.co.kr/NLCHS/Event/'
  },
  {
    name: '메가박스',
    detail: '이벤트 · 시사회/무대인사',
    href: 'https://m.megabox.co.kr/event'
  }
] as const;

const activeTab = ref<PreviewTab>('all');
const academyFilter = ref<AcademyFilter>('all');
const isTrailerDialogOpen = ref(false);
const isTrailerLoading = ref(false);
const trailerLoadFailed = ref(false);
const trailerName = ref<null | string>(null);
const trailerYouTubeKey = ref<null | string>(null);
const selectedMovieId = ref<string | null>(null);

const featuredMovies = computed(() => {
  const uniqueMovies = new Map<string, CatalogMovie>();

  [...props.movies, ...catalogMovies].forEach((movie) => {
    if (!uniqueMovies.has(movie.id)) {
      uniqueMovies.set(movie.id, movie);
    }
  });

  return [...uniqueMovies.values()].slice(0, 3);
});

const academyAwardMovies = computed(() => {
  const uniqueMovies = new Map<string, CatalogMovie>();

  [...props.movies, ...catalogMovies].forEach((movie) => {
    if (!uniqueMovies.has(movie.id)) {
      uniqueMovies.set(movie.id, movie);
    }
  });

  return [...uniqueMovies.values()]
    .filter((movie) => getAcademyAwardCategories(movie.id).length > 0)
    .sort((left, right) => right.releaseYear - left.releaseYear || left.title.localeCompare(right.title, 'ko'));
});

const filteredAcademyAwardMovies = computed(() => {
  if (academyFilter.value === 'all') {
    return academyAwardMovies.value;
  }

  const selectedCategory = academyFilter.value;
  return academyAwardMovies.value.filter((movie) => academyAwardMovieIds[selectedCategory].includes(movie.id));
});

const selectedMovie = computed(
  () => featuredMovies.value.find((movie) => movie.id === selectedMovieId.value) ?? featuredMovies.value[0] ?? null
);

const trailerEmbedUrl = computed(() =>
  trailerYouTubeKey.value ? getYouTubeEmbedUrl(trailerYouTubeKey.value) : null
);

const trailerSearchLink = computed(() => {
  if (!selectedMovie.value) {
    return 'https://www.youtube.com';
  }

  const query = `${selectedMovie.value.title} ${selectedMovie.value.releaseYear} 공식 예고편`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
});

const screeningCoverageSearchLink = computed(() => {
  if (!selectedMovie.value) {
    return 'https://www.youtube.com';
  }

  const query = `${selectedMovie.value.title} 언론시사회 VIP 시사회 포토월 무대인사`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
});

const selectMovie = (movieId: string) => {
  selectedMovieId.value = movieId;
  trailerName.value = null;
  trailerYouTubeKey.value = null;
  trailerLoadFailed.value = false;
};

const openTrailer = async () => {
  if (!selectedMovie.value) {
    return;
  }

  isTrailerDialogOpen.value = true;
  trailerLoadFailed.value = false;

  if (trailerYouTubeKey.value || isTrailerLoading.value) {
    return;
  }

  isTrailerLoading.value = true;

  try {
    const trailer = await loadMovieTrailer(selectedMovie.value.tmdbMovieId);
    trailerYouTubeKey.value = trailer.key;
    trailerName.value = trailer.name;
  } catch {
    trailerLoadFailed.value = true;
  } finally {
    isTrailerLoading.value = false;
  }
};

const closeTrailer = () => {
  isTrailerDialogOpen.value = false;
};
</script>

<template>
  <aside class="preview-hub corner-hard border border-app-line bg-app-panel" aria-label="시사회 허브">
    <header class="border-b border-app-line px-4 py-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-accent">Preview hub</p>
          <h2 class="mt-1 text-lg font-semibold text-[#15171c]">시사회 라운지</h2>
          <p class="mt-1 text-xs leading-5 text-app-muted">일정, 당첨 발표, 예고편을 한곳에서 확인하세요.</p>
        </div>
        <span class="corner-pill shrink-0 border border-app-accent bg-white px-2.5 py-1 text-[11px] font-semibold text-app-accent">시사회</span>
      </div>

      <div class="mt-4 grid grid-cols-3 border border-app-line bg-app-panelSoft text-center">
        <div class="px-2 py-2.5">
          <p class="text-sm font-semibold text-[#15171c]">2</p>
          <p class="mt-0.5 text-[10px] text-app-muted">공식 채널</p>
        </div>
        <div class="border-x border-app-line px-2 py-2.5">
          <p class="text-sm font-semibold text-[#15171c]">{{ featuredMovies.length }}</p>
          <p class="mt-0.5 text-[10px] text-app-muted">예고편</p>
        </div>
        <div class="px-2 py-2.5">
          <p class="text-sm font-semibold text-[#15171c]">공식</p>
          <p class="mt-0.5 text-[10px] text-app-muted">발표 확인</p>
        </div>
      </div>
    </header>

    <div class="border-b border-app-line px-4 pt-3">
      <div class="flex gap-1 overflow-x-auto pb-3 scrollbar-hide" role="tablist" aria-label="시사회 메뉴">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="focus-ring corner-pill shrink-0 px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="activeTab === tab.id ? 'bg-app-accent text-white' : 'bg-app-panelSoft text-app-muted'"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="preview-hub-scroll space-y-5 overflow-y-auto p-4">
      <section v-if="activeTab === 'all' || activeTab === 'apply'" aria-labelledby="screening-apply-heading">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-app-accent">공식 이벤트</p>
            <h3 id="screening-apply-heading" class="mt-1 text-sm font-semibold text-[#15171c]">신청 가능한 시사회 찾기</h3>
          </div>
          <span class="text-[11px] text-app-muted">새 창으로 열기</span>
        </div>

        <div class="mt-3 grid gap-2">
          <a
            v-for="source in officialSources"
            :key="source.name"
            :href="source.href"
            target="_blank"
            rel="noreferrer"
            class="focus-ring corner-soft flex items-center justify-between gap-3 border border-app-line bg-app-panelSoft px-3 py-3 transition-colors hover:border-app-accent"
          >
            <span>
              <span class="block text-sm font-semibold text-[#15171c]">{{ source.name }}</span>
              <span class="mt-0.5 block text-[11px] text-app-muted">{{ source.detail }}</span>
            </span>
            <span aria-hidden="true" class="text-app-accent">↗</span>
          </a>
        </div>

        <p class="mt-2 text-[11px] leading-4 text-app-muted">
          신청 일정과 좌석·당첨 기준은 각 공식 이벤트 페이지에서 최종 확인해 주세요.
        </p>
      </section>

      <section v-if="activeTab === 'all' || activeTab === 'results'" aria-labelledby="screening-results-heading">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-app-accent">당첨 결과</p>
            <h3 id="screening-results-heading" class="mt-1 text-sm font-semibold text-[#15171c]">응모 결과 확인</h3>
          </div>
          <span class="corner-pill bg-app-panelSoft px-2 py-1 text-[10px] font-semibold text-app-muted">로그인 필요</span>
        </div>

        <div class="corner-soft mt-3 border border-dashed border-app-line bg-white px-3 py-3">
          <p class="text-sm font-medium text-[#15171c]">당첨 발표는 응모한 채널에서 확인해요.</p>
          <p class="mt-1 text-[11px] leading-4 text-app-muted">
            극장 계정으로 로그인하면 발표 공지와 내 이벤트 응모 내역을 바로 확인할 수 있어요.
          </p>
        </div>
      </section>

      <section v-if="activeTab === 'academy'" aria-labelledby="academy-awards-heading">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-app-accent">Academy Awards</p>
            <h3 id="academy-awards-heading" class="mt-1 text-sm font-semibold text-[#15171c]">아카데미 수상 이력 영화</h3>
          </div>
          <span class="corner-pill bg-app-panelSoft px-2 py-1 text-[10px] font-semibold text-app-muted">
            {{ filteredAcademyAwardMovies.length }}편
          </span>
        </div>

        <p class="mt-2 text-[11px] leading-4 text-app-muted">
          현재 카탈로그 수록작만 표시합니다. 작품상 수상작, 감독상 수상 감독의 작품, 남녀 주·조연상 수상 배우 출연작을 모두 포함합니다.
        </p>

        <div class="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="아카데미 수상 기준">
          <button
            v-for="filter in academyFilters"
            :key="filter.id"
            type="button"
            class="focus-ring corner-pill shrink-0 px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
            :class="academyFilter === filter.id ? 'bg-app-accent text-white' : 'bg-app-panelSoft text-app-muted'"
            :aria-pressed="academyFilter === filter.id"
            @click="academyFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>

        <ul class="mt-3 grid gap-2" aria-label="아카데미 수상 이력 영화 목록">
          <li v-for="movie in filteredAcademyAwardMovies" :key="movie.id">
            <article class="corner-soft flex gap-3 border border-app-line bg-app-panelSoft p-2">
              <img
                :src="movie.posterUrl"
                :alt="movie.posterAlt"
                class="h-[4.5rem] w-12 shrink-0 object-cover"
                loading="lazy"
              />
              <div class="min-w-0 py-0.5">
                <p class="truncate text-sm font-semibold text-[#15171c]">{{ movie.title }}</p>
                <p class="mt-0.5 text-[11px] text-app-muted">{{ movie.releaseYear }}</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="category in getAcademyAwardCategories(movie.id)"
                    :key="category"
                    class="corner-pill border border-app-accent/30 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-app-accent"
                  >
                    {{ academyCategoryLabels[category] }}
                  </span>
                </div>
              </div>
            </article>
          </li>
        </ul>
      </section>

      <section v-if="activeTab === 'all' || activeTab === 'videos'" aria-labelledby="screening-video-heading">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-app-accent">영상</p>
            <h3 id="screening-video-heading" class="mt-1 text-sm font-semibold text-[#15171c]">관심 영화 영상</h3>
          </div>
          <span class="text-[11px] text-app-muted">예고편 · 시사회 현장</span>
        </div>

        <div v-if="selectedMovie" class="mt-3">
          <div class="overflow-hidden border border-app-line bg-app-panelSoft">
            <img
              :src="selectedMovie.posterUrl"
              :alt="selectedMovie.posterAlt"
              class="h-32 w-full object-cover object-center"
              loading="lazy"
            />
            <div class="flex items-center justify-between gap-3 p-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-[#15171c]">{{ selectedMovie.title }}</p>
                <p class="mt-1 text-[11px] text-app-muted">{{ selectedMovie.releaseYear }} · 공식 예고편</p>
              </div>
              <button
                type="button"
                class="focus-ring corner-soft inline-flex min-h-9 shrink-0 items-center justify-center bg-app-accent px-3 text-xs font-semibold text-white"
                @click="openTrailer"
              >
                ▶ 재생
              </button>
            </div>
          </div>

          <div class="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="movie in featuredMovies"
              :key="movie.id"
              type="button"
              class="focus-ring corner-soft flex w-14 shrink-0 flex-col overflow-hidden border text-left"
              :class="selectedMovie.id === movie.id ? 'border-app-accent' : 'border-app-line'"
              :aria-label="`${movie.title} 예고편 선택`"
              @click="selectMovie(movie.id)"
            >
              <img :src="movie.posterUrl" :alt="movie.posterAlt" class="h-[4.5rem] w-full object-cover" loading="lazy" />
              <span class="line-clamp-2 px-1 py-1 text-[9px] leading-3 text-[#15171c]">{{ movie.title }}</span>
            </button>
          </div>

          <article class="corner-soft mt-3 overflow-hidden border border-app-line bg-white">
            <div class="relative h-24 overflow-hidden bg-[#15171c]">
              <img
                :src="selectedMovie.posterUrl"
                :alt="`${selectedMovie.posterAlt} 시사회 현장 영상`"
                class="h-full w-full object-cover opacity-45"
                loading="lazy"
              />
              <div class="absolute inset-0 flex items-end p-3">
                <span class="corner-pill border border-white/50 bg-black/40 px-2 py-1 text-[10px] font-semibold text-white">
                  언론 · VIP 시사회
                </span>
              </div>
            </div>
            <div class="p-3">
              <p class="text-sm font-semibold text-[#15171c]">뉴스로 보는 시사회 현장</p>
              <p class="mt-1 text-[11px] leading-4 text-app-muted">
                포토월, 배우 인터뷰, 무대인사 등 뉴스·제작사 채널의 현장 영상을 찾아볼 수 있어요.
              </p>
              <a
                :href="screeningCoverageSearchLink"
                target="_blank"
                rel="noreferrer"
                class="focus-ring corner-soft mt-3 inline-flex min-h-9 items-center justify-center border border-app-accent px-3 text-xs font-semibold text-app-accent transition-colors hover:bg-app-accent hover:text-white"
              >
                시사회 현장 영상 찾기
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  </aside>

  <Teleport to="body">
    <div
      v-if="isTrailerDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="closeTrailer"
    >
      <section
        class="corner-hard w-full max-w-3xl overflow-hidden border border-app-line bg-app-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selectedMovie?.title ?? ''} 예고편`"
      >
        <div class="flex items-center justify-between gap-4 border-b border-app-line px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-[#15171c]">{{ selectedMovie?.title }} 예고편</p>
            <p v-if="trailerName" class="mt-0.5 truncate text-xs text-app-muted">{{ trailerName }}</p>
          </div>
          <button
            type="button"
            class="focus-ring corner-soft inline-flex size-9 shrink-0 items-center justify-center border border-app-line text-lg text-[#15171c]"
            aria-label="예고편 닫기"
            @click="closeTrailer"
          >
            ×
          </button>
        </div>

        <div class="aspect-video bg-black">
          <div v-if="isTrailerLoading" class="grid h-full place-items-center text-sm text-white">예고편을 불러오는 중…</div>
          <iframe
            v-else-if="trailerEmbedUrl"
            :src="trailerEmbedUrl"
            :title="`${selectedMovie?.title ?? ''} 예고편`"
            class="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
          <div v-else class="flex h-full flex-col items-center justify-center gap-3 px-5 text-center text-sm text-white">
            <p>{{ trailerLoadFailed ? '앱에서 재생할 예고편을 찾지 못했어요.' : '예고편을 준비하고 있어요.' }}</p>
            <a
              v-if="trailerLoadFailed"
              :href="trailerSearchLink"
              target="_blank"
              rel="noreferrer"
              class="focus-ring corner-soft inline-flex min-h-10 items-center justify-center border border-white/60 px-4 text-xs font-semibold"
            >
              YouTube에서 찾기
            </a>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.preview-hub {
  position: sticky;
  top: 6.5rem;
}

.preview-hub-scroll {
  max-height: calc(100dvh - 11rem);
}

@media (max-width: 1023px) {
  .preview-hub {
    position: static;
  }

  .preview-hub-scroll {
    max-height: none;
  }
}
</style>
