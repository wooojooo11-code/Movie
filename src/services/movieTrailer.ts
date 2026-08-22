import type { CatalogMovieTrailer } from '@/types/recommendation';

const TMDB_TRAILER_ENDPOINT = '/.netlify/functions/tmdb-trailer';
const TRAILER_CACHE_PREFIX = 'movie-trailer:v1:';
const TRAILER_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

type TrailerResponse = {
  key: string;
  name: null | string;
};

type StoredTrailer = {
  cachedAt: number;
  trailer: TrailerResponse;
};

const isTrailerResponse = (value: unknown): value is TrailerResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<TrailerResponse>;

  return (
    typeof response.key === 'string' &&
    /^[A-Za-z0-9_-]{6,}$/.test(response.key) &&
    (typeof response.name === 'string' || response.name === null)
  );
};

const toTrailerResponse = (trailer: CatalogMovieTrailer | null | undefined): TrailerResponse | null => {
  if (!trailer) {
    return null;
  }

  const candidate = {
    key: trailer.youtubeKey,
    name: trailer.name
  };

  return isTrailerResponse(candidate) ? candidate : null;
};

const getTrailerCacheKey = (tmdbMovieId: number) => `${TRAILER_CACHE_PREFIX}${tmdbMovieId}`;

const readCachedTrailer = (tmdbMovieId: number): TrailerResponse | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getTrailerCacheKey(tmdbMovieId));

    if (!rawValue) {
      return null;
    }

    const cached = JSON.parse(rawValue) as Partial<StoredTrailer>;

    if (
      typeof cached.cachedAt !== 'number' ||
      Date.now() - cached.cachedAt > TRAILER_CACHE_MAX_AGE_MS ||
      !isTrailerResponse(cached.trailer)
    ) {
      window.localStorage.removeItem(getTrailerCacheKey(tmdbMovieId));
      return null;
    }

    return cached.trailer;
  } catch {
    return null;
  }
};

const cacheTrailer = (tmdbMovieId: number, trailer: TrailerResponse) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const value: StoredTrailer = {
      cachedAt: Date.now(),
      trailer
    };
    window.localStorage.setItem(getTrailerCacheKey(tmdbMovieId), JSON.stringify(value));
  } catch {
    // A full or unavailable local storage must not block trailer playback.
  }
};

export const getYouTubeEmbedUrl = (videoKey: string) => {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${videoKey}`);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('hl', 'ko');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('rel', '0');

  return url.toString();
};

export const loadMovieTrailer = async (
  tmdbMovieId: number,
  catalogTrailer?: CatalogMovieTrailer | null
): Promise<TrailerResponse> => {
  const savedTrailer = toTrailerResponse(catalogTrailer);

  if (savedTrailer) {
    return savedTrailer;
  }

  const cachedTrailer = readCachedTrailer(tmdbMovieId);

  if (cachedTrailer) {
    return cachedTrailer;
  }

  const url = new URL(TMDB_TRAILER_ENDPOINT, window.location.origin);
  url.searchParams.set('movieId', String(tmdbMovieId));

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Trailer request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  if (!isTrailerResponse(payload)) {
    throw new Error('Trailer response is invalid.');
  }

  cacheTrailer(tmdbMovieId, payload);
  return payload;
};
