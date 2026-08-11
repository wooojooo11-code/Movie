import { movieCreditsById } from '@/data/movieCredits';
import type { RatedCatalogMovieRecord } from '@/types/recommendation';

export interface TasteAnalysisRanking {
  count: number;
  name: string;
  percentage: number;
}

export interface TasteAnalysisResult {
  actors: TasteAnalysisRanking[];
  analyzedMovieCount: number;
  directors: TasteAnalysisRanking[];
  genres: TasteAnalysisRanking[];
  likedMovieCount: number;
}

type PreferenceScore = {
  count: number;
  lastRatedAt: number;
  score: number;
};

const isLikedRating = (entry: RatedCatalogMovieRecord) =>
  entry.ratingRecord.rawDecision === 'like' || entry.ratingRecord.input.status === 'like';

const getPreferenceWeight = (entry: RatedCatalogMovieRecord) =>
  Math.max(1, entry.ratingRecord.input.rating ?? 3);

const getRatedAtTime = (entry: RatedCatalogMovieRecord) => {
  const timestamp = new Date(entry.ratingRecord.input.answeredAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const addPreference = (
  scores: Map<string, PreferenceScore>,
  name: null | string | undefined,
  entry: RatedCatalogMovieRecord
) => {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return;
  }

  const current = scores.get(normalizedName) ?? {
    count: 0,
    lastRatedAt: 0,
    score: 0
  };

  current.count += 1;
  current.lastRatedAt = Math.max(current.lastRatedAt, getRatedAtTime(entry));
  current.score += getPreferenceWeight(entry);
  scores.set(normalizedName, current);
};

const toRankings = (scores: Map<string, PreferenceScore>, limit: number) => {
  const ranked = [...scores.entries()]
    .sort(([, left], [, right]) =>
      right.score - left.score || right.count - left.count || right.lastRatedAt - left.lastRatedAt
    )
    .slice(0, limit);
  const highestScore = ranked[0]?.[1].score ?? 0;

  return ranked.map(([name, score]) => ({
    name,
    count: score.count,
    percentage: highestScore > 0 ? Math.round((score.score / highestScore) * 100) : 0
  }));
};

export const getTasteAnalysisResult = (
  entries: readonly RatedCatalogMovieRecord[]
): TasteAnalysisResult => {
  const actorScores = new Map<string, PreferenceScore>();
  const directorScores = new Map<string, PreferenceScore>();
  const genreScores = new Map<string, PreferenceScore>();
  const likedEntries = entries.filter(isLikedRating);

  for (const entry of likedEntries) {
    for (const genre of entry.movie.genres) {
      addPreference(genreScores, genre, entry);
    }

    const credits = movieCreditsById[entry.movie.id];
    addPreference(directorScores, credits?.director, entry);

    const selectedActors = entry.ratingRecord.input.favoriteCharacters
      .map((character) => {
        const characterIndex = credits?.characters.indexOf(character) ?? -1;
        return characterIndex >= 0 ? credits?.cast[characterIndex] : null;
      })
      .filter((actor): actor is string => Boolean(actor));
    const actorNames = selectedActors.length > 0 ? selectedActors : (credits?.cast.slice(0, 2) ?? []);

    for (const actor of actorNames) {
      addPreference(actorScores, actor, entry);
    }
  }

  return {
    analyzedMovieCount: entries.length,
    likedMovieCount: likedEntries.length,
    genres: toRankings(genreScores, 4),
    actors: toRankings(actorScores, 3),
    directors: toRankings(directorScores, 3)
  };
};
