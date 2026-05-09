import { genreQuestionTemplates } from '@/data/ratingQuestionTemplates';

const fallbackQuestion = '이 영화에서 가장 좋았던 캐릭터는 누구인가요?';

export const getCharacterQuestionByGenre = (genre: string) => {
  return (
    genreQuestionTemplates.find((template) => template.genre === genre)?.characterQuestion ??
    fallbackQuestion
  );
};
