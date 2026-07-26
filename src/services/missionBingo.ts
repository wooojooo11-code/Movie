import { catalogMovies } from '@/data/catalog';
import { movieCreditsById } from '@/data/movieCredits';
import type { StoredRatingRecord } from '@/types/recommendation';

export interface MovieMission {
  description: string;
  id: string;
  label: string;
  progress: number;
  target: number;
}

export const missionBingoBoardIds = ['taste', 'genre', 'cinema'] as const;
export type MissionBingoBoardId = (typeof missionBingoBoardIds)[number];

export const defaultMissionBingoBoardId: MissionBingoBoardId = 'taste';

export interface MissionBingo {
  actorName: null | string;
  boardDescription: string;
  boardId: MissionBingoBoardId;
  boardTitle: string;
  completedCellCount: number;
  completedLineCount: number;
  missions: MovieMission[];
}

interface MissionContext {
  actorMissionProgress: number;
  actorName: null | string;
  likedMovieCount: number;
  watchedMovieIds: ReadonlySet<string>;
}

const movieMap = Object.fromEntries(catalogMovies.map((movie) => [movie.id, movie]));

export const isMissionBingoBoardId = (value: string | null): value is MissionBingoBoardId =>
  missionBingoBoardIds.includes(value as MissionBingoBoardId);

export const getNextMissionBingoBoardId = (currentBoardId: MissionBingoBoardId) => {
  const currentIndex = missionBingoBoardIds.indexOf(currentBoardId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % missionBingoBoardIds.length : 0;
  return missionBingoBoardIds[nextIndex];
};

const countWatchedMovies = (
  watchedMovieIds: ReadonlySet<string>,
  predicate: (movieId: string) => boolean
) => [...watchedMovieIds].filter(predicate).length;

const countMoviesByGenre = (watchedMovieIds: ReadonlySet<string>, genre: string) =>
  countWatchedMovies(watchedMovieIds, (movieId) => movieMap[movieId]?.genres.includes(genre) ?? false);

const countMoviesByReleaseYear = (
  watchedMovieIds: ReadonlySet<string>,
  minimumYear: number,
  maximumYear = Infinity
) =>
  countWatchedMovies(watchedMovieIds, (movieId) => {
    const releaseYear = movieMap[movieId]?.releaseYear ?? -Infinity;
    return releaseYear >= minimumYear && releaseYear <= maximumYear;
  });

const countWatchedGenres = (watchedMovieIds: ReadonlySet<string>) =>
  new Set(
    [...watchedMovieIds].flatMap((movieId) => movieMap[movieId]?.genres ?? [])
  ).size;

const getActorAppearanceCount = (actorName: string) =>
  Object.values(movieCreditsById).filter((profile) => profile.cast.includes(actorName)).length;

const getFavoriteActor = (ratings: readonly StoredRatingRecord[]) => {
  const favoriteActors = new Map<string, { lastRatedAt: number; selections: number }>();

  for (const rating of ratings) {
    if (rating.rawDecision !== 'like' && rating.input.status !== 'like') {
      continue;
    }

    const credits = movieCreditsById[rating.input.movieId];

    if (!credits) {
      continue;
    }

    const ratedAt = new Date(rating.input.answeredAt).getTime();

    for (const favoriteCharacter of rating.input.favoriteCharacters) {
      const characterIndex = credits.characters.indexOf(favoriteCharacter);
      const actorName = characterIndex >= 0 ? credits.cast[characterIndex] : null;

      if (!actorName || getActorAppearanceCount(actorName) < 3) {
        continue;
      }

      const current = favoriteActors.get(actorName);
      favoriteActors.set(actorName, {
        selections: (current?.selections ?? 0) + 1,
        lastRatedAt: Math.max(current?.lastRatedAt ?? 0, Number.isFinite(ratedAt) ? ratedAt : 0)
      });
    }
  }

  const [favoriteActor] = [...favoriteActors.entries()].sort(([, left], [, right]) =>
    right.selections - left.selections || right.lastRatedAt - left.lastRatedAt
  )[0] ?? [];

  return favoriteActor ?? null;
};

const getMostWatchedDirectorCount = (watchedMovieIds: ReadonlySet<string>) => {
  const directorCounts = new Map<string, number>();

  for (const movieId of watchedMovieIds) {
    const director = movieCreditsById[movieId]?.director;

    if (director) {
      directorCounts.set(director, (directorCounts.get(director) ?? 0) + 1);
    }
  }

  return Math.max(0, ...directorCounts.values());
};

const createActorMission = ({ actorName, actorMissionProgress }: MissionContext): MovieMission => ({
  id: 'favorite-actor',
  label: actorName ? `${actorName} 출연작` : '좋아한 배우 출연작',
  description: actorName
    ? '좋다고 평가한 배우를 따라가요'
    : '상세 평가에서 배우를 고르면 맞춤 설정돼요',
  progress: actorMissionProgress,
  target: 3
});

const buildTasteMissions = (context: MissionContext): MovieMission[] => {
  const { likedMovieCount, watchedMovieIds } = context;

  return [
    createActorMission(context),
    {
      id: 'action',
      label: '액션 영화',
      description: '짜릿한 한 편을 더해요',
      progress: countMoviesByGenre(watchedMovieIds, '액션'),
      target: 3
    },
    {
      id: 'highly-rated',
      label: '평점 8점대 명작',
      description: '많은 사랑을 받은 작품을 만나요',
      progress: countWatchedMovies(watchedMovieIds, (movieId) => (movieMap[movieId]?.voteAverage ?? 0) >= 8),
      target: 3
    },
    {
      id: 'director',
      label: '한 감독의 세계',
      description: '같은 감독의 작품을 이어 봐요',
      progress: getMostWatchedDirectorCount(watchedMovieIds),
      target: 2
    },
    {
      id: 'short-runtime',
      label: '100분 이하 영화',
      description: '부담 없이 한 편 완주해요',
      progress: countWatchedMovies(
        watchedMovieIds,
        (movieId) => (movieMap[movieId]?.runtimeMinutes ?? Infinity) <= 100
      ),
      target: 2
    },
    {
      id: 'classic',
      label: '2000년 이전 영화',
      description: '시대를 건너온 이야기를 만나요',
      progress: countMoviesByReleaseYear(watchedMovieIds, 0, 1999),
      target: 2
    },
    {
      id: 'animation',
      label: '애니메이션',
      description: '새로운 세계로 떠나 봐요',
      progress: countMoviesByGenre(watchedMovieIds, '애니메이션'),
      target: 2
    },
    {
      id: 'drama',
      label: '드라마 영화',
      description: '긴 여운을 남길 이야기를 골라요',
      progress: countMoviesByGenre(watchedMovieIds, '드라마'),
      target: 2
    },
    {
      id: 'likes',
      label: '좋아요 영화',
      description: '내 취향 지도를 더 선명하게 해요',
      progress: likedMovieCount,
      target: 5
    }
  ];
};

const buildGenreMissions = ({ watchedMovieIds }: MissionContext): MovieMission[] => [
  {
    id: 'action',
    label: '액션 영화',
    description: '속도감 있는 세계로 뛰어들어요',
    progress: countMoviesByGenre(watchedMovieIds, '액션'),
    target: 3
  },
  {
    id: 'comedy',
    label: '코미디 영화',
    description: '가볍게 웃을 한 편을 골라요',
    progress: countMoviesByGenre(watchedMovieIds, '코미디'),
    target: 2
  },
  {
    id: 'thriller',
    label: '스릴러 영화',
    description: '긴장감 넘치는 이야기를 만나요',
    progress: countMoviesByGenre(watchedMovieIds, '스릴러'),
    target: 2
  },
  {
    id: 'science-fiction',
    label: 'SF 영화',
    description: '낯선 상상 속으로 떠나요',
    progress: countMoviesByGenre(watchedMovieIds, 'SF'),
    target: 2
  },
  {
    id: 'fantasy',
    label: '판타지 영화',
    description: '마법 같은 세계를 경험해요',
    progress: countMoviesByGenre(watchedMovieIds, '판타지'),
    target: 2
  },
  {
    id: 'romance',
    label: '로맨스 영화',
    description: '설레는 이야기를 한 편 더해요',
    progress: countMoviesByGenre(watchedMovieIds, '로맨스'),
    target: 2
  },
  {
    id: 'horror',
    label: '공포 영화',
    description: '등골 서늘한 밤을 즐겨요',
    progress: countMoviesByGenre(watchedMovieIds, '공포'),
    target: 2
  },
  {
    id: 'mystery',
    label: '미스터리 영화',
    description: '단서를 따라 결말을 추리해요',
    progress: countMoviesByGenre(watchedMovieIds, '미스터리'),
    target: 2
  },
  {
    id: 'animation',
    label: '애니메이션',
    description: '새로운 세계로 떠나 봐요',
    progress: countMoviesByGenre(watchedMovieIds, '애니메이션'),
    target: 2
  }
];

const buildCinemaMissions = (context: MissionContext): MovieMission[] => {
  const { likedMovieCount, watchedMovieIds } = context;

  return [
    createActorMission(context),
    {
      id: 'director',
      label: '한 감독의 세계',
      description: '같은 감독의 작품을 이어 봐요',
      progress: getMostWatchedDirectorCount(watchedMovieIds),
      target: 2
    },
    {
      id: 'long-runtime',
      label: '135분 이상 영화',
      description: '한 편에 푹 빠지는 시간을 가져요',
      progress: countWatchedMovies(
        watchedMovieIds,
        (movieId) => (movieMap[movieId]?.runtimeMinutes ?? 0) >= 135
      ),
      target: 2
    },
    {
      id: 'classic',
      label: '2000년 이전 영화',
      description: '시대를 건너온 이야기를 만나요',
      progress: countMoviesByReleaseYear(watchedMovieIds, 0, 1999),
      target: 2
    },
    {
      id: 'millennium',
      label: '2000년대 영화',
      description: '밀레니엄 감성의 영화를 골라요',
      progress: countMoviesByReleaseYear(watchedMovieIds, 2000, 2009),
      target: 2
    },
    {
      id: 'recent',
      label: '2020년 이후 영화',
      description: '최근 작품을 새롭게 만나 봐요',
      progress: countMoviesByReleaseYear(watchedMovieIds, 2020),
      target: 3
    },
    {
      id: 'highly-rated',
      label: '평점 8점대 명작',
      description: '많은 사랑을 받은 작품을 만나요',
      progress: countWatchedMovies(watchedMovieIds, (movieId) => (movieMap[movieId]?.voteAverage ?? 0) >= 8),
      target: 3
    },
    {
      id: 'genre-explorer',
      label: '서로 다른 장르',
      description: '새로운 취향의 가능성을 열어 봐요',
      progress: countWatchedGenres(watchedMovieIds),
      target: 5
    },
    {
      id: 'likes',
      label: '좋아요 영화',
      description: '내 취향 지도를 더 선명하게 해요',
      progress: likedMovieCount,
      target: 5
    }
  ];
};

const missionBoardDetails: Record<
  MissionBingoBoardId,
  { description: string; missions: (context: MissionContext) => MovieMission[]; title: string }
> = {
  taste: {
    title: '취향 탐험 빙고',
    description: '좋아하는 배우부터 새로운 명작까지, 취향을 넓혀 봐요.',
    missions: buildTasteMissions
  },
  genre: {
    title: '장르 도전 빙고',
    description: '평소 고르지 않던 장르를 한 칸씩 채워 봐요.',
    missions: buildGenreMissions
  },
  cinema: {
    title: '시네마 산책 빙고',
    description: '시대와 러닝타임을 넘나들며 영화를 여행해요.',
    missions: buildCinemaMissions
  }
};

export const buildMissionBingo = (
  ratings: readonly StoredRatingRecord[],
  boardId: MissionBingoBoardId = defaultMissionBingoBoardId
): MissionBingo => {
  const watchedMovieIds = new Set(
    ratings.map((rating) => rating.input.movieId).filter((movieId) => movieMap[movieId])
  );
  const actorName = getFavoriteActor(ratings);
  const actorMissionProgress = actorName
    ? countWatchedMovies(watchedMovieIds, (movieId) =>
        movieCreditsById[movieId]?.cast.includes(actorName)
      )
    : 0;
  const likedMovieCount = ratings.filter(
    (rating) => rating.rawDecision === 'like' || rating.input.status === 'like'
  ).length;
  const board = missionBoardDetails[boardId];
  const missions = board.missions({
    actorMissionProgress,
    actorName,
    likedMovieCount,
    watchedMovieIds
  });
  const completed = missions.map((mission) => mission.progress >= mission.target);
  const bingoLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return {
    actorName,
    boardDescription: board.description,
    boardId,
    boardTitle: board.title,
    missions,
    completedCellCount: completed.filter(Boolean).length,
    completedLineCount: bingoLines.filter((line) => line.every((index) => completed[index])).length
  };
};
