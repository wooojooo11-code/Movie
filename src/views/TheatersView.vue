<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import TheaterMap from '@/components/theaters/TheaterMap.vue';
import TheatricalMovieCard from '@/components/theaters/TheatricalMovieCard.vue';
import { findLocation, findNearbyCinemas, isKakaoMapConfigured } from '@/services/kakaoMaps';
import { loadTheatricalMovies } from '@/services/theatricalMovies';
import type {
  MapCoordinates,
  NearbyCinema,
  TheatricalCollection,
  TheatricalMovie,
  TheatricalMoviesResponse
} from '@/types/theaters';

const collectionTabs: { id: TheatricalCollection; label: string; description: string }[] = [
  { id: 'nowPlaying', label: '상영 중', description: '현재 극장에서 만날 수 있는 영화' },
  { id: 'upcoming', label: '개봉 예정', description: '한국 개봉일 기준으로 정렬' }
];

const bookingProviders = [
  { label: 'CGV', url: 'https://www.cgv.co.kr/ticket/' },
  { label: '롯데시네마', url: 'https://www.lottecinema.co.kr/NLCHS/Ticketing' },
  { label: '메가박스', url: 'https://www.megabox.co.kr/booking' }
];

const MOVIES_PER_PAGE = 5;

const activeCollection = ref<TheatricalCollection>('nowPlaying');
const selectedGenre = ref('');
const visibleMovieCount = ref(MOVIES_PER_PAGE);
const theatricalData = ref<TheatricalMoviesResponse | null>(null);
const isMovieLoading = ref(false);
const movieErrorMessage = ref('');
const bookingMovie = ref<TheatricalMovie | null>(null);

const selectedLocation = ref<MapCoordinates | null>(null);
const locationLabel = ref('아직 위치를 선택하지 않았습니다.');
const locationSearchQuery = ref('');
const cinemas = ref<NearbyCinema[]>([]);
const activeCinemaId = ref<string | null>(null);
const isCinemaLoading = ref(false);
const cinemaErrorMessage = ref('');

const activeMovies = computed(() => theatricalData.value?.[activeCollection.value] ?? []);
const visibleGenres = computed(() => {
  const movieGenres = new Set(activeMovies.value.flatMap((movie) => movie.genres));
  const configuredGenres = theatricalData.value?.genres ?? [];

  return configuredGenres.filter((genre) => movieGenres.has(genre.name));
});
const filteredMovies = computed(() =>
  selectedGenre.value
    ? activeMovies.value.filter((movie) => movie.genres.includes(selectedGenre.value))
    : activeMovies.value
);
const displayedMovies = computed(() => filteredMovies.value.slice(0, visibleMovieCount.value));
const remainingMovieCount = computed(() => Math.max(0, filteredMovies.value.length - displayedMovies.value.length));
const canShowMoreMovies = computed(() => remainingMovieCount.value > 0);
const activeTab = computed(() => collectionTabs.find((tab) => tab.id === activeCollection.value) ?? collectionTabs[0]);

const resetMoviePagination = () => {
  visibleMovieCount.value = MOVIES_PER_PAGE;
};

const showMoreMovies = () => {
  visibleMovieCount.value += MOVIES_PER_PAGE;
};

const refreshMovies = async () => {
  if (isMovieLoading.value) {
    return;
  }

  isMovieLoading.value = true;
  movieErrorMessage.value = '';

  try {
    theatricalData.value = await loadTheatricalMovies();
    resetMoviePagination();
  } catch (error) {
    console.warn('Unable to load theatrical movies.', error);
    movieErrorMessage.value = '신작 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
  } finally {
    isMovieLoading.value = false;
  }
};

const formatDistance = (distanceMeters: number) =>
  distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(distanceMeters >= 10_000 ? 0 : 1)}km` : `${distanceMeters}m`;

const setNearbyCinemas = async (coordinates: MapCoordinates, label: string) => {
  selectedLocation.value = coordinates;
  locationLabel.value = label;
  cinemas.value = [];
  activeCinemaId.value = null;
  cinemaErrorMessage.value = '';

  try {
    const results = await findNearbyCinemas(coordinates);
    cinemas.value = results;
    activeCinemaId.value = results[0]?.id ?? null;
  } catch (error) {
    console.warn('Unable to search nearby cinemas.', error);
    cinemaErrorMessage.value = isKakaoMapConfigured()
      ? '근처 영화관을 찾지 못했습니다. 지역을 다시 검색해 주세요.'
      : '카카오맵 키를 설정하면 근처 영화관을 찾을 수 있습니다.';
  }
};

const findCurrentLocation = async () => {
  if (!isKakaoMapConfigured()) {
    cinemaErrorMessage.value = '카카오맵 키를 설정하면 현재 위치 주변 영화관을 찾을 수 있습니다.';
    return;
  }

  if (!navigator.geolocation) {
    cinemaErrorMessage.value = '이 브라우저에서는 현재 위치를 지원하지 않습니다. 지역 검색을 이용해 주세요.';
    return;
  }

  isCinemaLoading.value = true;
  cinemaErrorMessage.value = '';

  try {
    const coordinates = await new Promise<MapCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
        () => reject(new Error('Location permission was denied.')),
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000
        }
      );
    });

    await setNearbyCinemas(coordinates, '현재 위치');
  } catch (error) {
    console.warn('Unable to resolve current location.', error);
    cinemaErrorMessage.value = '현재 위치를 가져오지 못했습니다. 위치 권한을 허용하거나 지역을 검색해 주세요.';
  } finally {
    isCinemaLoading.value = false;
  }
};

const searchLocation = async () => {
  if (!locationSearchQuery.value.trim()) {
    cinemaErrorMessage.value = '동네, 역 또는 주소를 입력해 주세요.';
    return;
  }

  if (!isKakaoMapConfigured()) {
    cinemaErrorMessage.value = '카카오맵 키를 설정하면 지역별 영화관을 찾을 수 있습니다.';
    return;
  }

  isCinemaLoading.value = true;
  cinemaErrorMessage.value = '';

  try {
    const location = await findLocation(locationSearchQuery.value);
    await setNearbyCinemas(location.coordinates, location.label);
  } catch (error) {
    console.warn('Unable to search location.', error);
    cinemaErrorMessage.value = '검색한 지역을 찾지 못했습니다. 다른 동네, 역 또는 주소로 다시 시도해 주세요.';
  } finally {
    isCinemaLoading.value = false;
  }
};

const directionsUrl = (cinema: NearbyCinema) =>
  `https://map.kakao.com/link/to/${encodeURIComponent(cinema.name)},${cinema.latitude},${cinema.longitude}`;

watch(activeCollection, () => {
  if (selectedGenre.value && !visibleGenres.value.some((genre) => genre.name === selectedGenre.value)) {
    selectedGenre.value = '';
  }

  resetMoviePagination();
});

watch(selectedGenre, resetMoviePagination);

onMounted(() => {
  void refreshMovies();
});
</script>

<template>
  <main
    class="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-[calc(3.75rem+env(safe-area-inset-bottom))] pt-6 sm:max-w-xl"
  >
    <section aria-labelledby="theatrical-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-app-accent">CINEMA</p>
          <h1 id="theatrical-title" class="mt-1 text-2xl font-semibold text-[#15171c]">극장 영화</h1>
          <p class="mt-2 text-sm leading-5 text-app-muted">신작 일정과 가까운 영화관을 한곳에서 확인하세요.</p>
        </div>
        <button
          type="button"
          class="focus-ring corner-soft grid size-9 shrink-0 place-items-center border border-app-line bg-app-panel text-lg text-[#15171c] disabled:cursor-wait disabled:opacity-50"
          aria-label="신작 정보 새로고침"
          :disabled="isMovieLoading"
          @click="refreshMovies"
        >
          ↻
        </button>
      </div>
    </section>

    <section aria-labelledby="movie-schedule-title">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 id="movie-schedule-title" class="text-lg font-semibold text-[#15171c]">신작 · 개봉 일정</h2>
          <p class="mt-1 text-xs text-app-muted">{{ activeTab.description }}</p>
        </div>
        <span v-if="theatricalData" class="text-xs text-app-muted">
          {{ displayedMovies.length }} / {{ filteredMovies.length }}편
        </span>
      </div>

      <div class="mt-4 flex border-b border-app-line" role="tablist" aria-label="신작 구분">
        <button
          v-for="tab in collectionTabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeCollection === tab.id"
          class="focus-ring min-h-10 flex-1 border-b-2 px-2 text-sm font-medium transition-colors"
          :class="activeCollection === tab.id ? 'border-app-accent text-[#174a77]' : 'border-transparent text-app-muted'"
          @click="activeCollection = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="visibleGenres.length > 0" class="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          class="focus-ring corner-pill shrink-0 border px-3 py-1.5 text-xs font-medium"
          :class="selectedGenre === '' ? 'border-app-accent bg-[#dcecff] text-[#174a77]' : 'border-app-line bg-app-panel text-app-muted'"
          @click="selectedGenre = ''"
        >
          전체
        </button>
        <button
          v-for="genre in visibleGenres"
          :key="genre.id"
          type="button"
          class="focus-ring corner-pill shrink-0 border px-3 py-1.5 text-xs font-medium"
          :class="selectedGenre === genre.name ? 'border-app-accent bg-[#dcecff] text-[#174a77]' : 'border-app-line bg-app-panel text-app-muted'"
          @click="selectedGenre = genre.name"
        >
          {{ genre.name }}
        </button>
      </div>

      <div v-if="isMovieLoading && !theatricalData" class="mt-4 border border-dashed border-app-line bg-app-panel px-4 py-7 text-sm text-app-muted">
        신작 정보를 불러오는 중입니다.
      </div>
      <div v-else-if="movieErrorMessage" class="mt-4 border border-dashed border-app-line bg-app-panel px-4 py-5 text-sm text-app-muted">
        <p>{{ movieErrorMessage }}</p>
        <button type="button" class="focus-ring mt-3 text-sm font-semibold text-[#174a77] underline" @click="refreshMovies">
          다시 시도
        </button>
      </div>
      <div v-else-if="filteredMovies.length === 0" class="mt-4 border border-dashed border-app-line bg-app-panel px-4 py-7 text-sm text-app-muted">
        이 조건에 맞는 영화가 없습니다.
      </div>
      <div v-else class="mt-4 grid gap-3">
        <TheatricalMovieCard v-for="movie in displayedMovies" :key="movie.id" :movie="movie" @book="bookingMovie = movie" />
      </div>

      <div v-if="canShowMoreMovies" class="mt-4 flex justify-center">
        <button
          type="button"
          class="focus-ring corner-soft min-h-10 border border-app-line bg-app-panel px-4 text-sm font-semibold text-[#174a77]"
          @click="showMoreMovies"
        >
          영화 {{ Math.min(MOVIES_PER_PAGE, remainingMovieCount) }}편 더보기
        </button>
      </div>

      <p class="mt-3 text-[11px] leading-4 text-app-muted">
        영화 정보 제공: <a class="underline" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
        · 실제 상영시간과 좌석은 예매처에서 확인해 주세요.
      </p>
    </section>

    <section aria-labelledby="nearby-cinemas-title">
      <div>
        <p class="text-xs font-semibold text-app-accent">NEARBY</p>
        <h2 id="nearby-cinemas-title" class="mt-1 text-lg font-semibold text-[#15171c]">가까운 영화관</h2>
        <p class="mt-1 text-xs leading-4 text-app-muted">현재 위치를 직접 허용하거나 지역을 검색해 주세요. 위치는 저장하지 않습니다.</p>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-[auto_1fr]">
        <button
          type="button"
          class="focus-ring corner-soft min-h-10 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
          :disabled="isCinemaLoading"
          @click="findCurrentLocation"
        >
          {{ isCinemaLoading ? '찾는 중…' : '내 위치로 찾기' }}
        </button>
        <form class="flex min-w-0 gap-2" @submit.prevent="searchLocation">
          <label class="sr-only" for="cinema-location-search">지역 검색</label>
          <input
            id="cinema-location-search"
            v-model="locationSearchQuery"
            type="search"
            autocomplete="street-address"
            placeholder="동네, 역 또는 주소"
            class="focus-ring min-w-0 flex-1 border border-app-line bg-app-panel px-3 text-sm text-[#15171c] placeholder:text-app-muted"
          />
          <button
            type="submit"
            class="focus-ring corner-soft min-h-10 shrink-0 border border-app-accent bg-app-accent px-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50"
            :disabled="isCinemaLoading"
          >
            검색
          </button>
        </form>
      </div>

      <p class="mt-3 text-xs text-app-muted">기준 위치: {{ locationLabel }}</p>
      <p v-if="cinemaErrorMessage" class="mt-2 text-xs leading-4 text-[#a13c3c]">{{ cinemaErrorMessage }}</p>

      <div class="mt-4">
        <TheaterMap
          :center="selectedLocation"
          :cinemas="cinemas"
          :active-cinema-id="activeCinemaId"
          @select-cinema="activeCinemaId = $event"
        />
      </div>

      <div v-if="cinemas.length > 0" class="mt-3 grid gap-2">
        <article
          v-for="cinema in cinemas"
          :key="cinema.id"
          class="corner-soft border p-3 transition-colors"
          :class="activeCinemaId === cinema.id ? 'border-app-accent bg-[#eef6ff]' : 'border-app-line bg-app-panel'"
        >
          <button type="button" class="focus-ring w-full text-left" @click="activeCinemaId = cinema.id">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-[#15171c]">{{ cinema.name }}</h3>
                <p class="mt-1 line-clamp-1 text-xs text-app-muted">{{ cinema.address }}</p>
              </div>
              <span class="shrink-0 text-xs font-semibold text-[#174a77]">{{ formatDistance(cinema.distanceMeters) }}</span>
            </div>
          </button>
          <div class="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs font-medium text-[#174a77]">
            <a v-if="cinema.placeUrl" class="focus-ring underline" :href="cinema.placeUrl" target="_blank" rel="noopener noreferrer">카카오맵 상세</a>
            <a class="focus-ring underline" :href="directionsUrl(cinema)" target="_blank" rel="noopener noreferrer">길찾기</a>
          </div>
        </article>
      </div>
    </section>
  </main>

  <div
    v-if="bookingMovie"
    class="fixed inset-0 z-40 flex items-end bg-black/30 px-4 pb-4 pt-8"
    @click.self="bookingMovie = null"
  >
    <section class="corner-hard mx-auto w-full max-w-md border border-app-line bg-app-panel p-4" aria-labelledby="booking-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs text-app-muted">예매할 영화</p>
          <h2 id="booking-title" class="mt-1 text-lg font-semibold text-[#15171c]">{{ bookingMovie.title }}</h2>
        </div>
        <button type="button" class="focus-ring corner-soft border border-app-line px-3 py-2 text-xs text-[#15171c]" @click="bookingMovie = null">
          닫기
        </button>
      </div>
      <p class="mt-3 text-sm leading-5 text-app-muted">선호하는 극장사를 고르면 공식 예매 화면이 새 탭에서 열립니다.</p>
      <div class="mt-4 grid gap-2">
        <a
          v-for="provider in bookingProviders"
          :key="provider.label"
          class="focus-ring corner-soft flex min-h-11 items-center justify-between border border-app-line bg-app-panelSoft px-3 text-sm font-semibold text-[#15171c]"
          :href="provider.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ provider.label }} 예매
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  </div>
</template>
