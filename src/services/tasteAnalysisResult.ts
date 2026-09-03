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
  tags: TasteAnalysisRanking[];
}

type PreferenceScore = {
  count: number;
  lastRatedAt: number;
  score: number;
};

const isLikedRating = (entry: RatedCatalogMovieRecord) =>
  entry.ratingRecord.rawDecision === 'like' || entry.ratingRecord.input.status === 'like';

const getPreferenceWeight = (entry: RatedCatalogMovieRecord) => {
  const rating = entry.ratingRecord.input.rating;

  if (typeof rating === 'number') {
    return Math.max(0.5, Math.min(5, rating));
  }

  if (entry.ratingRecord.rawDirection === 'right') {
    return 4;
  }

  if (entry.ratingRecord.rawDirection === 'up') {
    return 2.5;
  }

  return 3.5;
};

const getRatedAtTime = (entry: RatedCatalogMovieRecord) => {
  const timestamp = new Date(entry.ratingRecord.input.answeredAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const addPreference = (
  scores: Map<string, PreferenceScore>,
  name: null | string | undefined,
  entry: RatedCatalogMovieRecord,
  weight = getPreferenceWeight(entry)
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
  current.score += weight;
  scores.set(normalizedName, current);
};

const toRankings = (scores: Map<string, PreferenceScore>, limit: number) => {
  const totalScore = [...scores.values()].reduce((total, preference) => total + preference.score, 0);
  const ranked = [...scores.entries()]
    .sort(([, left], [, right]) =>
      right.score - left.score || right.count - left.count || right.lastRatedAt - left.lastRatedAt
    )
    .slice(0, limit);

  return ranked.map(([name, score]) => ({
    name,
    count: score.count,
    percentage: totalScore > 0 ? Math.round((score.score / totalScore) * 100) : 0
  }));
};

export const getTasteAnalysisResult = (
  entries: readonly RatedCatalogMovieRecord[]
): TasteAnalysisResult => {
  const actorScores = new Map<string, PreferenceScore>();
  const directorScores = new Map<string, PreferenceScore>();
  const genreScores = new Map<string, PreferenceScore>();
  const tagScores = new Map<string, PreferenceScore>();
  const likedEntries = entries.filter(isLikedRating);

  for (const entry of likedEntries) {
    const entryWeight = getPreferenceWeight(entry);
    const genreWeight = entry.movie.genres.length > 0 ? entryWeight / entry.movie.genres.length : entryWeight;

    for (const genre of entry.movie.genres) {
      addPreference(genreScores, genre, entry, genreWeight);
    }

    const uniqueTags = [...new Set(entry.movie.tags.map((tag) => tag.trim()).filter(Boolean))];
    const tagWeight = uniqueTags.length > 0 ? entryWeight / uniqueTags.length : entryWeight;

    for (const tag of uniqueTags) {
      addPreference(tagScores, tag, entry, tagWeight);
    }

    const credits = movieCreditsById[entry.movie.id];
    addPreference(directorScores, credits?.director, entry, entryWeight);

    const selectedLeadActor = entry.ratingRecord.input.favoriteCharacters
      .map((character) => {
        const characterIndex = credits?.characters.indexOf(character) ?? -1;
        return characterIndex >= 0 ? credits?.cast[characterIndex] : null;
      })
      .find((actor): actor is string => Boolean(actor));
    const leadActor = selectedLeadActor ?? credits?.cast[0] ?? null;

    addPreference(actorScores, leadActor, entry, entryWeight);
  }

  return {
    analyzedMovieCount: entries.length,
    likedMovieCount: likedEntries.length,
    genres: toRankings(genreScores, 4),
    actors: toRankings(actorScores, 3),
    directors: toRankings(directorScores, 3),
    tags: toRankings(tagScores, 12)
  };
};
