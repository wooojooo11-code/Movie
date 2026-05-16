import { catalogMovies } from '@/data/catalog';
import type { PopularList, PopularListMoviePreview, TrendingMovie } from '@/types/home';

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie]));

const getPopularListMoviePreviews = (movieIds: string[]): PopularListMoviePreview[] =>
  movieIds
    .map((movieId) => movieMap[movieId])
    .filter((movie): movie is (typeof catalogMovies)[number] => Boolean(movie))
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      posterAlt: movie.posterAlt
    }));

export const trendingMovies: TrendingMovie[] = [
  {
    id: 'kobis-2024-1',
    rank: 1,
    title: '파묘',
    audienceLabel: '한국 · 관객 1,191만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_1b4f47605d1347f999840289226491d8.jpg&w=240&h=320&zc=0',
    posterAlt: '파묘 포스터'
  },
  {
    id: 'kobis-2024-2',
    rank: 2,
    title: '범죄도시4',
    audienceLabel: '한국 · 관객 1,150만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_baa027b05dc941479d9fd43225d8373e.jpg&w=240&h=320&zc=0',
    posterAlt: '범죄도시4 포스터'
  },
  {
    id: 'kobis-2024-3',
    rank: 3,
    title: '인사이드 아웃 2',
    audienceLabel: '미국 · 관객 879만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/06/thumb_x192/thn_d230816340e942859e896956d20a9097.jpg&w=240&h=320&zc=0',
    posterAlt: '인사이드 아웃 2 포스터'
  },
  {
    id: 'kobis-2024-4',
    rank: 4,
    title: '베테랑2',
    audienceLabel: '한국 · 관객 752만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/04/thumb_x192/thn_1e9d41ee8be543e38bb7b9a8d218c81c.jpg&w=240&h=320&zc=0',
    posterAlt: '베테랑2 포스터'
  },
  {
    id: 'kobis-2024-5',
    rank: 5,
    title: '파일럿',
    audienceLabel: '한국 · 관객 471만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/07/thumb_x192/thn_29fb6613911f45369c55beb3d62e0b25.jpg&w=240&h=320&zc=0',
    posterAlt: '파일럿 포스터'
  },
  {
    id: 'kobis-2024-6',
    rank: 6,
    title: '웡카',
    audienceLabel: '미국 · 관객 353만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_64e935508d6e4428892d8ffd774afccf.jpg&w=240&h=320&zc=0',
    posterAlt: '웡카 포스터'
  },
  {
    id: 'kobis-2024-7',
    rank: 7,
    title: '모아나 2',
    audienceLabel: '미국 · 관객 337만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/11/thumb_x192/thn_cda99406a3e84de6a53b63f884c0917b.jpg&w=240&h=320&zc=0',
    posterAlt: '모아나 2 포스터'
  },
  {
    id: 'kobis-2024-8',
    rank: 8,
    title: '하얼빈',
    audienceLabel: '한국 · 관객 331만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/12/thumb_x192/thn_24b5559eff184a7d803e4bbed9e45e2b.jpg&w=240&h=320&zc=0',
    posterAlt: '하얼빈 포스터'
  },
  {
    id: 'kobis-2024-9',
    rank: 9,
    title: '데드풀과 울버린',
    audienceLabel: '미국 · 관객 275만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/05/thumb_x192/thn_9b6848ef39284641a622ca5b83bea3f7.jpg&w=240&h=320&zc=0',
    posterAlt: '데드풀과 울버린 포스터'
  },
  {
    id: 'kobis-2024-10',
    rank: 10,
    title: '탈주',
    audienceLabel: '한국 · 관객 256만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/07/thumb_x192/thn_a2e6a978b99e403cbbc0828ae8a3f940.png&w=240&h=320&zc=0',
    posterAlt: '탈주 포스터'
  }
];

export const popularLists: PopularList[] = [
  {
    id: 'rainy-day-movies',
    title: '비 오는 날 보기 좋은 영화',
    saveCount: 2184,
    averageRating: 4.5,
    moviePreviews: getPopularListMoviePreviews(['movie_15', 'movie_19', 'movie_32'])
  },
  {
    id: 'twist-ending-movies',
    title: '반전 있는 영화 모음',
    saveCount: 1032,
    averageRating: 4.3,
    moviePreviews: getPopularListMoviePreviews(['movie_2', 'movie_8', 'movie_26'])
  }
];
