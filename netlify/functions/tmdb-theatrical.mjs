import { jsonResponse } from './_shared/http.mjs';
import { fetchTmdbJson, toTmdbImageUrl } from './_shared/tmdb.mjs';

const KOREA_REGION = 'KR';
const KOREAN_LANGUAGE = 'ko-KR';

const isRecord = (value) => Boolean(value) && typeof value === 'object';

const toReleaseDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;

const normalizeGenre = (genre) => {
  if (!isRecord(genre) || !Number.isInteger(genre.id) || typeof genre.name !== 'string') {
    return null;
  }

  const name = genre.name.trim();

  return name ? { id: genre.id, name } : null;
};

export const normalizeTheatricalMovie = (movie, genresById) => {
  if (!isRecord(movie) || !Number.isInteger(movie.id) || movie.id <= 0) {
    return null;
  }

  const titleSource = typeof movie.title === 'string' ? movie.title : movie.original_title;
  const title = typeof titleSource === 'string' ? titleSource.trim() : '';

  if (!title) {
    return null;
  }

  const genreIds = Array.isArray(movie.genre_ids) ? movie.genre_ids : [];
  const genres = genreIds
    .filter((genreId) => Number.isInteger(genreId))
    .map((genreId) => genresById.get(genreId))
    .filter(Boolean);

  return {
    id: movie.id,
    title,
    posterUrl: toTmdbImageUrl(movie.poster_path),
    releaseDate: toReleaseDate(movie.release_date),
    genres,
    overview: typeof movie.overview === 'string' && movie.overview.trim() ? movie.overview.trim() : null
  };
};

const toMovieList = (payload, genresById) => {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw new Error('TMDB movie payload is invalid.');
  }

  return payload.results
    .map((movie) => normalizeTheatricalMovie(movie, genresById))
    .filter(Boolean);
};

const sortByReleaseDate = (movies, direction) =>
  [...movies].sort((left, right) => {
    if (!left.releaseDate && !right.releaseDate) {
      return left.title.localeCompare(right.title, 'ko-KR');
    }

    if (!left.releaseDate) {
      return 1;
    }

    if (!right.releaseDate) {
      return -1;
    }

    return direction * left.releaseDate.localeCompare(right.releaseDate);
  });

export default async () => {
  const token = process.env.TMDB_BEARER_TOKEN?.trim();

  if (!token) {
    return jsonResponse({ error: 'TMDB bearer token is not configured.' }, 503);
  }

  try {
    const [genrePayload, nowPlayingPayload, upcomingPayload] = await Promise.all([
      fetchTmdbJson('/genre/movie/list', token, { language: KOREAN_LANGUAGE, region: KOREA_REGION }),
      fetchTmdbJson('/movie/now_playing', token, { language: KOREAN_LANGUAGE, region: KOREA_REGION }),
      fetchTmdbJson('/movie/upcoming', token, { language: KOREAN_LANGUAGE, region: KOREA_REGION })
    ]);

    if (!isRecord(genrePayload) || !Array.isArray(genrePayload.genres)) {
      throw new Error('TMDB genre payload is invalid.');
    }

    const genres = genrePayload.genres.map(normalizeGenre).filter(Boolean);
    const genresById = new Map(genres.map((genre) => [genre.id, genre.name]));
    const nowPlaying = sortByReleaseDate(toMovieList(nowPlayingPayload, genresById), -1);
    const upcoming = sortByReleaseDate(toMovieList(upcomingPayload, genresById), 1);

    return jsonResponse(
      { nowPlaying, upcoming, genres },
      200,
      'public, max-age=900, s-maxage=900'
    );
  } catch (error) {
    console.error('Unable to load TMDB theatrical movies.', error);
    return jsonResponse({ error: 'Unable to load theatrical movie information.' }, 502);
  }
};
