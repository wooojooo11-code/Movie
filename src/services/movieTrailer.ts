const TMDB_TRAILER_ENDPOINT = '/.netlify/functions/tmdb-trailer';

type TrailerResponse = {
  key: string;
  name: null | string;
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

export const getYouTubeEmbedUrl = (videoKey: string) => {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${videoKey}`);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('hl', 'ko');
  url.searchParams.set('playsinline', '1');
  url.searchParams.set('rel', '0');

  return url.toString();
};

export const loadMovieTrailer = async (tmdbMovieId: number): Promise<TrailerResponse> => {
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

  return payload;
};
