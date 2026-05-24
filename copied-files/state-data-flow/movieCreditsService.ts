import { movieCreditsById } from '@/data/movieCredits';
import type { CharacterChoice } from '@/types/rating';

export const getCharacterChoices = (
  movieId: string,
  characters: readonly string[]
): CharacterChoice[] => {
  const creditProfile = movieCreditsById[movieId];
  const sourceCharacters = creditProfile?.characters?.length ? creditProfile.characters : characters;
  const cast = creditProfile?.cast ?? [];

  return sourceCharacters.map((name, index) => ({
    name,
    actorName: cast[index] ?? null
  }));
};
