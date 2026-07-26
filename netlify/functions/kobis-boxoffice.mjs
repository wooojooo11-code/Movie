const KOBIS_DAILY_BOX_OFFICE_URL =
  'https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json';
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

const jsonResponse = (body, status = 200, cacheControl = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl
    }
  });

const getPreviousKoreaDate = (daysAgo) => {
  const koreaNow = new Date(Date.now() + KOREA_TIME_OFFSET_MS);
  koreaNow.setUTCDate(koreaNow.getUTCDate() - daysAgo);

  const year = koreaNow.getUTCFullYear();
  const month = String(koreaNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(koreaNow.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
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
      audiCnt: Number(movie.audiCnt),
      audiAcc: Number(movie.audiAcc)
    }))
  };
};

export default async () => {
  const apiKey = process.env.KOBIS_API_KEY?.trim();

  if (!apiKey) {
    return jsonResponse({ error: 'KOBIS API key is not configured.' }, 503);
  }

  try {
    // KOBIS publishes daily figures. Try the previous seven days so early-morning
    // requests continue to show the latest completed aggregation.
    for (let daysAgo = 1; daysAgo <= 7; daysAgo += 1) {
      const boxOffice = await getDailyBoxOffice(apiKey, getPreviousKoreaDate(daysAgo));

      if (boxOffice) {
        return jsonResponse(boxOffice, 200, 'public, max-age=900, s-maxage=900');
      }
    }

    return jsonResponse({ error: 'No recent KOBIS box office data is available.' }, 502);
  } catch (error) {
    console.error('Unable to load KOBIS daily box office.', error);
    return jsonResponse({ error: 'Unable to load KOBIS box office data.' }, 502);
  }
};
