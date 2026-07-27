import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import jitiPackage from 'jiti';

const jiti = jitiPackage(import.meta.url, {
  alias: { '@': resolve('src') },
  interopDefault: true,
  moduleCache: false
});

const { catalogLists, catalogMovies } = await jiti.import('../src/data/catalog.ts');
const { trendingMovies } = await jiti.import('../src/data/home.ts');
const { popularLists, popularRecommendedLists } = await jiti.import('../src/data/popularLists.ts');

const catalogMovieIds = new Set(catalogMovies.map((movie) => movie.id));
const trendingMovieByTitle = new Map(trendingMovies.map((movie) => [movie.title, movie]));

assert.deepEqual(
  trendingMovies.map((movie) => movie.id),
  Array.from({ length: 10 }, (_, index) => `kobis-2025-${index + 1}`),
  'home restores the KOBIS 2025 popular-movie ranking'
);
assert.ok(
  trendingMovies.every((movie) => movie.similarMovies.every((similarMovie) => catalogMovieIds.has(similarMovie.id))),
  'home similar movies always resolve from the recommendation catalog'
);
assert.deepEqual(
  [
    ['주토피아 2', 'https://image.tmdb.org/t/p/w780/ib6v6qUXzez1x2qIOLN7C0yJNPQ.jpg'],
    ['극장판 귀멸의 칼날: 무한성편', 'https://image.tmdb.org/t/p/w780/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg'],
    ['F1 더 무비', 'https://image.tmdb.org/t/p/w780/bvVoP1t2gNvmE9ccSrqR1zcGHGM.jpg'],
    ['미션 임파서블: 파이널 레코닝', 'https://image.tmdb.org/t/p/w780/5nUgyjBem5QctwzQoDyJ3kuE7xh.jpg']
  ].map(([title, posterUrl]) => [title, trendingMovieByTitle.get(title)?.posterUrl]),
  [
    ['주토피아 2', 'https://image.tmdb.org/t/p/w780/ib6v6qUXzez1x2qIOLN7C0yJNPQ.jpg'],
    ['극장판 귀멸의 칼날: 무한성편', 'https://image.tmdb.org/t/p/w780/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg'],
    ['F1 더 무비', 'https://image.tmdb.org/t/p/w780/bvVoP1t2gNvmE9ccSrqR1zcGHGM.jpg'],
    ['미션 임파서블: 파이널 레코닝', 'https://image.tmdb.org/t/p/w780/5nUgyjBem5QctwzQoDyJ3kuE7xh.jpg']
  ],
  'home fallback rankings use the poster that belongs to each highlighted movie'
);
assert.ok(
  catalogLists.every((list) => list.movieIds.every((movieId) => catalogMovieIds.has(movieId))),
  'every popular-list movie exists in the recommendation catalog'
);
assert.deepEqual(
  popularLists.map((list) => ({
    id: list.id,
    title: list.title,
    movieIds: list.moviePreviews.map((movie) => movie.id)
  })),
  popularRecommendedLists.map((list) => ({
    id: list.id,
    title: list.title,
    movieIds: list.moviePreviews.map((movie) => movie.id)
  })),
  'home and recommendation popular lists use the same movies in the same order'
);

console.log('Catalog surface consistency tests passed.');
