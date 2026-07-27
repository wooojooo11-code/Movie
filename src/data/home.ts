import { catalogMovies } from '@/data/catalog';
import type { TrendingMovie, TrendingMovieSimilarPreview } from '@/types/home';

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie]));

const getCatalogMoviePreview = (movieId: string): TrendingMovieSimilarPreview | null => {
  const movie = movieMap[movieId];

  if (!movie) {
    return null;
  }

  return {
    id: movie.id,
    title: movie.title,
    posterUrl: movie.posterUrl,
    posterAlt: movie.posterAlt
  };
};

const getCatalogMoviePreviews = (movieIds: readonly string[]): TrendingMovieSimilarPreview[] =>
  movieIds
    .map((movieId) => getCatalogMoviePreview(movieId))
    .filter((movie): movie is TrendingMovieSimilarPreview => Boolean(movie));

const previousTrendingMovies: TrendingMovie[] = [
  {
    id: 'kobis-2024-1',
    rank: 1,
    title: '파묘',
    audienceLabel: '누적 관객 1,191만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['미스터리', '공포', '스릴러'],
    cast: ['최민식', '김고은', '유해진', '이도현'],
    rating: 7.5,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_1b4f47605d1347f999840289226491d8.jpg&w=240&h=320&zc=0',
    posterAlt: '파묘 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_47', 'movie_59', 'movie_90'])
  },
  {
    id: 'kobis-2024-2',
    rank: 2,
    title: '범죄도시4',
    audienceLabel: '누적 관객 1,150만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['액션', '범죄', '스릴러', '코미디'],
    cast: ['마동석', '김무열', '박지환', '이동휘'],
    rating: 7.2,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_baa027b05dc941479d9fd43225d8373e.jpg&w=240&h=320&zc=0',
    posterAlt: '범죄도시4 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_10', 'movie_28', 'movie_77'])
  },
  {
    id: 'kobis-2024-3',
    rank: 3,
    title: '인사이드 아웃 2',
    audienceLabel: '누적 관객 879만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['애니메이션', '모험', '코미디', '가족'],
    cast: ['에이미 포엘러', '마야 호크', '케이틀린 디버', '리자 라피라'],
    rating: 7.5,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/06/thumb_x192/thn_d230816340e942859e896956d20a9097.jpg&w=240&h=320&zc=0',
    posterAlt: '인사이드 아웃 2 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_11', 'movie_12', 'movie_54'])
  },
  {
    id: 'kobis-2024-4',
    rank: 4,
    title: '베테랑2',
    audienceLabel: '누적 관객 752만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['액션', '범죄', '코미디'],
    cast: ['황정민', '정해인', '오달수', '장윤주'],
    rating: 6.9,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/04/thumb_x192/thn_1e9d41ee8be543e38bb7b9a8d218c81c.jpg&w=240&h=320&zc=0',
    posterAlt: '베테랑2 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_25', 'movie_28', 'movie_77'])
  },
  {
    id: 'kobis-2024-5',
    rank: 5,
    title: '파일럿',
    audienceLabel: '누적 관객 471만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['코미디'],
    cast: ['조정석', '이주명', '한선화', '신승호'],
    rating: 7.4,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/07/thumb_x192/thn_29fb6613911f45369c55beb3d62e0b25.jpg&w=240&h=320&zc=0',
    posterAlt: '파일럿 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_16', 'movie_20', 'movie_24'])
  },
  {
    id: 'kobis-2024-6',
    rank: 6,
    title: '웡카',
    audienceLabel: '누적 관객 353만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['코미디', '가족', '판타지'],
    cast: ['티모시 샬라메', '칼라 레인', '휴 그랜트', '키건마이클 키'],
    rating: 7.0,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/01/thumb_x192/thn_64e935508d6e4428892d8ffd774afccf.jpg&w=240&h=320&zc=0',
    posterAlt: '웡카 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_4', 'movie_24', 'movie_54'])
  },
  {
    id: 'kobis-2024-7',
    rank: 7,
    title: '모아나 2',
    audienceLabel: '누적 관객 337만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['모험', '애니메이션', '코미디', '가족', '판타지'],
    cast: ['아울리 크러발료', '드웨인 존슨', '후알라이 청', '로즈 마타페오'],
    rating: 7.0,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/11/thumb_x192/thn_cda99406a3e84de6a53b63f884c0917b.jpg&w=240&h=320&zc=0',
    posterAlt: '모아나 2 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_31', 'movie_54', 'movie_55'])
  },
  {
    id: 'kobis-2024-8',
    rank: 8,
    title: '하얼빈',
    audienceLabel: '누적 관객 331만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['액션', '드라마', '역사', '전쟁'],
    cast: ['현빈', '박정민', '조우진', '전여빈'],
    rating: 7.3,
    posterUrl: 'https://image.tmdb.org/t/p/w780/oNA9eRaFCLlFKRZlzYEldPZlFpg.jpg',
    posterAlt: '하얼빈 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_18', 'movie_48', 'movie_65'])
  },
  {
    id: 'kobis-2024-9',
    rank: 9,
    title: '데드풀과 울버린',
    audienceLabel: '누적 관객 275만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['액션', '코미디', 'SF'],
    cast: ['라이언 레이놀즈', '휴 잭맨', '에마 코린', '매튜 맥패디언'],
    rating: 7.6,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/05/thumb_x192/thn_9b6848ef39284641a622ca5b83bea3f7.jpg&w=240&h=320&zc=0',
    posterAlt: '데드풀과 울버린 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_31', 'movie_73', 'movie_76'])
  },
  {
    id: 'kobis-2024-10',
    rank: 10,
    title: '탈주',
    audienceLabel: '누적 관객 256만',
    sourceLabel: 'KOBIS 2024 연간 박스오피스',
    genres: ['액션', '드라마', '스릴러'],
    cast: ['이제훈', '구교환', '홍사빈', '서현우'],
    rating: 7.3,
    posterUrl:
      'http://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/07/thumb_x192/thn_a2e6a978b99e403cbbc0828ae8a3f940.png&w=240&h=320&zc=0',
    posterAlt: '탈주 포스터',
    similarMovies: getCatalogMoviePreviews(['movie_21', 'movie_43', 'movie_68'])
  }
];

type LatestTrendingMovieSelection = {
  catalogMovieId: null | string;
  rank: number;
  title: string;
  audienceLabel: string;
  genres: string[];
  cast: string[];
  rating: number;
  similarMovieIds: string[];
  posterUrl?: string;
};

const latestTrendingMovieSelections: readonly LatestTrendingMovieSelection[] = [
  {
    catalogMovieId: 'movie_142',
    rank: 1,
    title: '주토피아 2',
    audienceLabel: '연간 관객 770만',
    genres: ['애니메이션', '모험', '코미디'],
    cast: ['지니퍼 굿윈', '제이슨 베이트먼', '키 호이 콴'],
    rating: 7.7,
    similarMovieIds: ['movie_31', 'movie_54', 'movie_55']
  },
  {
    catalogMovieId: 'movie_139',
    rank: 2,
    title: '극장판 귀멸의 칼날: 무한성편',
    audienceLabel: '연간 관객 569만',
    genres: ['애니메이션', '액션', '판타지'],
    cast: ['하나에 나츠키', '키토 아카리', '시모노 히로'],
    rating: 7.8,
    similarMovieIds: ['movie_31', 'movie_73', 'movie_76']
  },
  {
    catalogMovieId: null,
    rank: 3,
    title: '좀비딸',
    audienceLabel: '연간 관객 564만',
    genres: ['코미디', '드라마'],
    cast: ['조정석', '이정은', '조여정'],
    rating: 7.4,
    similarMovieIds: ['movie_16', 'movie_20', 'movie_24'],
    posterUrl:
      'https://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2025/08/thumb_x192/thn_424f0d4c7d984ff1b8a2d27cd4d19f29.jpg&w=240&h=320&zc=0'
  },
  {
    catalogMovieId: 'movie_212',
    rank: 4,
    title: 'F1 더 무비',
    audienceLabel: '연간 관객 521만',
    genres: ['드라마', '액션'],
    cast: ['브래드 피트', '댐슨 이드리스', '하비에르 바르뎀'],
    rating: 7.6,
    similarMovieIds: ['movie_14', 'movie_17', 'movie_23']
  },
  {
    catalogMovieId: 'movie_138',
    rank: 5,
    title: '아바타: 불과 재',
    audienceLabel: '연간 관객 456만',
    genres: ['SF', '모험', '액션'],
    cast: ['샘 워싱턴', '조 샐다나', '시고니 위버'],
    rating: 7.3,
    similarMovieIds: ['movie_33', 'movie_37', 'movie_38']
  },
  {
    catalogMovieId: null,
    rank: 6,
    title: '극장판 체인소 맨: 레제편',
    audienceLabel: '연간 관객 343만',
    genres: ['애니메이션', '액션', '판타지'],
    cast: ['토야 키쿠노스케', '우에다 레이나', '이자와 시오리'],
    rating: 7.6,
    similarMovieIds: ['movie_31', 'movie_73', 'movie_76'],
    posterUrl:
      'https://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2025/09/thumb_x192/thn_fb5e3ca88d744654a0fc29fa706a4a9f.jpg&w=240&h=320&zc=0'
  },
  {
    catalogMovieId: null,
    rank: 7,
    title: '미션 임파서블: 파이널 레코닝',
    audienceLabel: '연간 관객 339만',
    genres: ['액션', '스릴러', '모험'],
    cast: ['톰 크루즈', '헤일리 앳웰', '사이먼 페그'],
    rating: 7.2,
    similarMovieIds: ['movie_10', 'movie_17', 'movie_25'],
    posterUrl: 'https://image.tmdb.org/t/p/w780/5nUgyjBem5QctwzQoDyJ3kuE7xh.jpg'
  },
  {
    catalogMovieId: null,
    rank: 8,
    title: '야당',
    audienceLabel: '연간 관객 338만',
    genres: ['범죄', '액션', '드라마'],
    cast: ['강하늘', '유해진', '박해준'],
    rating: 7.2,
    similarMovieIds: ['movie_18', 'movie_25', 'movie_28'],
    posterUrl:
      'https://www.koreanfilm.or.kr/timthumb.php?src=http://kobis.or.kr/common/mast/movie/2024/02/thumb_x192/thn_52d99a2ed6ac4af48b2e90ca1594b2ba.jpg&w=240&h=320&zc=0'
  },
  {
    catalogMovieId: 'movie_346',
    rank: 9,
    title: '미키 17',
    audienceLabel: '연간 관객 301만',
    genres: ['SF', '코미디', '드라마'],
    cast: ['로버트 패틴슨', '나오미 애키', '스티븐 연'],
    rating: 7.0,
    similarMovieIds: ['movie_33', 'movie_34', 'movie_36']
  },
  {
    catalogMovieId: 'movie_508',
    rank: 10,
    title: '어쩔수가없다',
    audienceLabel: '연간 관객 294만',
    genres: ['스릴러', '범죄', '드라마'],
    cast: ['이병헌', '손예진', '박희순'],
    rating: 7.5,
    similarMovieIds: ['movie_18', 'movie_21', 'movie_29']
  }
] as const;

const latestTrendingMovies = latestTrendingMovieSelections
  .map((selection): TrendingMovie | null => {
    const catalogMovie = selection.catalogMovieId ? movieMap[selection.catalogMovieId] : null;
    const posterUrl = catalogMovie?.posterUrl ?? selection.posterUrl;

    if (!posterUrl) {
      return null;
    }

    return {
      id: `kobis-2025-${selection.rank}`,
      rank: selection.rank,
      title: selection.title,
      audienceLabel: selection.audienceLabel,
      sourceLabel: 'KOBIS 2025 연간 박스오피스',
      genres: [...selection.genres],
      cast: [...selection.cast],
      rating: selection.rating,
      posterUrl,
      posterAlt: `${selection.title} 포스터`,
      similarMovies: getCatalogMoviePreviews(selection.similarMovieIds)
    };
  })
  .filter((movie): movie is TrendingMovie => movie !== null);

export const trendingMovies = latestTrendingMovies.length > 0 ? latestTrendingMovies : previousTrendingMovies;
