import { jsonResponse } from './_shared/http.mjs';
import { fetchTmdbJson, toTmdbImageUrl } from './_shared/tmdb.mjs';

const KOBIS_DAILY_BOX_OFFICE_URL =
  'https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json';
const KOREAN_LANGUAGE = 'ko-KR';
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

const getPreviousKoreaDate = (daysAgo) => {
  const koreaNow = new Date(Date.now() + KOREA_TIME_OFFSET_MS);
  koreaNow.setUTCDate(koreaNow.getUTCDate() - daysAgo);

  const year = koreaNow.getUTCFullYear();
  const month = String(koreaNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(koreaNow.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

const normalizeMovieTitle = (title) =>
  typeof title === 'string' ? title.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '') : '';

const getReleaseYear = (releaseDate) => {
  const match = typeof releaseDate === 'string' ? /^(\d{4})-\d{2}-\d{2}$/.exec(releaseDate) : null;
  return match ? Number(match[1]) : null;
};

const getTmdbMovieTitle = (movie) =>
  typeof movie?.title === 'string' ? movie.title : typeof movie?.original_title === 'string' ? movie.original_title : '';

const findPoster = async (movie, token) => {
  const targetTitle = normalizeMovieTitle(movie.movieNm);

  if (!targetTitle) {
    return null;
  }

  const releaseYear = getReleaseYear(movie.openDt);
  const payload = await fetchTmdbJson('/search/movie', token, {
    language: KOREAN_LANGUAGE,
    query: movie.movieNm,
    year: releaseYear
  });
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const exactTitleMatches = results.filter(
    (candidate) => normalizeMovieTitle(getTmdbMovieTitle(candidate)) === targetTitle
  );

  if (exactTitleMatches.length === 0) {
    return null;
  }

  const bestMatch = [...exactTitleMatches].sort((left, right) => {
    const leftYear = getReleaseYear(left.release_date);
    const rightYear = getReleaseYear(right.release_date);
    const leftYearDistance = releaseYear && leftYear ? Math.abs(releaseYear - leftYear) : Number.MAX_SAFE_INTEGER;
    const rightYearDistance = releaseYear && rightYear ? Math.abs(releaseYear - rightYear) : Number.MAX_SAFE_INTEGER;

    if (leftYearDistance !== rightYearDistance) {
      return leftYearDistance - rightYearDistance;
    }

    return Number(right.popularity ?? 0) - Number(left.popularity ?? 0);
  })[0];

  return toTmdbImageUrl(bestMatch?.poster_path);
};

const enrichPosters = async (movies, token) => {
  if (!token) {
    return movies.map((movie) => ({ ...movie, posterUrl: null }));
  }

  return Promise.all(
    movies.map(async (movie) => {
      try {
        return { ...movie, posterUrl: await findPoster(movie, token) };
      } catch (error) {
        console.warn(`Unable to find a poster for KOBIS movie ${movie.movieCd}.`, error);
        return { ...movie, posterUrl: null };
      }
    })
  );
};

const getDailyBoxOffice = async (apiKey, targetDate) => {
  const url = new URL(KOBIS_DAILY_BOX_OFFICE_URL);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('targetDt', targetDate);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`KOBIS returned ${response.status}.`);
  }

  const payload = await response.json();
  const movies = payload?.boxOfficeResult?.dailyBoxOfficeList;

  if (!Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  return {
    boxOfficeDate: targetDate,
    movies: movies.slice(0, 10).map((movie) => ({
      rank: Number(movie.rank),
      movieCd: String(movie.movieCd),
      movieNm: String(movie.movieNm),
      openDt: typeof movie.openDt === 'string' ? movie.openDt : null,
      audiCnt: Number(movie.audiCnt),
      audiAcc: Number(movie.audiAcc)
    }))
  };
};

export default async () => {
  const apiKey = process.env.KOBIS_API_KEY?.trim();
  const tmdbToken = process.env.TMDB_BEARER_TOKEN?.trim();

  if (!apiKey) {
    return jsonResponse({ error: 'KOBIS API key is not configured.' }, 503);
  }

  try {
    // KOBIS publishes daily figures. Try the previous seven days so early-morning
    // requests continue to show the latest completed aggregation.
    for (let daysAgo = 1; daysAgo <= 7; daysAgo += 1) {
      const boxOffice = await getDailyBoxOffice(apiKey, getPreviousKoreaDate(daysAgo));

      if (boxOffice) {
        return jsonResponse(
          { ...boxOffice, movies: await enrichPosters(boxOffice.movies, tmdbToken) },
          200,
          'public, max-age=900, s-maxage=900'
        );
      }
    }

    return jsonResponse({ error: 'No recent KOBIS box office data is available.' }, 502);
  } catch (error) {
    console.error('Unable to load KOBIS daily box office.', error);
    return jsonResponse({ error: 'Unable to load KOBIS box office data.' }, 502);
  }
};
