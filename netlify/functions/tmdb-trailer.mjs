const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

const jsonResponse = (body, status = 200, cacheControl = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl
    }
  });

const trailerTypeRank = new Map([
  ['Trailer', 0],
  ['Teaser', 1],
  ['Clip', 2]
]);

const languageRank = new Map([
  ['ko', 0],
  ['en', 1]
]);

const selectYouTubeTrailer = (videos) => {
  const candidates = Array.isArray(videos)
    ? videos.filter(
        (video) =>
          video &&
          video.site === 'YouTube' &&
          typeof video.key === 'string' &&
          /^[A-Za-z0-9_-]{6,}$/.test(video.key)
      )
    : [];

  candidates.sort((left, right) => {
    const leftOfficialRank = left.official ? 0 : 1;
    const rightOfficialRank = right.official ? 0 : 1;

    if (leftOfficialRank !== rightOfficialRank) {
      return leftOfficialRank - rightOfficialRank;
    }

    const leftTypeRank = trailerTypeRank.get(left.type) ?? 3;
    const rightTypeRank = trailerTypeRank.get(right.type) ?? 3;

    if (leftTypeRank !== rightTypeRank) {
      return leftTypeRank - rightTypeRank;
    }

    const leftLanguageRank = languageRank.get(left.iso_639_1) ?? 2;
    const rightLanguageRank = languageRank.get(right.iso_639_1) ?? 2;

    if (leftLanguageRank !== rightLanguageRank) {
      return leftLanguageRank - rightLanguageRank;
    }

    return String(right.published_at ?? '').localeCompare(String(left.published_at ?? ''));
  });

  return candidates[0] ?? null;
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
    const response = await fetch(`${TMDB_API_BASE_URL}/movie/${movieId}/videos`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB returned ${response.status}.`);
    }

    const trailer = selectYouTubeTrailer((await response.json())?.results);

    if (!trailer) {
      return jsonResponse({ error: 'No embeddable YouTube trailer is available.' }, 404, 'public, max-age=3600');
    }

    return jsonResponse(
      { key: trailer.key, name: typeof trailer.name === 'string' ? trailer.name : null },
      200,
      'public, max-age=86400, s-maxage=86400'
    );
  } catch (error) {
    console.error('Unable to load the TMDB trailer.', error);
    return jsonResponse({ error: 'Unable to load the movie trailer.' }, 502);
  }
};
