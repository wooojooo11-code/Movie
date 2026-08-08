import type { ProfileOverview, ProfileTitle } from '@/types/profile';

export const isBingoProfileTitle = (title: Pick<ProfileTitle, 'code' | 'conditionType'>) =>
  title.conditionType === 'bingo_completion_count' || title.code.startsWith('bingo_');

export const filterBingoProfileTitles = <T extends Pick<ProfileTitle, 'code' | 'conditionType'>>(
  titles: readonly T[]
) => titles.filter((title) => !isBingoProfileTitle(title));

export const sanitizeProfileOverviewTitles = (
  overview: ProfileOverview,
  visibleTitles: readonly Pick<ProfileTitle, 'id'>[]
): ProfileOverview => {
  const allowedTitleIds = new Set(visibleTitles.map((title) => title.id));

  return {
    ...overview,
    featuredTitle:
      overview.featuredTitle && allowedTitleIds.has(overview.featuredTitle.id)
        ? overview.featuredTitle
        : null,
    displayTitles: overview.displayTitles.filter((title) => allowedTitleIds.has(title.id))
  };
};
