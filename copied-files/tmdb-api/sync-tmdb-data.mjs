import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'ko-KR';
const DEFAULT_REGION = 'KR';
const FALLBACK_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';
const FALLBACK_POSTER_SIZE = 'w780';
const TMDB_PROVIDER_LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w92';
const TARGET_CATALOG_SIZE = 523;
const FIRST_DISCOVERED_MOVIE_INDEX = 134;
const DISCOVER_PAGE_LIMIT = 18;
const DISCOVER_MIN_VOTE_COUNT = 100;
const DISCOVER_CANDIDATE_MULTIPLIER = 4;
const DETAIL_FETCH_CONCURRENCY = 4;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_TAG_COUNT = 4;
const MAX_GENRE_COUNT = 3;
const MAX_CAST_COUNT = 7;

const discoveryGenres = [
  { key: '액션', tmdbGenreId: 28 },
  { key: '로맨스', tmdbGenreId: 10749 },
  { key: '코미디', tmdbGenreId: 35 },
  { key: '추리', tmdbGenreId: 9648 },
  { key: 'SF', tmdbGenreId: 878 },
  { key: '애니메이션', tmdbGenreId: 16 }
];

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
  { id: 'movie_32', query: 'About Time', year: 2013 },
  { id: 'movie_33', query: 'Interstellar', year: 2014 },
  { id: 'movie_34', query: 'Inception', year: 2010 },
  { id: 'movie_35', query: 'The Matrix', year: 1999 },
  { id: 'movie_36', query: 'Arrival', year: 2016 },
  { id: 'movie_37', query: 'Dune', year: 2021 },
  { id: 'movie_38', query: 'Blade Runner 2049', year: 2017 },
  { id: 'movie_39', query: 'Everything Everywhere All at Once', year: 2022 },
  { id: 'movie_40', query: 'Ex Machina', year: 2015 },
  { id: 'movie_41', query: 'The Prestige', year: 2006 },
  { id: 'movie_42', query: 'The Handmaiden', year: 2016 },
  { id: 'movie_43', query: 'Decision to Leave', year: 2022 },
  { id: 'movie_44', query: 'Burning', year: 2018 },
  { id: 'movie_45', query: 'The Host', year: 2006 },
  { id: 'movie_46', query: 'Train to Busan', year: 2016 },
  { id: 'movie_47', query: 'The Wailing', year: 2016 },
  { id: 'movie_48', query: 'Oppenheimer', year: 2023 },
  { id: 'movie_49', query: 'The Social Network', year: 2010 },
  { id: 'movie_50', query: 'Little Women', year: 2019 },
  { id: 'movie_51', query: 'Minari', year: 2020 },
  { id: 'movie_52', query: 'Call Me by Your Name', year: 2017 },
  { id: 'movie_53', query: 'Portrait of a Lady on Fire', year: 2019 },
  { id: 'movie_54', query: 'Coco', year: 2017 },
  { id: 'movie_55', query: 'Toy Story 3', year: 2010 },
  { id: 'movie_56', query: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
  { id: 'movie_57', query: 'The Lord of the Rings: The Two Towers', year: 2002 },
  { id: 'movie_58', query: 'The Lord of the Rings: The Return of the King', year: 2003 },
  { id: 'movie_59', query: 'Get Out', year: 2017 },
  { id: 'movie_60', query: 'Hereditary', year: 2018 },
  { id: 'movie_61', query: 'The Menu', year: 2022 },
  { id: 'movie_62', query: 'Nope', year: 2022 },
  { id: 'movie_63', query: 'Fight Club', year: 1999 },
  { id: 'movie_64', query: 'The Shawshank Redemption', year: 1994 },
  { id: 'movie_65', query: 'Gladiator', year: 2000 },
  { id: 'movie_66', query: 'Casino Royale', year: 2006 },
  { id: 'movie_67', query: 'Skyfall', year: 2012 },
  { id: 'movie_68', query: 'The Bourne Ultimatum', year: 2007 },
  { id: 'movie_69', query: 'The Raid', year: 2011 },
  { id: 'movie_70', query: 'Die Hard', year: 1988 },
  { id: 'movie_71', query: 'Terminator 2: Judgment Day', year: 1991 },
  { id: 'movie_72', query: 'Aliens', year: 1986 },
  { id: 'movie_73', query: 'The Avengers', year: 2012 },
  { id: 'movie_74', query: 'Captain America: The Winter Soldier', year: 2014 },
  { id: 'movie_75', query: 'Edge of Tomorrow', year: 2014 },
  { id: 'movie_76', query: 'Logan', year: 2017 },
  { id: 'movie_77', query: 'Baby Driver', year: 2017 },
  { id: 'movie_78', query: 'RRR', year: 2022 },
  { id: 'movie_79', query: 'Crouching Tiger, Hidden Dragon', year: 2000 },
  { id: 'movie_80', query: 'Kill Bill: Vol. 1', year: 2003 },
  { id: 'movie_81', query: 'Se7en', year: 1995 },
  { id: 'movie_82', query: 'Shutter Island', year: 2010 },
  { id: 'movie_83', query: 'Memento', year: 2000 },
  { id: 'movie_84', query: 'The Usual Suspects', year: 1995 },
  { id: 'movie_85', query: 'Chinatown', year: 1974 },
  { id: 'movie_86', query: 'L.A. Confidential', year: 1997 },
  { id: 'movie_87', query: 'Mystic River', year: 2003 },
  { id: 'movie_88', query: 'The Girl with the Dragon Tattoo', year: 2011 },
  { id: 'movie_89', query: 'The Silence of the Lambs', year: 1991 },
  { id: 'movie_90', query: 'The Sixth Sense', year: 1999 },
  { id: 'movie_91', query: 'Searching', year: 2018 },
  { id: 'movie_92', query: 'Anatomy of a Fall', year: 2023 },
  { id: 'movie_93', query: 'The Others', year: 2001 },
  { id: 'movie_94', query: 'Murder on the Orient Express', year: 2017 },
  { id: 'movie_95', query: 'The Game', year: 1997 },
  { id: 'movie_96', query: 'Rear Window', year: 1954 },
  { id: 'movie_97', query: 'Roman Holiday', year: 1953 },
  { id: 'movie_98', query: 'Notting Hill', year: 1999 },
  { id: 'movie_99', query: 'Pride & Prejudice', year: 2005 },
  { id: 'movie_100', query: 'Atonement', year: 2007 },
  { id: 'movie_101', query: 'Titanic', year: 1997 },
  { id: 'movie_102', query: 'Amelie', year: 2001 },
  { id: 'movie_103', query: 'The Notebook', year: 2004 },
  { id: 'movie_104', query: 'Brokeback Mountain', year: 2005 },
  { id: 'movie_105', query: 'Carol', year: 2015 },
  { id: 'movie_106', query: 'Before Sunset', year: 2004 },
  { id: 'movie_107', query: 'Before Midnight', year: 2013 },
  { id: 'movie_108', query: 'When Harry Met Sally...', year: 1989 },
  { id: 'movie_109', query: '(500) Days of Summer', year: 2009 },
  { id: 'movie_110', query: 'Chungking Express', year: 1994 },
  { id: 'movie_111', query: 'Lost in Translation', year: 2003 },
  { id: 'movie_112', query: 'Sleepless in Seattle', year: 1993 },
  { id: 'movie_113', query: 'Superbad', year: 2007 },
  { id: 'movie_114', query: 'Groundhog Day', year: 1993 },
  { id: 'movie_115', query: 'Bridesmaids', year: 2011 },
  { id: 'movie_116', query: 'Booksmart', year: 2019 },
  { id: 'movie_117', query: 'Palm Springs', year: 2020 },
  { id: 'movie_118', query: 'Hot Fuzz', year: 2007 },
  { id: 'movie_119', query: 'Shaun of the Dead', year: 2004 },
  { id: 'movie_120', query: 'School of Rock', year: 2003 },
  { id: 'movie_121', query: 'Mean Girls', year: 2004 },
  { id: 'movie_122', query: 'The Devil Wears Prada', year: 2006 },
  { id: 'movie_123', query: 'Juno', year: 2007 },
  { id: 'movie_124', query: 'Mrs. Doubtfire', year: 1993 },
  { id: 'movie_125', query: 'The Intouchables', year: 2011 },
  { id: 'movie_126', query: 'Beverly Hills Cop', year: 1984 },
  { id: 'movie_127', query: 'Barbie', year: 2023 },
  { id: 'movie_128', query: 'Rushmore', year: 1998 },
  { id: 'movie_129', query: 'The Martian', year: 2015 },
  { id: 'movie_130', query: 'Minority Report', year: 2002 },
  { id: 'movie_131', query: 'Avatar', year: 2009 },
  { id: 'movie_132', query: 'The Rock', year: 1996 },
  { id: 'movie_133', query: 'Speed', year: 1994 },
  { id: 'movie_501', query: 'The Spirit of the Beehive', year: 1973 },
  { id: 'movie_502', query: 'Still Walking', year: 2008 },
  { id: 'movie_503', query: 'Goodbye, Dragon Inn', year: 2003 },
  { id: 'movie_504', query: 'The Long Day Closes', year: 1992 },
  { id: 'movie_505', query: 'Playtime', year: 1967 },
  { id: 'movie_506', query: 'La Ciénaga', year: 2001 },
  { id: 'movie_507', query: 'The Great Buddha+', year: 2017 },
  { id: 'movie_508', query: 'The Gleaners and I', year: 2000 },
  { id: 'movie_509', query: "Where Is the Friend's House?", year: 1987 },
  { id: 'movie_510', query: 'A Brighter Summer Day', year: 1991 },
  { id: 'movie_511', query: 'Coherence', year: 2013 },
  { id: 'movie_512', query: 'Upgrade', year: 2018 },
  { id: 'movie_513', query: 'Star Wars: Episode I - The Phantom Menace', year: 1999 },
  { id: 'movie_514', query: 'Star Wars: Episode II - Attack of the Clones', year: 2002 },
  { id: 'movie_515', query: 'Star Wars: Episode III - Revenge of the Sith', year: 2005 },
  { id: 'movie_516', query: 'Star Wars', year: 1977 },
  { id: 'movie_517', query: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980 },
  { id: 'movie_518', query: 'Star Wars: Episode VI - Return of the Jedi', year: 1983 },
  { id: 'movie_519', query: 'Star Wars: The Force Awakens', year: 2015 },
  { id: 'movie_520', query: 'Star Wars: The Last Jedi', year: 2017 },
  { id: 'movie_521', query: 'Star Wars: The Rise of Skywalker', year: 2019 },
  { id: 'movie_522', query: 'Rogue One: A Star Wars Story', year: 2016 },
  { id: 'movie_523', query: 'Solo: A Star Wars Story', year: 2018 }
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
    title: '가볍게 웃고 싶을 때',
    movieIds: ['movie_4', 'movie_16', 'movie_28'],
    saveCount: 1893,
    averageRating: 4.1
  }
];

const reviewTagMatchers = [
  { tag: '액션', needles: ['action', 'car chase', 'fight', 'gun', 'martial arts', '폭발', '추격', '전투'] },
  {
    tag: '긴장감',
    needles: ['thriller', 'serial killer', 'investigation', 'murder', 'suspense', '긴장', '살인', '수사', '추적']
  },
  { tag: '반전', needles: ['twist', 'betrayal', 'mystery', '반전', '비밀', '정체'] },
  { tag: '탄탄한 스토리', needles: ['based on novel', 'investigation', 'drama', 'story', 'plot', '서사', '이야기'] },
  { tag: '여운', needles: ['memory', 'grief', 'afterlife', 'melancholy', 'nostalgia', '여운', '추억'] },
  { tag: '감동', needles: ['hope', 'family', 'friendship', 'human spirit', '감동', '우정', '가족'] },
  { tag: '감성적인 음악', needles: ['jazz', 'music', 'musician', 'concert', 'ost', '음악', '공연'] },
  { tag: '배우들의 연기력', needles: ['performance', 'actor', 'character study', '배우', '연기'] },
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
  음악: ['감성적인 음악', 'OST'],
  가족: ['감동', '캐릭터 매력']
};

const manualTmdbMovieIdOverrides = {
  movie_6: 496243,
  movie_7: 129,
  movie_12: 508442,
  movie_13: 152601,
  movie_19: 38,
  movie_22: 666277,
  movie_25: 949,
  movie_32: 122906,
  movie_30: 372058,
  movie_37: 438631,
  movie_36: 329865,
  movie_44: 491584,
  movie_45: 1255,
  movie_47: 293670,
  movie_54: 354912,
  movie_69: 94329,
  movie_78: 579974,
  movie_79: 146,
  movie_93: 1933,
  movie_95: 2649,
  movie_101: 597,
  movie_102: 194,
  movie_105: 258480,
  movie_117: 587792,
  movie_123: 7326,
  movie_513: 1893,
  movie_514: 1894,
  movie_515: 1895,
  movie_516: 11,
  movie_517: 1891,
  movie_518: 1892,
  movie_519: 140607,
  movie_520: 181808,
  movie_521: 181812,
  movie_522: 330459,
  movie_523: 348350
};

const manualTitleOverrides = {
  movie_511: '코히런스'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const srcDataDir = path.join(repoRoot, 'src', 'data');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const buildTmdbUrl = (pathname, searchParams = {}) => {
  const url = new URL(`${TMDB_API_BASE_URL}${pathname}`);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
};

const tmdbFetch = async (pathname, searchParams = {}) => {
  const url = buildTmdbUrl(pathname, searchParams);
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        accept: 'application/json'
      }
    });

    if (response.ok) {
      return response.json();
    }

    const text = await response.text();
    lastError = new Error(`TMDB request failed: ${response.status} ${response.statusText} ${text}`);

    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === 3) {
      throw lastError;
    }

    const retryAfterHeader = response.headers.get('retry-after');
    const retryAfterMs = Number.isFinite(Number(retryAfterHeader))
      ? Number(retryAfterHeader) * 1000
      : 700 * (attempt + 1);

    await wait(retryAfterMs);
  }

  throw lastError ?? new Error(`TMDB request failed for ${pathname}`);
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

const normalizeText = (value) => String(value ?? '').toLowerCase();
const normalizeComparableText = (value) =>
  String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();

const unique = (values) => [...new Set(values.filter(Boolean))];

const scoreSearchResult = (result, seed) => {
  const queryText = normalizeComparableText(seed.query);
  const titleText = normalizeComparableText(result.title);
  const originalTitleText = normalizeComparableText(result.original_title);
  const releaseYear = Number.parseInt(String(result.release_date ?? '').slice(0, 4), 10);
  let score = 0;

  if (titleText === queryText) {
    score += 160;
  } else if (titleText.includes(queryText) || queryText.includes(titleText)) {
    score += 70;
  }

  if (originalTitleText === queryText) {
    score += 200;
  } else if (originalTitleText.includes(queryText) || queryText.includes(originalTitleText)) {
    score += 90;
  }

  if (releaseYear === seed.year) {
    score += 80;
  } else if (Number.isFinite(releaseYear) && Math.abs(releaseYear - seed.year) <= 1) {
    score += 30;
  }

  if (result.poster_path) {
    score += 12;
  } else {
    score -= 60;
  }

  if (typeof result.vote_count === 'number') {
    score += Math.min(result.vote_count / 250, 12);

    if (result.vote_count === 0) {
      score -= 35;
    } else if (result.vote_count < 10) {
      score -= 15;
    }
  }

  if (typeof result.popularity === 'number') {
    score += Math.min(result.popularity / 50, 8);
  }

  if (!Number.isFinite(releaseYear)) {
    score -= 40;
  }

  return score;
};

const selectBestSearchResult = (results, seed) => {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No TMDB movie search result for "${seed.query}"`);
  }

  return [...results].sort(
    (left, right) => scoreSearchResult(right, seed) - scoreSearchResult(left, seed)
  )[0];
};

const deriveTags = (detail) => {
  const rawKeywords = unique(
    (detail.keywords?.keywords ?? detail.keywords?.results ?? []).map((keyword) => keyword?.name?.trim())
  );
  const signalBlob = normalizeText(
    [rawKeywords.join(' '), detail.overview ?? '', detail.tagline ?? '', detail.title ?? ''].join(' ')
  );
  const tags = [];

  for (const matcher of reviewTagMatchers) {
    if (matcher.needles.some((needle) => signalBlob.includes(normalizeText(needle)))) {
      tags.push(matcher.tag);
    }
  }

  for (const genre of detail.genres.map((item) => item.name)) {
    for (const tag of genreFallbackTags[genre] ?? []) {
      tags.push(tag);
    }
  }

  const normalizedTags = unique(tags).slice(0, MAX_TAG_COUNT);

  if (normalizedTags.length > 0) {
    return normalizedTags;
  }

  return detail.genres.map((genre) => genre.name).slice(0, 2);
};

const deriveCredits = (detail) => {
  const cast = Array.isArray(detail.credits?.cast) ? detail.credits.cast : [];
  const crew = Array.isArray(detail.credits?.crew) ? detail.credits.crew : [];
  const topCast = cast.filter((person) => person && person.name).slice(0, MAX_CAST_COUNT);

  const characters = topCast.map((person) => person.character?.trim() || person.name.trim());
  const actorNames = topCast.map((person) => person.name.trim());
  const fallbackCharacter =
    actorNames[0] ??
    detail.title?.trim() ??
    detail.original_title?.trim() ??
    '주요 인물';
  const director =
    crew.find((person) => person.job === 'Director')?.name?.trim() ??
    crew.find((person) => person.department === 'Directing')?.name?.trim() ??
    '감독 미상';

  return {
    characters: unique(characters).slice(0, MAX_CAST_COUNT).length > 0
      ? unique(characters).slice(0, MAX_CAST_COUNT)
      : [fallbackCharacter],
    cast: unique(actorNames).slice(0, MAX_CAST_COUNT),
    director
  };
};

const mapWatchProviders = (providers) => {
  if (!Array.isArray(providers)) {
    return [];
  }

  return providers
    .map((provider) => {
      const providerId =
        provider && typeof provider.provider_id === 'number' ? provider.provider_id : null;
      const providerName =
        provider && typeof provider.provider_name === 'string' ? provider.provider_name.trim() : '';
      const logoPath =
        provider && typeof provider.logo_path === 'string' ? provider.logo_path.trim() : null;

      if (!providerId || !providerName) {
        return null;
      }

      return {
        providerId,
        providerName,
        logoPath,
        logoUrl: logoPath ? `${TMDB_PROVIDER_LOGO_BASE_URL}${logoPath}` : null
      };
    })
    .filter(Boolean);
};

const fetchWatchProviders = async (tmdbMovieId) => {
  const payload = await tmdbFetch(`/movie/${tmdbMovieId}/watch/providers`, {
    language: DEFAULT_LANGUAGE
  });
  const regionResult = payload.results?.[DEFAULT_REGION];

  if (!regionResult) {
    return null;
  }

  return {
    region: DEFAULT_REGION,
    link: typeof regionResult.link === 'string' ? regionResult.link : null,
    flatrate: mapWatchProviders(regionResult.flatrate),
    rent: mapWatchProviders(regionResult.rent),
    buy: mapWatchProviders(regionResult.buy)
  };
};

const fetchMovieDetail = async (tmdbMovieId) => {
  const detail = await tmdbFetch(`/movie/${tmdbMovieId}`, {
    language: DEFAULT_LANGUAGE,
    append_to_response: 'credits,keywords'
  });

  if (!detail.overview?.trim()) {
    const fallbackDetail = await tmdbFetch(`/movie/${tmdbMovieId}`, {
      language: 'en-US',
      append_to_response: 'keywords'
    });

    detail.overview = fallbackDetail.overview?.trim() || '';
    detail.keywords = detail.keywords ?? fallbackDetail.keywords;
  }

  return detail;
};

const buildCatalogMovie = async (seed, tmdbMovieId, detail, posterBaseUrl) => {
  if (!detail.poster_path) {
    throw new Error(`TMDB movie "${seed.query}" does not have a poster_path`);
  }

  const credits = deriveCredits(detail);
  const title = manualTitleOverrides[seed.id] ?? detail.title?.trim() ?? detail.original_title?.trim() ?? seed.query;
  const genres = detail.genres.map((genre) => genre.name).slice(0, MAX_GENRE_COUNT);
  const tags = deriveTags(detail);
  const watchProvidersKr = await fetchWatchProviders(tmdbMovieId);

  return {
    catalogMovie: {
      id: seed.id,
      tmdbMovieId,
      title,
      genres,
      genreIds: detail.genres.map((genre) => genre.id),
      tags,
      characters: credits.characters,
      overview: detail.overview?.trim() || '',
      releaseYear: Number.parseInt(String(detail.release_date ?? '').slice(0, 4), 10) || seed.year,
      posterUrl: `${posterBaseUrl}${detail.poster_path}`,
      posterAlt: `${title} 포스터`,
      watchProvidersKr
    },
    credits
  };
};

const fetchCatalogMovie = async (seed, posterBaseUrl) => {
  const overriddenMovieId = manualTmdbMovieIdOverrides[seed.id] ?? null;
  const resolvedMovieId = overriddenMovieId
    ? overriddenMovieId
    : selectBestSearchResult(
        (
          await tmdbFetch('/search/movie', {
            query: seed.query,
            language: DEFAULT_LANGUAGE,
            region: DEFAULT_REGION,
            include_adult: 'false',
            year: seed.year
          })
        ).results,
        seed
      ).id;
  const detail = await fetchMovieDetail(resolvedMovieId);

  return buildCatalogMovie(seed, resolvedMovieId, detail, posterBaseUrl);
};

const fetchCatalogMovieByTmdbMovieId = async (seed, posterBaseUrl) => {
  const detail = await fetchMovieDetail(seed.tmdbMovieId);
  return buildCatalogMovie(seed, seed.tmdbMovieId, detail, posterBaseUrl);
};

const buildDiscoverSearchParams = (tmdbGenreId, page) => ({
  language: DEFAULT_LANGUAGE,
  region: DEFAULT_REGION,
  watch_region: DEFAULT_REGION,
  with_watch_monetization_types: 'flatrate|rent|buy',
  include_adult: 'false',
  include_video: 'false',
  sort_by: 'popularity.desc',
  with_genres: String(tmdbGenreId),
  'vote_count.gte': String(DISCOVER_MIN_VOTE_COUNT),
  'release_date.lte': new Date().toISOString().slice(0, 10),
  page
});

const collectDiscoverCandidatesForGenre = async (genre, excludedTmdbMovieIds, targetCount) => {
  const seenTmdbMovieIds = new Set(excludedTmdbMovieIds);
  const candidates = [];

  for (let page = 1; page <= DISCOVER_PAGE_LIMIT && candidates.length < targetCount; page += 1) {
    const payload = await tmdbFetch('/discover/movie', buildDiscoverSearchParams(genre.tmdbGenreId, page));
    const results = Array.isArray(payload.results) ? payload.results : [];

    for (const result of results) {
      if (!result || typeof result.id !== 'number' || seenTmdbMovieIds.has(result.id)) {
        continue;
      }

      if (!result.poster_path) {
        continue;
      }

      const titleHint = result.title?.trim() || result.original_title?.trim();
      const releaseYear = Number.parseInt(String(result.release_date ?? '').slice(0, 4), 10);

      if (!titleHint || !Number.isFinite(releaseYear)) {
        continue;
      }

      candidates.push({
        sourceGenre: genre.key,
        tmdbMovieId: result.id,
        titleHint,
        year: releaseYear
      });
      seenTmdbMovieIds.add(result.id);

      if (candidates.length >= targetCount) {
        break;
      }
    }

    if (page >= Number(payload.total_pages ?? 0)) {
      break;
    }
  }

  return candidates;
};

const selectRoundRobinDiscoveryCandidates = (candidatesByGenre, excludedTmdbMovieIds, targetCount) => {
  const genreCursors = new Map(discoveryGenres.map((genre) => [genre.key, 0]));
  const usedTmdbMovieIds = new Set(excludedTmdbMovieIds);
  const selectedCandidates = [];
  let appendedInRound = true;

  while (selectedCandidates.length < targetCount && appendedInRound) {
    appendedInRound = false;

    for (const genre of discoveryGenres) {
      const bucket = candidatesByGenre[genre.key] ?? [];
      let cursor = genreCursors.get(genre.key) ?? 0;

      while (cursor < bucket.length && usedTmdbMovieIds.has(bucket[cursor].tmdbMovieId)) {
        cursor += 1;
      }

      genreCursors.set(genre.key, cursor);

      if (cursor >= bucket.length) {
        continue;
      }

      const candidate = bucket[cursor];
      genreCursors.set(genre.key, cursor + 1);
      usedTmdbMovieIds.add(candidate.tmdbMovieId);
      selectedCandidates.push(candidate);
      appendedInRound = true;

      if (selectedCandidates.length >= targetCount) {
        break;
      }
    }
  }

  return selectedCandidates;
};

const buildDiscoveredMovieSeeds = async (excludedTmdbMovieIds, startIndex, targetCount) => {
  if (targetCount <= 0) {
    return [];
  }

  const candidateTargetPerGenre = Math.max(
    90,
    Math.ceil(targetCount / discoveryGenres.length) * DISCOVER_CANDIDATE_MULTIPLIER
  );

  const candidatesByGenre = Object.fromEntries(
    await Promise.all(
      discoveryGenres.map(async (genre) => {
        console.log(`Collecting discover candidates for ${genre.key}...`);
        return [
          genre.key,
          await collectDiscoverCandidatesForGenre(genre, excludedTmdbMovieIds, candidateTargetPerGenre)
        ];
      })
    )
  );

  const selectedCandidates = selectRoundRobinDiscoveryCandidates(
    candidatesByGenre,
    excludedTmdbMovieIds,
    targetCount
  );

  if (selectedCandidates.length < targetCount) {
    throw new Error(
      `Unable to collect enough unique discovered movies. Needed ${targetCount}, got ${selectedCandidates.length}.`
    );
  }

  return selectedCandidates.map((candidate, index) => ({
    id: `movie_${startIndex + index}`,
    tmdbMovieId: candidate.tmdbMovieId,
    query: candidate.titleHint,
    year: candidate.year
  }));
};

const mapWithConcurrency = async (items, concurrency, mapper) => {
  if (items.length === 0) {
    return [];
  }

  const results = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
};

const toTypedTsExport = (importLine, exportName, typeName, value) =>
  `${importLine}\n\nexport const ${exportName}: ${typeName} = ${JSON.stringify(value, null, 2)};\n`;

const cinephileMovieSeeds = movieSeeds.filter(
  (seed) => Number.parseInt(seed.id.slice('movie_'.length), 10) > 500
);

const readCatalogData = async () => {
  const source = await readFile(path.join(srcDataDir, 'catalog.ts'), 'utf8');
  const match = source.match(
    /export const catalogMovies: CatalogMovie\[\] = ([\s\S]*?);\s*export const catalogLists: CatalogMovieList\[\] = ([\s\S]*);\s*$/u
  );

  if (!match) {
    throw new Error('Unable to read the current catalog source.');
  }

  return {
    catalogMovies: Function(`return (${match[1]});`)(),
    catalogLists: Function(`return (${match[2]});`)()
  };
};

const readMovieCredits = async () => {
  const source = await readFile(path.join(srcDataDir, 'movieCredits.ts'), 'utf8');
  const match = source.match(
    /export const movieCreditsById: Record<string, MovieCreditsProfile> = ([\s\S]*);\s*$/u
  );

  if (!match) {
    throw new Error('Unable to read the current movie credits source.');
  }

  return Function(`return (${match[1]});`)();
};

const syncCinephileMovies = async () => {
  const posterBaseUrl = await getPosterBase();
  const [catalogData, existingMovieCredits, cinephileEntries] = await Promise.all([
    readCatalogData(),
    readMovieCredits(),
    mapWithConcurrency(cinephileMovieSeeds, DETAIL_FETCH_CONCURRENCY, async (seed, index) => {
      console.log(`[cinephile ${index + 1}/${cinephileMovieSeeds.length}] ${seed.query} (${seed.year})`);
      return fetchCatalogMovie(seed, posterBaseUrl);
    })
  ]);
  const cinephileMovieIds = new Set(cinephileEntries.map((entry) => entry.catalogMovie.id));
  const catalogMovies = [
    ...catalogData.catalogMovies.filter((movie) => !cinephileMovieIds.has(movie.id)),
    ...cinephileEntries.map((entry) => entry.catalogMovie)
  ];
  const movieCreditsById = {
    ...existingMovieCredits,
    ...Object.fromEntries(cinephileEntries.map((entry) => [entry.catalogMovie.id, entry.credits]))
  };

  const catalogSource =
    toTypedTsExport(
      "import type { CatalogMovie, CatalogMovieList } from '@/types/recommendation';",
      'catalogMovies',
      'CatalogMovie[]',
      catalogMovies
    ) +
    `\nexport const catalogLists: CatalogMovieList[] = ${JSON.stringify(catalogData.catalogLists, null, 2)};\n`;
  const creditsSource = toTypedTsExport(
    "import type { MovieCreditsProfile } from '@/types/lists';",
    'movieCreditsById',
    'Record<string, MovieCreditsProfile>',
    movieCreditsById
  );

  await writeFile(path.join(srcDataDir, 'catalog.ts'), catalogSource, 'utf8');
  await writeFile(path.join(srcDataDir, 'movieCredits.ts'), creditsSource, 'utf8');
  console.log(`Added ${cinephileEntries.length} cinephile movies to the catalog.`);
};

const run = async () => {
  if (process.env.TMDB_SYNC_SCOPE === 'cinephile') {
    await syncCinephileMovies();
    return;
  }

  const posterBaseUrl = await getPosterBase();
  const curatedCount = movieSeeds.length;
  const autoExpandedCount = Math.max(0, TARGET_CATALOG_SIZE - curatedCount);

  console.log(`Syncing curated catalog movies (${curatedCount})...`);

  const curatedEntries = await mapWithConcurrency(
    movieSeeds,
    DETAIL_FETCH_CONCURRENCY,
    async (seed, index) => {
      console.log(`[curated ${index + 1}/${movieSeeds.length}] ${seed.query} (${seed.year})`);
      return fetchCatalogMovie(seed, posterBaseUrl);
    }
  );

  const curatedTmdbMovieIds = new Set(
    curatedEntries.map((entry) => entry.catalogMovie.tmdbMovieId)
  );

  console.log(`Building ${autoExpandedCount} additional discovered movies...`);

  const discoveredSeeds = await buildDiscoveredMovieSeeds(
    curatedTmdbMovieIds,
    FIRST_DISCOVERED_MOVIE_INDEX,
    autoExpandedCount
  );

  const discoveredEntries = await mapWithConcurrency(
    discoveredSeeds,
    DETAIL_FETCH_CONCURRENCY,
    async (seed, index) => {
      console.log(`[discover ${index + 1}/${discoveredSeeds.length}] ${seed.query} (${seed.year})`);
      return fetchCatalogMovieByTmdbMovieId(seed, posterBaseUrl);
    }
  );

  const combinedEntries = [...curatedEntries, ...discoveredEntries];
  const catalogMovies = combinedEntries.map((entry) => entry.catalogMovie);
  const movieCreditsById = Object.fromEntries(
    combinedEntries.map((entry) => [entry.catalogMovie.id, entry.credits])
  );
  const watchProviderMovieCount = catalogMovies.filter((movie) => movie.watchProvidersKr).length;
  const streamingMovieCount = catalogMovies.filter(
    (movie) => (movie.watchProvidersKr?.flatrate.length ?? 0) > 0
  ).length;
  const overviewMovieCount = catalogMovies.filter((movie) => movie.overview.trim().length > 0).length;

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

  console.log(`Stored ${catalogMovies.length} movies in catalog.`);
  console.log(`Stored overviews for ${overviewMovieCount}/${catalogMovies.length} movies.`);
  console.log(`Stored KR OTT data for ${watchProviderMovieCount}/${catalogMovies.length} movies.`);
  console.log(`Stored KR streaming providers for ${streamingMovieCount}/${catalogMovies.length} movies.`);
  console.log('TMDB catalog sync complete.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
