import assert from 'node:assert/strict';

import theatricalHandler from '../netlify/functions/tmdb-theatrical.mjs';

const originalFetch = globalThis.fetch;
const originalToken = process.env.TMDB_BEARER_TOKEN;
const originalConsoleError = console.error;

const responseFor = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });

try {
  console.error = () => {};
  process.env.TMDB_BEARER_TOKEN = 'test-token';
  const requestedPaths = [];

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    requestedPaths.push(url.pathname);
    assert.equal(url.searchParams.get('language'), 'ko-KR');
    assert.equal(url.searchParams.get('region'), 'KR');
    assert.equal(init?.headers?.Authorization, 'Bearer test-token');

    if (url.pathname.endsWith('/genre/movie/list')) {
      return responseFor({ genres: [{ id: 28, name: '액션' }] });
    }

    if (url.pathname.endsWith('/movie/now_playing')) {
      return responseFor({
        results: [
          {
            id: 1,
            title: '상영작',
            poster_path: '/now.jpg',
            release_date: '2026-07-20',
            genre_ids: [28],
            overview: '현재 상영 중입니다.'
          }
        ]
      });
    }

    return responseFor({
      results: [
        {
          id: 2,
          title: '개봉 예정작',
          poster_path: null,
          release_date: '2026-08-01',
          genre_ids: [28],
          overview: ''
        }
      ]
    });
  };

  const successfulResponse = await theatricalHandler();
  assert.equal(successfulResponse.status, 200);
  assert.equal(successfulResponse.headers.get('Cache-Control'), 'public, max-age=900, s-maxage=900');
  assert.deepEqual(requestedPaths.sort(), ['/3/genre/movie/list', '/3/movie/now_playing', '/3/movie/upcoming']);
  assert.deepEqual(await successfulResponse.json(), {
    nowPlaying: [
      {
        id: 1,
        title: '상영작',
        posterUrl: 'https://image.tmdb.org/t/p/w500/now.jpg',
        releaseDate: '2026-07-20',
        genres: ['액션'],
        overview: '현재 상영 중입니다.'
      }
    ],
    upcoming: [
      {
        id: 2,
        title: '개봉 예정작',
        posterUrl: null,
        releaseDate: '2026-08-01',
        genres: ['액션'],
        overview: null
      }
    ],
    genres: [{ id: 28, name: '액션' }]
  });

  globalThis.fetch = async () => responseFor({ results: null });
  const invalidPayloadResponse = await theatricalHandler();
  assert.equal(invalidPayloadResponse.status, 502);

  delete process.env.TMDB_BEARER_TOKEN;
  const missingTokenResponse = await theatricalHandler();
  assert.equal(missingTokenResponse.status, 503);
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;

  if (originalToken === undefined) {
    delete process.env.TMDB_BEARER_TOKEN;
  } else {
    process.env.TMDB_BEARER_TOKEN = originalToken;
  }
}

console.log('TMDB theatrical function tests passed.');
