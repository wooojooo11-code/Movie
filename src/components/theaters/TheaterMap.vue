<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  isKakaoMapConfigured,
  loadKakaoMaps,
  type KakaoInfoWindow,
  type KakaoMapInstance,
  type KakaoMapsApi,
  type KakaoMarker
} from '@/services/kakaoMaps';
import type { MapCoordinates, NearbyCinema } from '@/types/theaters';

const props = defineProps<{
  center: MapCoordinates | null;
  cinemas: NearbyCinema[];
  activeCinemaId: string | null;
}>();

const emit = defineEmits<{
  selectCinema: [cinemaId: string];
}>();

const defaultCenter: MapCoordinates = { latitude: 37.5665, longitude: 126.978 };
const mapElement = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
let kakao: KakaoMapsApi | null = null;
let map: KakaoMapInstance | null = null;
let infoWindow: KakaoInfoWindow | null = null;
const markers = new Map<string, KakaoMarker>();

const mapStatusMessage = computed(() => {
  if (errorMessage.value) {
    return errorMessage.value;
  }

  if (isLoading.value) {
    return '지도를 불러오는 중입니다.';
  }

  if (!props.center) {
    return '내 위치를 찾거나 지역을 검색하면 근처 영화관을 표시합니다.';
  }

  if (props.cinemas.length === 0) {
    return '20km 안에서 찾은 영화관이 없습니다.';
  }

  return '';
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };

    return entities[character] ?? character;
  });

const setMapCenter = (coordinates: MapCoordinates) => {
  if (!map || !kakao) {
    return;
  }

  map.setCenter(new kakao.maps.LatLng(coordinates.latitude, coordinates.longitude));
};

const clearMarkers = () => {
  for (const marker of markers.values()) {
    marker.setMap(null);
  }

  markers.clear();
};

const showActiveCinema = () => {
  if (!map || !kakao || !props.activeCinemaId) {
    infoWindow?.close();
    return;
  }

  const cinema = props.cinemas.find((entry) => entry.id === props.activeCinemaId);
  const marker = markers.get(props.activeCinemaId);

  if (!cinema || !marker) {
    infoWindow?.close();
    return;
  }

  setMapCenter(cinema);

  for (const [cinemaId, entryMarker] of markers.entries()) {
    entryMarker.setZIndex(cinemaId === cinema.id ? 2 : 1);
  }

  infoWindow?.close();
  infoWindow = new kakao.maps.InfoWindow({
    content: `<div style="padding:7px 9px;font-size:12px;white-space:nowrap;">${escapeHtml(cinema.name)}</div>`
  });
  infoWindow.open(map, marker);
};

const renderCinemas = () => {
  if (!map || !kakao) {
    return;
  }

  clearMarkers();

  for (const cinema of props.cinemas) {
    const marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(cinema.latitude, cinema.longitude),
      title: cinema.name
    });

    kakao.maps.event.addListener(marker, 'click', () => emit('selectCinema', cinema.id));
    markers.set(cinema.id, marker);
  }

  showActiveCinema();
};

const syncMap = () => {
  if (!map) {
    return;
  }

  setMapCenter(props.center ?? defaultCenter);
  renderCinemas();
};

onMounted(async () => {
  if (!isKakaoMapConfigured()) {
    errorMessage.value = '카카오맵 키가 설정되지 않아 지도를 표시할 수 없습니다.';
    isLoading.value = false;
    return;
  }

  try {
    kakao = await loadKakaoMaps();

    if (!mapElement.value) {
      return;
    }

    map = new kakao.maps.Map(mapElement.value, {
      center: new kakao.maps.LatLng((props.center ?? defaultCenter).latitude, (props.center ?? defaultCenter).longitude),
      level: 5
    });
    map.relayout();
    syncMap();
  } catch (error) {
    console.warn('Unable to load Kakao Maps.', error);
    errorMessage.value = '카카오맵을 불러오지 못했습니다. 키와 등록 도메인을 확인해 주세요.';
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  clearMarkers();
  infoWindow?.close();
});

watch(
  () => [props.center, props.cinemas, props.activeCinemaId],
  () => {
    if (props.activeCinemaId && props.cinemas.some((cinema) => cinema.id === props.activeCinemaId)) {
      showActiveCinema();
      return;
    }

    syncMap();
  },
  { deep: true }
);
</script>

<template>
  <div class="relative overflow-hidden border border-app-line bg-app-panelSoft">
    <div ref="mapElement" class="h-64 w-full" aria-label="근처 영화관 지도" />
    <div
      v-if="mapStatusMessage"
      class="pointer-events-none absolute inset-x-3 bottom-3 border border-app-line bg-app-panel px-3 py-2 text-center text-xs leading-4 text-app-muted"
    >
      {{ mapStatusMessage }}
    </div>
  </div>
</template>
