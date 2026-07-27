import assert from 'node:assert/strict';

import kobisHandler from '../netlify/functions/kobis-boxoffice.mjs';

const originalFetch = globalThis.fetch;
const originalKobisKey = process.env.KOBIS_API_KEY;
const originalTmdbToken = process.env.TMDB_BEARER_TOKEN;

const responseFor = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });

try {
  process.env.KOBIS_API_KEY = 'test-kobis-key';
  process.env.TMDB_BEARER_TOKEN = 'test-tmdb-token';

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));

    if (url.pathname.endsWith('/boxoffice/searchDailyBoxOfficeList.json')) {
      assert.equal(url.searchParams.get('key'), 'test-kobis-key');
      assert.match(url.searchParams.get('targetDt') ?? '', /^\d{8}$/);

      return responseFor({
        boxOfficeResult: {
          dailyBoxOfficeList: [
            {
              rank: '1',
              movieCd: '20260001',
              movieNm: '같은 제목',
              openDt: '2026-07-20',
              audiCnt: '1234',
              audiAcc: '5678'
            }
          ]
        }
      });
    }

    assert.equal(url.pathname, '/3/search/movie');
    assert.equal(url.searchParams.get('language'), 'ko-KR');
    assert.equal(url.searchParams.get('query'), '같은 제목');
    assert.equal(url.searchParams.get('year'), '2026');
    assert.equal(init?.headers?.Authorization, 'Bearer test-tmdb-token');

    return responseFor({
      results: [
        { title: '같은 제목', release_date: '2016-07-20', poster_path: '/old.jpg', popularity: 200 },
        { title: '같은 제목', release_date: '2026-07-20', poster_path: '/current.jpg', popularity: 1 },
        { title: '다른 제목', release_date: '2026-07-20', poster_path: '/wrong.jpg', popularity: 999 }
      ]
    });
  };

  const response = await kobisHandler();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=900, s-maxage=900');

  const payload = await response.json();
  assert.deepEqual(payload.movies, [
    {
      rank: 1,
      movieCd: '20260001',
      movieNm: '같은 제목',
      openDt: '2026-07-20',
      audiCnt: 1234,
      audiAcc: 5678,
      posterUrl: 'https://image.tmdb.org/t/p/w500/current.jpg'
    }
  ]);

  delete process.env.TMDB_BEARER_TOKEN;
  const noTmdbResponse = await kobisHandler();
  assert.equal((await noTmdbResponse.json()).movies[0].posterUrl, null);
} finally {
  globalThis.fetch = originalFetch;

  if (originalKobisKey === undefined) {
    delete process.env.KOBIS_API_KEY;
  } else {
    process.env.KOBIS_API_KEY = originalKobisKey;
  }

  if (originalTmdbToken === undefined) {
    delete process.env.TMDB_BEARER_TOKEN;
  } else {
    process.env.TMDB_BEARER_TOKEN = originalTmdbToken;
  }
}

console.log('KOBIS poster matching tests passed.');
