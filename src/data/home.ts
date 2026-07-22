import { catalogMovies } from '@/data/catalog';
import type { CatalogMovie } from '@/types/recommendation';
import type { TrendingMovie, TrendingMovieSimilarPreview } from '@/types/home';

const popularCatalogMovies = [...catalogMovies]
  .filter((movie) => movie.releaseYear >= 2023)
  .sort((left, right) => {
    if ((right.voteCount ?? 0) !== (left.voteCount ?? 0)) {
      return (right.voteCount ?? 0) - (left.voteCount ?? 0);
    }

    if ((right.voteAverage ?? 0) !== (left.voteAverage ?? 0)) {
      return (right.voteAverage ?? 0) - (left.voteAverage ?? 0);
    }

    return right.releaseYear - left.releaseYear;
  })
  .slice(0, 10);

const getOverlapCount = <T>(left: readonly T[], right: readonly T[]) => {
  const rightValues = new Set(right);

  return left.filter((value) => rightValues.has(value)).length;
};

const getSimilarMovies = (movie: CatalogMovie): TrendingMovieSimilarPreview[] =>
  catalogMovies
    .filter((candidate) => candidate.id !== movie.id)
    .map((candidate) => ({
      movie: candidate,
      score:
        getOverlapCount(movie.genreIds ?? [], candidate.genreIds ?? []) * 3 +
        getOverlapCount(movie.tags, candidate.tags) * 2 +
        (candidate.voteAverage ?? 0) / 10
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (right.movie.voteCount ?? 0) - (left.movie.voteCount ?? 0);
    })
    .slice(0, 3)
    .map(({ movie: candidate }) => ({
      id: candidate.id,
      title: candidate.title,
      posterUrl: candidate.posterUrl,
      posterAlt: candidate.posterAlt
    }));

const formatVoteCount = (count: null | number | undefined) => (count ?? 0).toLocaleString('ko-KR');

export const trendingMovies: TrendingMovie[] = popularCatalogMovies.map((movie, index) => ({
  id: movie.id,
  rank: index + 1,
  title: movie.title,
  audienceLabel: `TMDB 평가 ${formatVoteCount(movie.voteCount)}개`,
  sourceLabel: `TMDB 인기 작품 · ${movie.releaseYear}`,
  genres: movie.genres,
  cast: movie.characters.slice(0, 4),
  rating: movie.voteAverage ?? 0,
  posterUrl: movie.posterUrl,
  posterAlt: movie.posterAlt,
  similarMovies: getSimilarMovies(movie)
}));
