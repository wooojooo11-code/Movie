import type { CatalogMovie } from '@/types/recommendation';

export interface WatchProviderLink {
  accentClassName: string;
  buttonLabel: string;
  href: string;
  key: string;
}

interface WatchProviderLinkDefinition {
  accentClassName: string;
  buttonLabel: string;
  key: string;
  matches: string[];
  buildHref: (movie: CatalogMovie) => string;
}

const watchProviderLinkDefinitions: WatchProviderLinkDefinition[] = [
  {
    key: 'netflix',
    buttonLabel: '넷플릭스에서 찾기',
    accentClassName: 'border-[#b20710] bg-[#b20710] text-white',
    matches: ['netflix'],
    buildHref: (movie) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(`${movie.title} ${movie.releaseYear}`)}`
  },
  {
    key: 'watcha',
    buttonLabel: '왓챠에서 찾기',
    accentClassName: 'border-[#f45d2d] bg-[#f45d2d] text-white',
    matches: ['watcha', '왓챠'],
    buildHref: (movie) =>
      `https://watcha.com/search?query=${encodeURIComponent(`${movie.title} ${movie.releaseYear}`)}`
  },
  {
    key: 'wavve',
    buttonLabel: '웨이브에서 찾기',
    accentClassName: 'border-[#175dff] bg-[#175dff] text-white',
    matches: ['wavve', '웨이브'],
    buildHref: (movie) =>
      `https://www.wavve.com/search?searchWord=${encodeURIComponent(`${movie.title} ${movie.releaseYear}`)}`
  },
  {
    key: 'disney-plus',
    buttonLabel: '디즈니+ 열기',
    accentClassName: 'border-[#113ccf] bg-[#113ccf] text-white',
    matches: ['disney plus', 'disney+'],
    buildHref: () => 'https://www.disneyplus.com/ko-kr/home'
  },
  {
    key: 'coupang-play',
    buttonLabel: '쿠팡플레이에서 찾기',
    accentClassName: 'border-[#151b54] bg-[#151b54] text-white',
    matches: ['coupang play', '쿠팡플레이'],
    buildHref: (movie) =>
      `https://www.coupangplay.com/catalog?query=${encodeURIComponent(`${movie.title} ${movie.releaseYear}`)}`
  }
];

const normalizeProviderName = (providerName: string) =>
  providerName
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');

export const getWatchProviderLinks = (movie: CatalogMovie): WatchProviderLink[] => {
  const watchProviders = movie.watchProvidersKr;

  if (!watchProviders) {
    return [];
  }

  const normalizedProviderNames = [
    ...watchProviders.flatrate,
    ...watchProviders.rent,
    ...watchProviders.buy
  ].map((provider) => normalizeProviderName(provider.providerName));

  return watchProviderLinkDefinitions
    .filter((definition) =>
      normalizedProviderNames.some((providerName) =>
        definition.matches.some((match) => providerName.includes(match))
      )
    )
    .map((definition) => ({
      key: definition.key,
      href: definition.buildHref(movie),
      buttonLabel: definition.buttonLabel,
      accentClassName: definition.accentClassName
    }));
};
