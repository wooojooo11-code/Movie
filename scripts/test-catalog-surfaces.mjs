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

assert.equal(new Set(trendingMovies.map((movie) => movie.id)).size, trendingMovies.length, 'home movies are unique');
assert.ok(
  trendingMovies.every((movie) => catalogMovieIds.has(movie.id)),
  'home movies always resolve from the recommendation catalog'
);
assert.ok(
  trendingMovies.every((movie) => movie.similarMovies.every((similarMovie) => catalogMovieIds.has(similarMovie.id))),
  'home similar movies always resolve from the recommendation catalog'
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
