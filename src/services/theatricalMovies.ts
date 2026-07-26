import type { TheatricalGenre, TheatricalMovie, TheatricalMoviesResponse } from '@/types/theaters';

const THEATRICAL_MOVIES_ENDPOINT = '/.netlify/functions/tmdb-theatrical';

const isGenre = (value: unknown): value is TheatricalGenre => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const genre = value as Partial<TheatricalGenre>;
  return Number.isInteger(genre.id) && typeof genre.name === 'string' && Boolean(genre.name.trim());
};

const isMovie = (value: unknown): value is TheatricalMovie => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const movie = value as Partial<TheatricalMovie>;

  return (
    Number.isInteger(movie.id) &&
    typeof movie.title === 'string' &&
    Boolean(movie.title.trim()) &&
    (typeof movie.posterUrl === 'string' || movie.posterUrl === null) &&
    (typeof movie.releaseDate === 'string' || movie.releaseDate === null) &&
    Array.isArray(movie.genres) &&
    movie.genres.every((genre) => typeof genre === 'string') &&
    (typeof movie.overview === 'string' || movie.overview === null)
  );
};

const isTheatricalMoviesResponse = (value: unknown): value is TheatricalMoviesResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<TheatricalMoviesResponse>;

  return (
    Array.isArray(response.nowPlaying) &&
    response.nowPlaying.every(isMovie) &&
    Array.isArray(response.upcoming) &&
    response.upcoming.every(isMovie) &&
    Array.isArray(response.genres) &&
    response.genres.every(isGenre)
  );
};

export const loadTheatricalMovies = async (signal?: AbortSignal): Promise<TheatricalMoviesResponse> => {
  const response = await fetch(THEATRICAL_MOVIES_ENDPOINT, {
    headers: {
      Accept: 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error(`Theatrical movie request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();

  if (!isTheatricalMoviesResponse(payload)) {
    throw new Error('Theatrical movie response is invalid.');
  }

  return payload;
};
