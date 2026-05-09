import type { PopularList, TrendingMovie } from '@/types/home';

export const trendingMovies: TrendingMovie[] = [
  {
    id: 'popular-1',
    rank: 1,
    title: '인기 영화 1',
    genre: '액션 · 드라마',
    averageRating: 4.3,
    posterUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=720&q=80',
    posterAlt: '어두운 영화관 좌석'
  },
  {
    id: 'popular-2',
    rank: 2,
    title: '인기 영화 2',
    genre: '미스터리 · 스릴러',
    averageRating: 4.1,
    posterUrl:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=720&q=80',
    posterAlt: '영화 감상 분위기의 팝콘과 상영관'
  },
  {
    id: 'popular-3',
    rank: 3,
    title: '인기 영화 3',
    genre: '로맨스 · 코미디',
    averageRating: 4.0,
    posterUrl:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=720&q=80',
    posterAlt: '영화관 스크린 앞 좌석'
  },
  {
    id: 'popular-4',
    rank: 4,
    title: '인기 영화 4',
    genre: 'SF · 어드벤처',
    averageRating: 4.2,
    posterUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=720&q=80',
    posterAlt: '영화 필름과 팝콘'
  },
  {
    id: 'popular-5',
    rank: 5,
    title: '인기 영화 5',
    genre: '드라마 · 가족',
    averageRating: 3.9,
    posterUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=720&q=80',
    posterAlt: '영화관의 붉은 좌석'
  },
  {
    id: 'popular-6',
    rank: 6,
    title: '인기 영화 6',
    genre: '범죄 · 느와르',
    averageRating: 4.4,
    posterUrl:
      'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=720&q=80',
    posterAlt: '어두운 조명의 영화 장면 같은 거리'
  },
  {
    id: 'popular-7',
    rank: 7,
    title: '인기 영화 7',
    genre: '애니메이션 · 판타지',
    averageRating: 4.1,
    posterUrl:
      'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=720&q=80',
    posterAlt: '필름 릴과 영화 장비'
  },
  {
    id: 'popular-8',
    rank: 8,
    title: '인기 영화 8',
    genre: '공포 · 미스터리',
    averageRating: 3.8,
    posterUrl:
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=720&q=80',
    posterAlt: '어두운 분위기의 조명'
  },
  {
    id: 'popular-9',
    rank: 9,
    title: '인기 영화 9',
    genre: '음악 · 드라마',
    averageRating: 4.0,
    posterUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=720&q=80',
    posterAlt: '카메라 장비와 촬영 현장'
  },
  {
    id: 'popular-10',
    rank: 10,
    title: '인기 영화 10',
    genre: '액션 · 스릴러',
    averageRating: 4.2,
    posterUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=720&q=80',
    posterAlt: '어두운 영화관 스크린'
  }
];

export const popularLists: PopularList[] = [
  {
    id: 'rainy-day-movies',
    title: '비 오는 날 보기 좋은 영화',
    saveCount: 2184,
    averageRating: 4.5
  },
  {
    id: 'twist-ending-movies',
    title: '반전 있는 영화 모음',
    saveCount: 1032,
    averageRating: 4.3
  }
];
