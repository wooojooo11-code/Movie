import { jsonResponse } from './_shared/http.mjs';
import { fetchTmdbJson, toTmdbImageUrl } from './_shared/tmdb.mjs';

const KOREAN_LANGUAGE = 'ko-KR';

const normalizeMovieTitle = (title) =>
  typeof title === 'string' ? title.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '') : '';

const getMovieTitle = (movie) =>
  typeof movie?.title === 'string'
    ? movie.title
    : typeof movie?.original_title === 'string'
      ? movie.original_title
      : '';

const getReleaseYear = (value) => {
  const match = typeof value === 'string' ? /^(\d{4})-\d{2}-\d{2}$/.exec(value) : null;
  return match ? Number(match[1]) : null;
};

const findExactMovie = async (title, year, token) => {
  const requestedTitle = normalizeMovieTitle(title);
  const payload = await fetchTmdbJson('/search/movie', token, {
    language: KOREAN_LANGUAGE,
    query: title,
    year: year || undefined
  });
  const matches = (Array.isArray(payload?.results) ? payload.results : []).filter(
    (candidate) => normalizeMovieTitle(getMovieTitle(candidate)) === requestedTitle
  );

  if (!matches.length) {
    return null;
  }

  return matches.sort((left, right) => {
    const leftYear = getReleaseYear(left.release_date);
    const rightYear = getReleaseYear(right.release_date);
    const leftDistance = year && leftYear ? Math.abs(leftYear - year) : Number.MAX_SAFE_INTEGER;
    const rightDistance = year && rightYear ? Math.abs(rightYear - year) : Number.MAX_SAFE_INTEGER;

    return leftDistance - rightDistance || Number(right.popularity ?? 0) - Number(left.popularity ?? 0);
  })[0];
};

export default async (request) => {
  const token = process.env.TMDB_BEARER_TOKEN?.trim();
  const url = new URL(request.url);
  const title = url.searchParams.get('title')?.trim() ?? '';
  const yearParam = url.searchParams.get('year') ?? '';
  const year = /^\d{4}$/.test(yearParam) ? Number(yearParam) : null;

  if (!token) {
    return jsonResponse({ error: 'TMDB bearer token is not configured.' }, 503);
  }

  if (!title || title.length > 160) {
    return jsonResponse({ error: 'A valid movie title is required.' }, 400);
  }

  try {
    const match = await findExactMovie(title, year, token);

    if (!match || !Number.isInteger(match.id)) {
      return jsonResponse({ matched: false }, 200, 'public, max-age=3600, s-maxage=3600');
    }

    const detail = await fetchTmdbJson(`/movie/${match.id}`, token, {
      language: KOREAN_LANGUAGE,
      append_to_response: 'credits'
    });
    const cast = Array.isArray(detail?.credits?.cast)
      ? detail.credits.cast
          .map((person) => (typeof person?.name === 'string' ? person.name : null))
          .filter(Boolean)
          .slice(0, 5)
      : [];

    return jsonResponse(
      {
        matched: true,
        movie: {
          tmdbMovieId: match.id,
          releaseYear: getReleaseYear(detail?.release_date),
          runtimeMinutes: Number.isFinite(detail?.runtime) && detail.runtime > 0 ? detail.runtime : null,
          overview: typeof detail?.overview === 'string' ? detail.overview : '',
          genres: Array.isArray(detail?.genres)
            ? detail.genres
                .map((genre) => (typeof genre?.name === 'string' ? genre.name : null))
                .filter(Boolean)
            : [],
          cast,
          posterUrl: toTmdbImageUrl(detail?.poster_path, 'w780')
        }
      },
      200,
      'public, max-age=86400, s-maxage=86400'
    );
  } catch (error) {
    console.error('Unable to enrich the KOBIS movie with TMDB details.', error);
    return jsonResponse({ error: 'Unable to load TMDB movie details.' }, 502);
  }
};
