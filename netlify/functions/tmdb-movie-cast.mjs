import { jsonResponse } from './_shared/http.mjs';
import { fetchTmdbJson, toTmdbImageUrl } from './_shared/tmdb.mjs';

const MAX_CAST_MEMBERS = 12;

const normalizeCastMember = (person) => {
  if (!person || !Number.isInteger(person.id) || typeof person.name !== 'string') {
    return null;
  }

  return {
    id: person.id,
    name: person.name,
    character: typeof person.character === 'string' ? person.character : '',
    profileUrl: toTmdbImageUrl(person.profile_path, 'w185')
  };
};

export default async (request) => {
  const token = process.env.TMDB_BEARER_TOKEN?.trim();
  const movieId = new URL(request.url).searchParams.get('movieId') ?? '';

  if (!token) {
    return jsonResponse({ error: 'TMDB bearer token is not configured.' }, 503);
  }

  if (!/^\d+$/.test(movieId) || Number(movieId) <= 0) {
    return jsonResponse({ error: 'A valid TMDB movie ID is required.' }, 400);
  }

  try {
    const payload = await fetchTmdbJson(`/movie/${movieId}/credits`, token, {
      language: 'ko-KR'
    });
    const cast = (Array.isArray(payload?.cast) ? payload.cast : [])
      .map(normalizeCastMember)
      .filter(Boolean)
      .slice(0, MAX_CAST_MEMBERS);

    return jsonResponse(
      { cast },
      200,
      'public, max-age=86400, s-maxage=86400'
    );
  } catch (error) {
    console.error('Unable to load the TMDB movie cast.', error);
    return jsonResponse({ error: 'Unable to load the movie cast.' }, 502);
  }
};
