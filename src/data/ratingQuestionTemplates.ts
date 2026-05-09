export interface GenreQuestionTemplate {
  genre: string;
  characterQuestion: string;
}

export const genreQuestionTemplates: GenreQuestionTemplate[] = [
  { genre: '액션', characterQuestion: '이 영화에서 가장 좋았던 캐릭터는 누구인가요?' },
  { genre: '추리', characterQuestion: '이 영화에서 가장 좋았던 캐릭터는 누구인가요?' },
  { genre: '로맨스', characterQuestion: '이 영화에서 가장 좋았던 캐릭터는 누구인가요?' },
  { genre: '코미디', characterQuestion: '이 영화에서 가장 좋았던 캐릭터는 누구인가요?' }
];
