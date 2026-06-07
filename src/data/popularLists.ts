import { catalogLists, catalogMovies } from '@/data/catalog';
import type { PopularList, PopularListMoviePreview } from '@/types/home';
import type { RecommendedCatalogList } from '@/types/recommendation';

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie]));

const getPopularListMoviePreviews = (movieIds: string[]): PopularListMoviePreview[] =>
  movieIds
    .map((movieId) => movieMap[movieId])
    .filter((movie): movie is (typeof catalogMovies)[number] => Boolean(movie))
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear,
      genres: movie.genres,
      summaryTags: movie.tags.slice(0, 2),
      posterUrl: movie.posterUrl,
      posterAlt: movie.posterAlt
    }));

const topPopularCatalogLists = [...catalogLists]
  .sort((left, right) => {
    if (right.saveCount !== left.saveCount) {
      return right.saveCount - left.saveCount;
    }

    if (right.averageRating !== left.averageRating) {
      return right.averageRating - left.averageRating;
    }

    return left.title.localeCompare(right.title, 'ko-KR');
  })
  .slice(0, 5);

export const popularLists: PopularList[] = topPopularCatalogLists
  .map((list) => ({
    id: list.id,
    title: list.title,
    saveCount: list.saveCount,
    averageRating: list.averageRating,
    moviePreviews: getPopularListMoviePreviews(list.movieIds)
  }));

export const popularRecommendedLists: RecommendedCatalogList[] = topPopularCatalogLists.map((list) => ({
  ...list,
  recommendationScore: 0,
  moviePreviews: list.movieIds
    .map((movieId) => movieMap[movieId])
    .filter((movie): movie is (typeof catalogMovies)[number] => Boolean(movie))
    .slice(0, 3)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      posterAlt: movie.posterAlt
    })),
  moviePreviewTitles: list.movieIds
    .map((movieId) => movieMap[movieId]?.title)
    .filter((title): title is string => Boolean(title))
    .slice(0, 3)
}));
