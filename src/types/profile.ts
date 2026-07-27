export interface ProfileIdentity {
  id: string;
  nickname: string;
  avatarUrl: null | string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileTitle {
  id: string;
  code: string;
  name: null | string;
  description: null | string;
  conditionType: string;
  conditionTarget: null | string;
  conditionValue: null | number;
  icon: string;
  isHidden: boolean;
  isEarned: boolean;
  earnedAt: null | string;
  isDisplayed: boolean;
  isFeatured: boolean;
  progress: number;
}

export interface ProfileTasteGenre {
  name: string;
  count: number;
  percentage: number;
}

export interface ProfileTastePerson {
  name: string;
  profileUrl: null | string;
  count: number;
}

export interface ProfileTasteKeyword {
  name: string;
  count: number;
}

export interface ProfileTaste {
  watchedCount: number;
  topGenres: ProfileTasteGenre[];
  favoriteDirector: null | ProfileTastePerson;
  favoriteActor: null | ProfileTastePerson;
  topKeywords: ProfileTasteKeyword[];
}

export interface ProfileOverview {
  profile: ProfileIdentity;
  featuredTitle: null | Pick<ProfileTitle, 'id' | 'name' | 'description' | 'icon'>;
  displayTitles: Array<Pick<ProfileTitle, 'id' | 'name' | 'description' | 'icon'>>;
  taste: ProfileTaste;
}

export interface ProfileEditInput {
  nickname: string;
  bio: string;
  avatarFile?: File | null;
}

export type TitleCheckEvent = 'bingo' | 'daily_question' | 'list' | 'rating' | 'watch';
