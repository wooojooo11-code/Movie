import type { CatalogMovie, CatalogMovieWatchProvider } from '@/types/recommendation';

interface CuratedWatchProvider {
  label: string;
  matches: string[];
}

const curatedWatchProviders: CuratedWatchProvider[] = [
  { label: '넷플릭스', matches: ['netflix'] },
  { label: '왓챠', matches: ['watcha', '왓챠'] },
  { label: '웨이브', matches: ['wavve', '웨이브'] },
  { label: '디즈니+', matches: ['disney plus', 'disney+'] },
  { label: '쿠팡플레이', matches: ['coupang play', '쿠팡플레이'] }
];

const normalizeProviderName = (providerName: string) =>
  providerName
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');

const getUniqueProviderNames = (providers: readonly CatalogMovieWatchProvider[]) =>
  [...new Set(providers.map((provider) => provider.providerName.trim()).filter(Boolean))];

export const getWatchProviderSummary = (
  movie: Pick<CatalogMovie, 'watchProvidersKr'>,
  { limit = 3 }: { limit?: number } = {}
): null | string => {
  const watchProviders = movie.watchProvidersKr;

  if (!watchProviders) {
    return null;
  }

  const rawProviderNames = getUniqueProviderNames([
    ...watchProviders.flatrate,
    ...watchProviders.rent,
    ...watchProviders.buy
  ]);

  if (rawProviderNames.length === 0) {
    return null;
  }

  const curatedProviderNames = curatedWatchProviders
    .filter((provider) =>
      rawProviderNames.some((providerName) =>
        provider.matches.some((match) => normalizeProviderName(providerName).includes(match))
      )
    )
    .map((provider) => provider.label);

  const remainingProviderNames = rawProviderNames.filter((providerName) => {
    const normalizedProviderName = normalizeProviderName(providerName);

    return !curatedWatchProviders.some((provider) =>
      provider.matches.some((match) => normalizedProviderName.includes(match))
    );
  });

  const providerNames = [...curatedProviderNames, ...remainingProviderNames];

  if (providerNames.length === 0) {
    return null;
  }

  return providerNames.slice(0, limit).join(' · ');
};
