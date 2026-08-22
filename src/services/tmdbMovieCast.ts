import type { CharacterChoice } from '@/types/rating';

const TMDB_MOVIE_CAST_ENDPOINT = '/.netlify/functions/tmdb-movie-cast';

interface TmdbCastMember {
  character: string;
  id: number;
  name: string;
  profileUrl: null | string;
}

const castCache = new Map<number, Promise<TmdbCastMember[]>>();

const isCastMember = (value: unknown): value is TmdbCastMember => {
  if (!value || typeof value !== 'object') return false;
  const member = value as Partial<TmdbCastMember>;

  return (
    Number.isInteger(member.id) &&
    typeof member.name === 'string' &&
    typeof member.character === 'string' &&
    (member.profileUrl === null || typeof member.profileUrl === 'string')
  );
};

const normalizePersonName = (name: string) =>
  name.toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]+/gu, '');

const requestMovieCast = async (tmdbMovieId: number) => {
  const url = new URL(TMDB_MOVIE_CAST_ENDPOINT, window.location.origin);
  url.searchParams.set('movieId', String(tmdbMovieId));

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`TMDB movie cast request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { cast?: unknown }).cast)) {
    throw new Error('TMDB movie cast response is invalid.');
  }

  return (payload as { cast: unknown[] }).cast.filter(isCastMember);
};

const loadMovieCast = (tmdbMovieId: number) => {
  const cached = castCache.get(tmdbMovieId);
  if (cached) return cached;

  const request = requestMovieCast(tmdbMovieId).catch((error) => {
    castCache.delete(tmdbMovieId);
    throw error;
  });
  castCache.set(tmdbMovieId, request);
  return request;
};

export const loadCharacterChoicesWithPhotos = async (
  tmdbMovieId: number,
  choices: readonly CharacterChoice[]
): Promise<CharacterChoice[]> => {
  const cast = await loadMovieCast(tmdbMovieId);
  const castByName = new Map(
    cast.map((member) => [normalizePersonName(member.name), member] as const)
  );

  return choices.map((choice, index) => {
    const matchingMember = choice.actorName
      ? castByName.get(normalizePersonName(choice.actorName)) ?? cast[index]
      : cast[index];

    return {
      ...choice,
      actorPhotoUrl: matchingMember?.profileUrl ?? null
    };
  });
};
