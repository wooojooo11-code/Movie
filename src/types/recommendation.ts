import type {
  Movie,
  MovieList,
  RatingInput,
  ReviewTag,
  ScoredMovie,
  ScoredMovieList,
  SwipeStatus,
  UserPreferenceProfile
} from '@/services/movie_recommendation_algorithm';
import type { RatingDirection } from '@/types/rating';

export type SituationMood = 'sad' | 'stressed' | 'comfort' | 'okay' | 'excited' | 'laugh' | 'tense';
export type SituationWeather =
  | 'rain'
  | 'snow'
  | 'cloudy'
  | 'sunny'
  | 'hot_summer'
  | 'cold_winter'
  | 'cool_autumn'
  | 'warm_spring';
export type SituationViewingTime = 'any' | 'under_90' | 'around_120' | 'over_135' | 'series';
export type SituationSpecialDay =
  | 'christmas'
  | 'halloween'
  | 'valentines_day'
  | 'april_fools'
  | 'birthday'
  | 'after_exam'
  | 'closing_ceremony'
  | 'new_year'
  | 'graduation'
  | 'entrance_ceremony'
  | 'couple_100_days';
export type SituationReason =
  | 'study_motivation'
  | 'creativity'
  | 'focus'
  | 'motivation'
  | 'free_time'
  | 'no_thoughts'
  | 'laugh'
  | 'action'
  | 'mystery_twist'
  | 'visuals'
  | 'new_world'
  | 'true_story';

export interface SituationSelection {
  mood?: SituationMood;
  reason?: readonly SituationReason[];
  specialDay?: SituationSpecialDay;
  viewingTime?: SituationViewingTime;
  weather?: SituationWeather;
}

export type SituationPresetId =
  | 'after_breakup'
  | 'offline_rest'
  | 'sunset'
  | 'after_reading'
  | 'before_travel'
  | 'cleaning'
  | 'before_confession'
  | 'winter_vibes'
  | 'sunday_night';

export type ActiveSituation =
  | { kind: 'manual'; selection: SituationSelection }
  | { kind: 'preset'; presetId: SituationPresetId }
  | { kind: 'none' };

export type SituationContextTag =
  | 'birthday'
  | 'christmas'
  | 'family'
  | 'graduation'
  | 'halloween'
  | 'literary'
  | 'new_year'
  | 'school'
  | 'space'
  | 'spring'
  | 'summer'
  | 'travel'
  | 'true_story'
  | 'winter';
export type RatingResumeSurface =
  | 'primary'
  | 'primary_completion'
  | 'detail'
  | 'detail_completion'
  | 'more'
  | 'more_completion';
export type TasteAnalysisGenre =
  | '액션'
  | '애니메이션'
  | '로맨스'
  | '코미디'
  | '추리'
  | 'SF'

export interface CatalogMovieWatchProvider {
  logoPath: null | string;
  logoUrl: null | string;
  providerId: number;
  providerName: string;
}

export interface CatalogMovieWatchProviders {
  buy: CatalogMovieWatchProvider[];
  flatrate: CatalogMovieWatchProvider[];
  link: null | string;
  region: 'KR';
  rent: CatalogMovieWatchProvider[];
}

export interface CatalogMovieTrailer {
  name: null | string;
  youtubeKey: string;
}

export interface CatalogMovie extends Movie {
  collectionId?: null | number;
  collectionName?: null | string;
  contextTags?: SituationContextTag[];
  genreIds?: number[];
  overview: string;
  releaseYear: number;
  runtimeMinutes?: null | number;
  tmdbMovieId: number;
  posterUrl: string;
  posterAlt: string;
  trailer?: CatalogMovieTrailer | null;
  voteAverage?: null | number;
  voteCount?: null | number;
  watchProvidersKr: CatalogMovieWatchProviders | null;
}

export interface CatalogMovieList extends MovieList {
  saveCount: number;
  averageRating: number;
}

export interface StoredRatingRecord {
  rawDecision: SwipeStatus | 'not_interested';
  rawDirection: null | RatingDirection;
  detailCompleted: boolean;
  input: RatingInput;
  reviewText: string;
  questionText: string;
}

export interface AdditionalTasteAnalysisBatch {
  id: string;
  movieIds: string[];
  createdAt: string;
}

export interface RecommendationImpression {
  lastShownAt: string;
  movieId: string;
  showCount: number;
}

export interface CollaborativeRecommendationSignal {
  movieId: string;
  score: number;
  similarUserCount: number;
}

export interface CommunitySituationMovieSignal {
  movieId: string;
  answerCount: number;
}

export interface RecommendationScoreBreakdown {
  personalPreference: number;
  similarUser: number;
  situation: number;
  tmdbQuality: number;
  novelty: number;
  people: number;
}

export interface RecommendationStateSnapshot {
  userId: string;
  profile: UserPreferenceProfile;
  ratings: StoredRatingRecord[];
  additionalTasteAnalysisBatches: AdditionalTasteAnalysisBatch[];
  ratingResumeSurface: RatingResumeSurface;
  dismissedRecommendationMovieIds: string[];
  recommendationImpressions: RecommendationImpression[];
  selectedTasteAnalysisGenres: TasteAnalysisGenre[];
  activeSituation: ActiveSituation;
  activeSituationUpdatedAt: string;
}

export interface RatingFeedbackPayload {
  rating: number | null;
  reviewTags: ReviewTag[];
  favoriteCharacters: string[];
  reviewText: string;
  questionText: string;
}

export interface RatedCatalogMovieRecord {
  movie: CatalogMovie;
  ratingRecord: StoredRatingRecord;
}

export interface RecommendedMoviePreview {
  id: string;
  title: string;
  posterAlt: string;
  posterUrl: string;
}

export interface RecommendedCatalogMovie extends CatalogMovie, ScoredMovie {
  recommendationReasons?: string[];
  recommendationRawScores?: RecommendationScoreBreakdown;
  recommendationScoreBreakdown?: RecommendationScoreBreakdown;
  recommendationScoreMaximums?: RecommendationScoreBreakdown;
}

export interface RecommendedCatalogList extends CatalogMovieList, ScoredMovieList {
  moviePreviews: RecommendedMoviePreview[];
  moviePreviewTitles: string[];
}
