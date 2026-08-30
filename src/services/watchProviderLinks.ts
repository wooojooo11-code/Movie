import type { CatalogMovie } from '@/types/recommendation';

type WatchProviderMovie = Pick<CatalogMovie, 'title' | 'watchProvidersKr'> & {
  releaseYear?: null | number;
};

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
  buildHref: (movie: WatchProviderMovie) => string;
}

const getSearchTerm = (movie: WatchProviderMovie) =>
  [movie.title, movie.releaseYear].filter((value) => value !== null && value !== undefined).join(' ');

const watchProviderLinkDefinitions: WatchProviderLinkDefinition[] = [
  {
    key: 'netflix',
    buttonLabel: '넷플릭스에서 찾기',
    accentClassName: 'border-[#b20710] bg-[#b20710] !text-white',
    matches: ['netflix'],
    buildHref: (movie) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'watcha',
    buttonLabel: '왓챠에서 찾기',
    accentClassName: 'border-[#f45d2d] bg-[#f45d2d] !text-white',
    matches: ['watcha', '왓챠'],
    buildHref: (movie) =>
      `https://watcha.com/search?query=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'wavve',
    buttonLabel: '웨이브에서 찾기',
    accentClassName: 'border-[#175dff] bg-[#175dff] !text-white',
    matches: ['wavve', '웨이브'],
    buildHref: (movie) =>
      `https://www.wavve.com/search?searchWord=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'tving',
    buttonLabel: '티빙에서 찾기',
    accentClassName: 'border-[#ff153c] bg-[#ff153c] !text-white',
    matches: ['tving', '티빙'],
    buildHref: (movie) =>
      `https://www.tving.com/search/all?keyword=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'disney-plus',
    buttonLabel: '디즈니+ 열기',
    accentClassName: 'border-[#113ccf] bg-[#113ccf] !text-white',
    matches: ['disney plus', 'disney+'],
    buildHref: () => 'https://www.disneyplus.com/ko-kr/home'
  },
  {
    key: 'coupang-play',
    buttonLabel: '쿠팡플레이에서 찾기',
    accentClassName: 'border-[#151b54] bg-[#151b54] !text-white',
    matches: ['coupang play', '쿠팡플레이'],
    buildHref: (movie) =>
      `https://www.coupangplay.com/catalog?query=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'google-play',
    buttonLabel: 'Google Play에서 찾기',
    accentClassName: 'border-[#1769aa] bg-[#1769aa] !text-white',
    matches: ['google play movies', 'google tv'],
    buildHref: (movie) =>
      `https://play.google.com/store/search?q=${encodeURIComponent(getSearchTerm(movie))}&c=movies&hl=ko&gl=KR`
  },
  {
    key: 'apple-tv',
    buttonLabel: 'Apple TV에서 찾기',
    accentClassName: 'border-[#15171c] bg-[#15171c] !text-white',
    matches: ['apple tv'],
    buildHref: (movie) =>
      `https://tv.apple.com/kr/search?term=${encodeURIComponent(getSearchTerm(movie))}`
  },
  {
    key: 'prime-video',
    buttonLabel: 'Prime Video에서 찾기',
    accentClassName: 'border-[#0578ff] bg-[#0578ff] !text-white',
    matches: ['amazon prime video', 'prime video'],
    buildHref: (movie) =>
      `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(getSearchTerm(movie))}`
  }
];

const normalizeProviderName = (providerName: string) =>
  providerName
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');

export const getWatchProviderLinks = (movie: WatchProviderMovie): WatchProviderLink[] => {
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
