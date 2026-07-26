import type { MapCoordinates, NearbyCinema } from '@/types/theaters';

type KakaoPlace = {
  id?: string;
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
  distance?: string;
  place_url?: string;
  x?: string;
  y?: string;
};

type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMapInstance = {
  setCenter: (position: KakaoLatLng) => void;
  relayout: () => void;
};

export type KakaoMarker = {
  setMap: (map: KakaoMapInstance | null) => void;
  setZIndex: (zIndex: number) => void;
};

export type KakaoInfoWindow = {
  open: (map: KakaoMapInstance, marker: KakaoMarker) => void;
  close: () => void;
};

export type KakaoMapsApi = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
    Marker: new (options: { map?: KakaoMapInstance; position: KakaoLatLng; title?: string }) => KakaoMarker;
    InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindow;
    event: {
      addListener: (target: KakaoMarker, eventName: string, listener: () => void) => void;
    };
    services: {
      Places: new () => {
        keywordSearch: (
          query: string,
          callback: (data: KakaoPlace[], status: string) => void,
          options?: {
            location?: KakaoLatLng;
            radius?: number;
            sort?: string;
          }
        ) => void;
      };
      Status: {
        OK: string;
        ZERO_RESULT: string;
      };
      SortBy: {
        DISTANCE: string;
      };
    };
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapsApi;
  }
}

const KAKAO_MAP_SDK_ID = 'kakao-map-sdk';
const KAKAO_MAP_SDK_KEY = import.meta.env.VITE_KAKAO_MAP_JAVASCRIPT_KEY?.trim();
let sdkPromise: Promise<KakaoMapsApi> | null = null;

const getCoordinates = (place: KakaoPlace): MapCoordinates | null => {
  const longitude = Number(place.x);
  const latitude = Number(place.y);

  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
};

const getDistanceMeters = (from: MapCoordinates, to: MapCoordinates, placeDistance?: string) => {
  const providedDistance = Number(placeDistance);

  if (Number.isFinite(providedDistance) && providedDistance >= 0) {
    return Math.round(providedDistance);
  }

  const earthRadiusMeters = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDifference = toRadians(to.latitude - from.latitude);
  const longitudeDifference = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const halfChord =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDifference / 2) ** 2;

  return Math.round(2 * earthRadiusMeters * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord)));
};

const waitForKakaoMaps = (kakao: KakaoMapsApi) =>
  new Promise<KakaoMapsApi>((resolve) => {
    kakao.maps.load(() => resolve(kakao));
  });

export const isKakaoMapConfigured = () => Boolean(KAKAO_MAP_SDK_KEY);

export const loadKakaoMaps = (): Promise<KakaoMapsApi> => {
  if (!KAKAO_MAP_SDK_KEY) {
    return Promise.reject(new Error('Kakao Maps JavaScript key is not configured.'));
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Kakao Maps can only load in a browser.'));
  }

  if (window.kakao?.maps) {
    sdkPromise = waitForKakaoMaps(window.kakao);
    return sdkPromise;
  }

  sdkPromise = new Promise<KakaoMapsApi>((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_MAP_SDK_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement('script');

    const onLoad = () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao Maps SDK did not initialize.'));
        return;
      }

      void waitForKakaoMaps(window.kakao).then(resolve);
    };

    const onError = () => reject(new Error('Unable to load Kakao Maps SDK.'));

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (!existingScript) {
      script.id = KAKAO_MAP_SDK_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${encodeURIComponent(KAKAO_MAP_SDK_KEY)}`;
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    sdkPromise = null;
    throw error;
  });

  return sdkPromise;
};

const searchPlaces = (
  kakao: KakaoMapsApi,
  query: string,
  options?: { location?: MapCoordinates; radius?: number; sortByDistance?: boolean }
) =>
  new Promise<KakaoPlace[]>((resolve, reject) => {
    const places = new kakao.maps.services.Places();
    const searchOptions = {
      ...(options?.location
        ? {
            location: new kakao.maps.LatLng(options.location.latitude, options.location.longitude)
          }
        : {}),
      ...(options?.radius ? { radius: options.radius } : {}),
      ...(options?.sortByDistance ? { sort: kakao.maps.services.SortBy.DISTANCE } : {})
    };

    places.keywordSearch(
      query,
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(data);
          return;
        }

        if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
          return;
        }

        reject(new Error('Kakao place search failed.'));
      },
      searchOptions
    );
  });

export const findLocation = async (query: string) => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error('Enter a location to search.');
  }

  const kakao = await loadKakaoMaps();
  const place = (await searchPlaces(kakao, trimmedQuery))[0];
  const coordinates = place ? getCoordinates(place) : null;

  if (!place || !coordinates) {
    throw new Error('No matching location was found.');
  }

  return {
    coordinates,
    label: place.place_name?.trim() || trimmedQuery
  };
};

export const findNearbyCinemas = async (origin: MapCoordinates): Promise<NearbyCinema[]> => {
  const kakao = await loadKakaoMaps();
  const places = await searchPlaces(kakao, '영화관', {
    location: origin,
    radius: 20_000,
    sortByDistance: true
  });

  return places
    .map((place) => {
      const coordinates = getCoordinates(place);
      const name = place.place_name?.trim();

      if (!coordinates || !name) {
        return null;
      }

      return {
        id: place.id?.trim() || `${name}-${coordinates.latitude}-${coordinates.longitude}`,
        name,
        address: place.road_address_name?.trim() || place.address_name?.trim() || '주소 정보 없음',
        distanceMeters: getDistanceMeters(origin, coordinates, place.distance),
        placeUrl: place.place_url?.startsWith('https://') ? place.place_url : null,
        ...coordinates
      } satisfies NearbyCinema;
    })
    .filter((cinema): cinema is NearbyCinema => cinema !== null)
    .sort((left, right) => left.distanceMeters - right.distanceMeters || left.name.localeCompare(right.name, 'ko-KR'));
};
