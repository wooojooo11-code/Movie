import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'ko-KR';
const DEFAULT_REGION = 'KR';
const FALLBACK_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';
const FALLBACK_POSTER_SIZE = 'w780';

const movieSeeds = [
  { id: 'movie_1', query: 'Mad Max: Fury Road', year: 2015 },
  { id: 'movie_2', query: 'Knives Out', year: 2019 },
  { id: 'movie_3', query: 'La La Land', year: 2016 },
  { id: 'movie_4', query: 'The Grand Budapest Hotel', year: 2014 },
  { id: 'movie_5', query: 'The Dark Knight', year: 2008 },
  { id: 'movie_6', query: 'Parasite', year: 2019 },
  { id: 'movie_7', query: 'Spirited Away', year: 2001 },
  { id: 'movie_8', query: 'Gone Girl', year: 2014 },
  { id: 'movie_9', query: 'Whiplash', year: 2014 },
  { id: 'movie_10', query: 'John Wick', year: 2014 },
  { id: 'movie_11', query: 'Inside Out', year: 2015 },
  { id: 'movie_12', query: 'Soul', year: 2020 },
  { id: 'movie_13', query: 'Her', year: 2013 },
  { id: 'movie_14', query: 'Ford v Ferrari', year: 2019 },
  { id: 'movie_15', query: 'In the Mood for Love', year: 2000 },
  { id: 'movie_16', query: 'Little Miss Sunshine', year: 2006 },
  { id: 'movie_17', query: 'Mission: Impossible - Fallout', year: 2018 },
  { id: 'movie_18', query: 'Memories of Murder', year: 2003 },
  { id: 'movie_19', query: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
  { id: 'movie_20', query: 'The Truman Show', year: 1998 },
  { id: 'movie_21', query: 'Prisoners', year: 2013 },
  { id: 'movie_22', query: 'Past Lives', year: 2023 },
  { id: 'movie_23', query: 'Top Gun: Maverick', year: 2022 },
  { id: 'movie_24', query: 'Paddington 2', year: 2017 },
  { id: 'movie_25', query: 'Heat', year: 1995 },
  { id: 'movie_26', query: 'Oldboy', year: 2003 },
  { id: 'movie_27', query: 'Before Sunrise', year: 1995 },
  { id: 'movie_28', query: 'The Nice Guys', year: 2016 },
  { id: 'movie_29', query: 'Zodiac', year: 2007 },
  { id: 'movie_30', query: 'Your Name.', year: 2016 },
  { id: 'movie_31', query: 'Spider-Man: Into the Spider-Verse', year: 2018 },
  { id: 'movie_32', query: 'About Time', year: 2013 }
];

const catalogLists = [
  {
    id: 'list_1',
    title: '반전 있는 영화 모음',
    movieIds: ['movie_2', 'movie_8', 'movie_26'],
    saveCount: 1032,
    averageRating: 4.3
  },
  {
    id: 'list_2',
    title: '비 오는 날 보기 좋은 영화',
    movieIds: ['movie_15', 'movie_19', 'movie_32'],
    saveCount: 2184,
    averageRating: 4.5
  },
  {
    id: 'list_3',
    title: '영상미가 좋은 영화',
    movieIds: ['movie_7', 'movie_15', 'movie_30'],
    saveCount: 1492,
    averageRating: 4.4
  },
  {
    id: 'list_4',
    title: '긴장감 있는 심야 영화',
    movieIds: ['movie_1', 'movie_6', 'movie_21'],
    saveCount: 1260,
    averageRating: 4.2
  },
  {
    id: 'list_5',
    title: '설레는 로맨스 추천',
    movieIds: ['movie_3', 'movie_27', 'movie_32'],
    saveCount: 1644,
    averageRating: 4.4
  },
  {
    id: 'list_6',
    title: '가볍게 웃고 싶은 날',
    movieIds: ['movie_4', 'movie_16', 'movie_28'],
    saveCount: 1893,
    averageRating: 4.1
  }
];

const reviewTagMatchers = [
  { tag: '액션', needles: ['action', 'car chase', 'fight', 'gun', 'martial arts', '폭발', '추격', '전투'] },
  { tag: '긴장감', needles: ['thriller', 'serial killer', 'investigation', 'murder', 'suspense', '긴장', '살인', '수사', '추적'] },
  { tag: '반전', needles: ['twist', 'betrayal', 'mystery', '반전', '비밀', '정체'] },
  { tag: '탄탄한 스토리', needles: ['based on novel', 'investigation', 'drama', 'story', 'plot', '서사', '이야기'] },
  { tag: '여운', needles: ['memory', 'grief', 'afterlife', 'melancholy', 'nostalgia', '여운', '추억'] },
  { tag: '감동', needles: ['hope', 'family', 'friendship', 'human spirit', '감동', '우정', '가족'] },
  { tag: '감동적인 음악', needles: ['jazz', 'music', 'musician', 'concert', 'ost', '음악', '공연'] },
  { tag: '배우들의 연기력', needles: ['performance', 'actor', 'character study', '실화', '연기'] },
  { tag: '영상미', needles: ['visual', 'beautiful', 'dream', 'animation', 'cinematography', '영상미', '애니메이션'] },
  { tag: '연출', needles: ['director', 'stylized', 'mise-en-scene', '연출', '미장센'] },
  { tag: '세계관', needles: ['multiverse', 'fantasy world', 'parallel world', 'world', '세계관', '판타지'] },
  { tag: 'OST', needles: ['soundtrack', 'score', 'ost'] },
  { tag: '캐릭터 매력', needles: ['character', 'ensemble', 'companion', '캐릭터'] },
  { tag: '유머', needles: ['comedy', 'satire', 'humor', 'buddy', '유머', '코미디'] },
  { tag: '몰입감', needles: ['immersive', 'tension', 'survival', 'race against time', '몰입', '생존'] }
];

const genreFallbackTags = {
  액션: ['액션', '몰입감'],
  스릴러: ['긴장감', '몰입감'],
  미스터리: ['반전', '탄탄한 스토리'],
  범죄: ['긴장감', '탄탄한 스토리'],
  로맨스: ['감동', '여운'],
  드라마: ['배우들의 연기력', '감동'],
  코미디: ['유머', '캐릭터 매력'],
  애니메이션: ['영상미', '세계관'],
  판타지: ['세계관', '영상미'],
  음악: ['감동적인 음악', 'OST'],
  가족: ['감동', '캐릭터 매력']
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const srcDataDir = path.join(repoRoot, 'src', 'data');

const loadEnvFile = async (filename) => {
  try {
    const raw = await readFile(path.join(repoRoot, filename), 'utf8');

    for (const line of raw.split(/\r?\n/u)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/u, '$1');

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }
};

await loadEnvFile('.env');
await loadEnvFile('.env.local');

const bearerToken =
  process.env.TMDB_BEARER_TOKEN ??
  process.env.VITE_TMDB_BEARER_TOKEN ??
  process.env.TMDB_API_READ_ACCESS_TOKEN ??
  '';

if (!bearerToken) {
  console.error(
    'TMDB_BEARER_TOKEN not found. Add it to your environment or copy .env.example to .env and set the token.'
  );
  process.exit(1);
}

const tmdbFetch = async (pathname, searchParams = {}) => {
  const url = new URL(`${TMDB_API_BASE_URL}${pathname}`);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText} ${text}`);
  }

  return response.json();
};

const getPosterBase = async () => {
  const configuration = await tmdbFetch('/configuration');
  const imageConfig = configuration.images ?? {};
  const baseUrl = imageConfig.secure_base_url ?? imageConfig.base_url ?? FALLBACK_POSTER_BASE_URL;
  const posterSizes = Array.isArray(imageConfig.poster_sizes) ? imageConfig.poster_sizes : [];
  const preferredSize =
    posterSizes.find((size) => size === 'w780') ??
    posterSizes.find((size) => size === 'w500') ??
    posterSizes.at(-1) ??
    FALLBACK_POSTER_SIZE;

  return `${baseUrl}${preferredSize}`;
};

const normalizeText = (value) => value.toLowerCase();

const unique = (values) => [...new Set(values.filter(Boolean))];

const selectBestSearchResult = (results, seed) => {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No TMDB movie search result for "${seed.query}"`);
  }

  const exactYearMatch = results.find((item) =>
    typeof item.release_date === 'string' && item.release_date.startsWith(String(seed.year))
  );

  return exactYearMatch ?? results[0];
};

const deriveTags = (detail) => {
  const rawKeywords = unique(
    (detail.keywords?.keywords ?? detail.keywords?.results ?? []).map((keyword) => keyword?.name?.trim())
  );
  const keywordBlob = normalizeText(rawKeywords.join(' '));
  const tags = [];

  for (const matcher of reviewTagMatchers) {
    if (matcher.needles.some((needle) => keywordBlob.includes(normalizeText(needle)))) {
      tags.push(matcher.tag);
    }
  }

  for (const genre of detail.genres.map((item) => item.name)) {
    for (const tag of genreFallbackTags[genre] ?? []) {
      tags.push(tag);
    }
  }

  const normalizedTags = unique(tags).slice(0, 4);

  if (normalizedTags.length > 0) {
    return normalizedTags;
  }

  return detail.genres.map((genre) => genre.name).slice(0, 2);
};

const deriveCredits = (detail) => {
  const cast = Array.isArray(detail.credits?.cast) ? detail.credits.cast : [];
  const crew = Array.isArray(detail.credits?.crew) ? detail.credits.crew : [];
  const topCast = cast.filter((person) => person && person.name).slice(0, 3);

  const characters = topCast.map((person) => person.character?.trim() || person.name.trim());
  const actorNames = topCast.map((person) => person.name.trim());
  const director =
    crew.find((person) => person.job === 'Director')?.name?.trim() ??
    crew.find((person) => person.department === 'Directing')?.name?.trim() ??
    '감독 미상';

  return {
    characters: characters.slice(0, 3),
    cast: actorNames.slice(0, 3),
    director
  };
};

const fetchCatalogMovie = async (seed, posterBaseUrl) => {
  const searchResult = await tmdbFetch('/search/movie', {
    query: seed.query,
    language: DEFAULT_LANGUAGE,
    region: DEFAULT_REGION,
    include_adult: 'false',
    year: seed.year
  });

  const movieSummary = selectBestSearchResult(searchResult.results, seed);
  const detail = await tmdbFetch(`/movie/${movieSummary.id}`, {
    language: DEFAULT_LANGUAGE,
    append_to_response: 'credits,keywords'
  });

  if (!detail.poster_path) {
    throw new Error(`TMDB movie "${seed.query}" does not have a poster_path`);
  }

  const credits = deriveCredits(detail);
  const title = detail.title?.trim() || detail.original_title?.trim() || seed.query;
  const genres = detail.genres.map((genre) => genre.name).slice(0, 3);
  const tags = deriveTags(detail);

  return {
    catalogMovie: {
      id: seed.id,
      title,
      genres,
      tags,
      characters: credits.characters,
      releaseYear: Number.parseInt(String(detail.release_date ?? '').slice(0, 4), 10) || seed.year,
      posterUrl: `${posterBaseUrl}${detail.poster_path}`,
      posterAlt: `${title} 포스터`
    },
    credits
  };
};

const toTypedTsExport = (importLine, exportName, typeName, value) =>
  `${importLine}\n\nexport const ${exportName}: ${typeName} = ${JSON.stringify(value, null, 2)};\n`;

const run = async () => {
  const posterBaseUrl = await getPosterBase();
  const catalogMovies = [];
  const movieCreditsById = {};

  for (const seed of movieSeeds) {
    console.log(`Syncing ${seed.id}: ${seed.query} (${seed.year})`);
    const { catalogMovie, credits } = await fetchCatalogMovie(seed, posterBaseUrl);
    catalogMovies.push(catalogMovie);
    movieCreditsById[seed.id] = credits;
  }

  await mkdir(srcDataDir, { recursive: true });

  const catalogSource =
    toTypedTsExport(
      "import type { CatalogMovie, CatalogMovieList } from '@/types/recommendation';",
      'catalogMovies',
      'CatalogMovie[]',
      catalogMovies
    ) +
    `\nexport const catalogLists: CatalogMovieList[] = ${JSON.stringify(catalogLists, null, 2)};\n`;

  const creditsSource = toTypedTsExport(
    "import type { MovieCreditsProfile } from '@/types/lists';",
    'movieCreditsById',
    'Record<string, MovieCreditsProfile>',
    movieCreditsById
  );

  await writeFile(path.join(srcDataDir, 'catalog.ts'), catalogSource, 'utf8');
  await writeFile(path.join(srcDataDir, 'movieCredits.ts'), creditsSource, 'utf8');

  console.log('TMDB catalog sync complete.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
