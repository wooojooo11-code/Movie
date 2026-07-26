import { movieCreditsById } from '@/data/movieCredits';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';

export interface TastePersonRanking {
  averageRating: null | number;
  count: number;
  name: string;
}

export interface TasteInsights {
  actors: TastePersonRanking[];
  directors: TastePersonRanking[];
}

type PersonScore = {
  lastRatedAt: number;
  ratingCount: number;
  ratingTotal: number;
  selectionCount: number;
};

const isLikedRating = (entry: RatedCatalogMovieRecord) =>
  entry.ratingRecord.rawDecision === 'like' || entry.ratingRecord.input.status === 'like';

const getRatedAtTime = (entry: RatedCatalogMovieRecord) => {
  const timestamp = new Date(entry.ratingRecord.input.answeredAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const addPersonScore = (
  scores: Map<string, PersonScore>,
  name: null | string | undefined,
  entry: RatedCatalogMovieRecord
) => {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return;
  }

  const current = scores.get(normalizedName) ?? {
    selectionCount: 0,
    ratingTotal: 0,
    ratingCount: 0,
    lastRatedAt: 0
  };
  const rating = entry.ratingRecord.input.rating;

  current.selectionCount += 1;
  current.lastRatedAt = Math.max(current.lastRatedAt, getRatedAtTime(entry));

  if (rating != null) {
    current.ratingTotal += rating;
    current.ratingCount += 1;
  }

  scores.set(normalizedName, current);
};

const toRankings = (scores: Map<string, PersonScore>) =>
  [...scores.entries()]
    .sort(([, left], [, right]) => {
      const leftAverage = left.ratingCount > 0 ? left.ratingTotal / left.ratingCount : 0;
      const rightAverage = right.ratingCount > 0 ? right.ratingTotal / right.ratingCount : 0;

      return (
        right.selectionCount - left.selectionCount ||
        rightAverage - leftAverage ||
        right.lastRatedAt - left.lastRatedAt
      );
    })
    .slice(0, 3)
    .map(([name, score]) => ({
      name,
      count: score.selectionCount,
      averageRating:
        score.ratingCount > 0 ? Math.round((score.ratingTotal / score.ratingCount) * 10) / 10 : null
    }));

export const getTasteInsights = (
  entries: readonly RatedCatalogMovieRecord[]
): TasteInsights => {
  const actorScores = new Map<string, PersonScore>();
  const directorScores = new Map<string, PersonScore>();

  for (const entry of entries) {
    if (!isLikedRating(entry)) {
      continue;
    }

    const credits = movieCreditsById[entry.movie.id];

    addPersonScore(directorScores, credits?.director, entry);

    for (const favoriteCharacter of entry.ratingRecord.input.favoriteCharacters) {
      const characterIndex = credits?.characters.indexOf(favoriteCharacter) ?? -1;
      addPersonScore(actorScores, characterIndex >= 0 ? credits?.cast[characterIndex] : null, entry);
    }
  }

  return {
    actors: toRankings(actorScores),
    directors: toRankings(directorScores)
  };
};
