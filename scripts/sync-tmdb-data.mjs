import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const DEFAULT_LANGUAGE = 'ko-KR';
const DEFAULT_REGION = 'KR';
const SEARCH_LANGUAGE = 'en-US';
const FALLBACK_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/';
const FALLBACK_POSTER_SIZE = 'w780';

const movieSeeds = [
  { id: 'movie_1', query: 'Mad Max: Fury Road', year: 2015 },
  { id: 'movie_2', query: 'Knives Out', year: 2019 },
  { id: 'movie_3', query: 'La La Land', year: 2016 },
  { id: 'movie_4', query: 'The Grand Budapest Hotel', year: 2014 },
  { id: 'movie_5', query: 'The Dark Knight', year: 2008 },
  { id: 'movie_6', query: 'Parasite', year: 2019 },
  { id: 'movie_7', query: 'Gattaca', year: 1997 },
  { id: 'movie_8', query: 'Gone Girl', year: 2014 },
  { id: 'movie_9', query: 'Whiplash', year: 2014 },
  { id: 'movie_10', query: 'John Wick', year: 2014 },
  { id: 'movie_11', query: '12 Monkeys', year: 1995 },
  { id: 'movie_12', query: 'Sunshine', year: 2007 },
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
  { id: 'movie_44', query: 'Snowpiercer', year: 2013 },
  { id: 'movie_45', query: 'The Host', year: 2006 },
  { id: 'movie_46', query: 'Train to Busan', year: 2016 },
  { id: 'movie_47', query: 'The Wailing', year: 2016 },
  { id: 'movie_48', query: 'Upgrade', year: 2018 },
  { id: 'movie_49', query: 'Close Encounters of the Third Kind', year: 1977 },
  { id: 'movie_50', query: 'Little Women', year: 2019 },
  { id: 'movie_51', query: 'Ad Astra', year: 2019 },
  { id: 'movie_52', query: 'Call Me by Your Name', year: 2017 },
  { id: 'movie_53', query: 'Portrait of a Lady on Fire', year: 2019 },
  { id: 'movie_54', query: 'Brooklyn', year: 2015 },
  { id: 'movie_55', query: 'Toy Story 3', year: 2010 },
  { id: 'movie_56', query: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
  { id: 'movie_57', query: 'The Lord of the Rings: The Two Towers', year: 2002 },
  { id: 'movie_58', query: 'The Lord of the Rings: The Return of the King', year: 2003 },
  { id: 'movie_59', query: 'Get Out', year: 2017 },
  { id: 'movie_60', query: 'Hereditary', year: 2018 },
  { id: 'movie_61', query: 'The Menu', year: 2022 },
  { id: 'movie_62', query: 'Nope', year: 2022 },
  { id: 'movie_63', query: 'Fight Club', year: 1999 },
  { id: 'movie_64', query: 'A Walk to Remember', year: 2002 },
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
  { id: 'movie_134', query: 'Back to the Future', year: 1985 },
  { id: 'movie_135', query: 'Back to the Future Part II', year: 1989 },
  { id: 'movie_136', query: 'Star Trek', year: 2009 },
  { id: 'movie_137', query: 'Star Trek Into Darkness', year: 2013 },
  { id: 'movie_138', query: 'District 9', year: 2009 },
  { id: 'movie_139', query: 'Gravity', year: 2013 },
  { id: 'movie_140', query: 'Moon', year: 2009 },
  { id: 'movie_141', query: 'Looper', year: 2012 },
  { id: 'movie_142', query: 'Children of Men', year: 2006 },
  { id: 'movie_143', query: 'Ready Player One', year: 2018 },
  { id: 'movie_144', query: 'Oblivion', year: 2013 },
  { id: 'movie_145', query: 'A.I. Artificial Intelligence', year: 2001 },
  { id: 'movie_146', query: 'War of the Worlds', year: 2005 },
  { id: 'movie_147', query: 'The Day the Earth Stood Still', year: 2008 },
  { id: 'movie_148', query: 'Source Code', year: 2011 },
  { id: 'movie_149', query: 'I, Robot', year: 2004 },
  { id: 'movie_150', query: 'Contact', year: 1997 },
  { id: 'movie_151', query: 'Predator', year: 1987 },
  { id: 'movie_152', query: 'The Fifth Element', year: 1997 },
  { id: 'movie_153', query: 'WALL·E', year: 2008 },
  { id: 'movie_154', query: 'Pretty Woman', year: 1990 },
  { id: 'movie_155', query: 'The Holiday', year: 2006 },
  { id: 'movie_156', query: "You've Got Mail", year: 1998 },
  { id: 'movie_157', query: 'Crazy Rich Asians', year: 2018 },
  { id: 'movie_158', query: 'Me Before You', year: 2016 },
  { id: 'movie_159', query: '10 Things I Hate About You', year: 1999 },
  { id: 'movie_160', query: 'Love Actually', year: 2003 },
  { id: 'movie_161', query: 'The Big Sick', year: 2017 },
  { id: 'movie_162', query: 'The Fault in Our Stars', year: 2014 },
  { id: 'movie_163', query: 'Always Be My Maybe', year: 2019 },
  { id: 'movie_164', query: 'My Sassy Girl', year: 2001 },
  { id: 'movie_165', query: 'About Fate', year: 2022 },
  { id: 'movie_166', query: 'How to Lose a Guy in 10 Days', year: 2003 },
  { id: 'movie_167', query: 'The Vow', year: 2012 },
  { id: 'movie_168', query: 'Crazy, Stupid, Love.', year: 2011 },
  { id: 'movie_169', query: "Ferris Bueller's Day Off", year: 1986 },
  { id: 'movie_170', query: 'Legally Blonde', year: 2001 },
  { id: 'movie_171', query: 'Easy A', year: 2010 },
  { id: 'movie_172', query: '21 Jump Street', year: 2012 },
  { id: 'movie_173', query: 'The Hangover', year: 2009 },
  { id: 'movie_174', query: 'Clueless', year: 1995 },
  { id: 'movie_175', query: 'Anchorman: The Legend of Ron Burgundy', year: 2004 },
  { id: 'movie_176', query: 'Office Space', year: 1999 },
  { id: 'movie_177', query: 'Step Brothers', year: 2008 },
  { id: 'movie_178', query: 'Game Night', year: 2018 },
  { id: 'movie_179', query: 'Napoleon Dynamite', year: 2004 },
  { id: 'movie_180', query: 'Pitch Perfect', year: 2012 },
  { id: 'movie_181', query: 'The Mask', year: 1994 },
  { id: 'movie_182', query: 'One Day', year: 2011 },
  { id: 'movie_183', query: 'Raiders of the Lost Ark', year: 1981 },
  { id: 'movie_184', query: 'John Wick: Chapter 2', year: 2017 },
  { id: 'movie_185', query: 'John Wick: Chapter 3 - Parabellum', year: 2019 },
  { id: 'movie_186', query: 'Taken', year: 2008 },
  { id: 'movie_187', query: 'The Fugitive', year: 1993 },
  { id: 'movie_188', query: 'The Road Warrior', year: 1981 },
  { id: 'movie_189', query: 'The Last Samurai', year: 2003 },
  { id: 'movie_190', query: 'Face/Off', year: 1997 },
  { id: 'movie_191', query: 'RoboCop', year: 1987 },
  { id: 'movie_192', query: 'Bad Boys', year: 1995 },
  { id: 'movie_193', query: 'Nightcrawler', year: 2014 },
  { id: 'movie_194', query: 'Wind River', year: 2017 },
  { id: 'movie_195', query: 'Primal Fear', year: 1996 },
  { id: 'movie_196', query: 'Insomnia', year: 2002 },
  { id: 'movie_197', query: 'Identity', year: 2003 },
  { id: 'movie_198', query: 'Gone Baby Gone', year: 2007 },
  { id: 'movie_199', query: 'The Bone Collector', year: 1999 },
  { id: 'movie_200', query: 'The Invisible Guest', year: 2016 }
];

const TARGET_CATALOG_MOVIE_COUNT = 500;
const buildPages = (count) => Array.from({ length: count }, (_, index) => index + 1);
const discoverReleaseDateCutoff = new Date().toISOString().slice(0, 10);
const additionalDiscoverBuckets = [
  {
    key: 'animation',
    targetCount: 50,
    withGenres: '16',
    voteCountGte: 80,
    pages: buildPages(8)
  },
  {
    key: 'action',
    targetCount: 50,
    withGenres: '28',
    voteCountGte: 150,
    pages: buildPages(8)
  },
  {
    key: 'thriller',
    targetCount: 50,
    withGenres: '53',
    voteCountGte: 100,
    pages: buildPages(8)
  },
  {
    key: 'comedy',
    targetCount: 50,
    withGenres: '35',
    voteCountGte: 100,
    pages: buildPages(8)
  },
  {
    key: 'romance',
    targetCount: 50,
    withGenres: '10749',
    voteCountGte: 80,
    pages: buildPages(8)
  },
  {
    key: 'sf',
    targetCount: 50,
    withGenres: '878',
    voteCountGte: 80,
    pages: buildPages(8)
  }
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
const normalizeTitle = (value) =>
  normalizeText(String(value ?? ''))
    .normalize('NFKC')
    .replace(/&/gu, 'and')
    .replace(/[^\p{L}\p{N}]+/gu, '');

const unique = (values) => [...new Set(values.filter(Boolean))];

const selectBestSearchResult = (results, seed) => {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No TMDB movie search result for "${seed.query}"`);
  }

  const normalizedSeedTitle = normalizeTitle(seed.query);

  const scoredResults = results.map((item) => {
    const normalizedTitle = normalizeTitle(item.title);
    const normalizedOriginalTitle = normalizeTitle(item.original_title);
    const releaseYear =
      typeof item.release_date === 'string'
        ? Number.parseInt(item.release_date.slice(0, 4), 10)
        : Number.NaN;

    let score = 0;

    if (normalizedTitle === normalizedSeedTitle) {
      score += 300;
    } else if (normalizedTitle.includes(normalizedSeedTitle) || normalizedSeedTitle.includes(normalizedTitle)) {
      score += 120;
    }

    if (normalizedOriginalTitle === normalizedSeedTitle) {
      score += 260;
    } else if (
      normalizedOriginalTitle.includes(normalizedSeedTitle) ||
      normalizedSeedTitle.includes(normalizedOriginalTitle)
    ) {
      score += 110;
    }

    if (!Number.isNaN(releaseYear)) {
      const yearDistance = Math.abs(releaseYear - seed.year);

      if (yearDistance === 0) {
        score += 60;
      } else if (yearDistance === 1) {
        score += 18;
      } else if (yearDistance === 2) {
        score += 6;
      }
    }

    if (item.poster_path) {
      score += 20;
    }

    score += Math.min(Number(item.popularity ?? 0), 50) * 0.1;

    return { item, score };
  });

  scoredResults.sort((left, right) => {
    const leftHasPoster = Boolean(left.item.poster_path);
    const rightHasPoster = Boolean(right.item.poster_path);

    if (leftHasPoster !== rightHasPoster) {
      return Number(rightHasPoster) - Number(leftHasPoster);
    }

    return right.score - left.score;
  });

  return scoredResults[0]?.item ?? results[0];
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
  const movieSummary =
    typeof seed.tmdbId === 'number'
      ? {
          id: seed.tmdbId,
          title: seed.query,
          original_title: seed.query,
          release_date: `${seed.year}-01-01`
        }
      : selectBestSearchResult(
          (
            await tmdbFetch('/search/movie', {
              query: seed.query,
              language: SEARCH_LANGUAGE,
              include_adult: 'false',
              year: seed.year
            })
          ).results,
          seed
        );
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
    tmdbId: detail.id,
    catalogMovie: {
      id: seed.id,
      title,
      genres,
      genreIds: detail.genres.map((genre) => genre.id),
      tags,
      characters: credits.characters,
      releaseYear: Number.parseInt(String(detail.release_date ?? '').slice(0, 4), 10) || seed.year,
      posterUrl: `${posterBaseUrl}${detail.poster_path}`,
      posterAlt: `${title} 포스터`
    },
    credits
  };
};

const buildAdditionalSeed = (sequenceNumber, candidate) => ({
  id: `movie_${sequenceNumber}`,
  tmdbId: candidate.tmdbId,
  query: candidate.query,
  year: candidate.year
});

const discoverAdditionalCandidatesForBucket = async (bucket, excludedTmdbIds) => {
  const candidates = [];

  for (const page of bucket.pages) {
    if (candidates.length >= bucket.targetCount) {
      break;
    }

    console.log(`Discovering ${bucket.key} candidates (page ${page})`);

    const response = await tmdbFetch('/discover/movie', {
      language: DEFAULT_LANGUAGE,
      include_adult: 'false',
      sort_by: 'popularity.desc',
      with_genres: bucket.withGenres,
      page,
      'vote_count.gte': bucket.voteCountGte,
      'primary_release_date.lte': discoverReleaseDateCutoff
    });

    for (const result of response.results ?? []) {
      if (candidates.length >= bucket.targetCount) {
        break;
      }

      if (!result || typeof result.id !== 'number' || excludedTmdbIds.has(result.id) || !result.poster_path) {
        continue;
      }

      const releaseYear =
        typeof result.release_date === 'string'
          ? Number.parseInt(result.release_date.slice(0, 4), 10)
          : Number.NaN;

      if (!Number.isFinite(releaseYear)) {
        continue;
      }

      const title =
        String(result.title ?? '').trim() ||
        String(result.original_title ?? '').trim() ||
        `TMDB movie ${result.id}`;

      excludedTmdbIds.add(result.id);
      candidates.push({
        tmdbId: result.id,
        query: title,
        year: releaseYear
      });
    }
  }

  return candidates;
};

const discoverAdditionalMovieSeeds = async (startingSequenceNumber, excludedTmdbIds) => {
  const additionalSeeds = [];

  for (const bucket of additionalDiscoverBuckets) {
    const bucketCandidates = await discoverAdditionalCandidatesForBucket(bucket, excludedTmdbIds);

    if (bucketCandidates.length < bucket.targetCount) {
      throw new Error(
        `Could not find enough TMDB candidates for bucket "${bucket.key}". ` +
          `Expected ${bucket.targetCount}, received ${bucketCandidates.length}.`
      );
    }

    for (const candidate of bucketCandidates) {
      additionalSeeds.push(buildAdditionalSeed(startingSequenceNumber + additionalSeeds.length, candidate));
    }
  }

  return additionalSeeds.slice(0, Math.max(0, TARGET_CATALOG_MOVIE_COUNT - movieSeeds.length));
};

const toTypedTsExport = (importLine, exportName, typeName, value) =>
  `${importLine}\n\nexport const ${exportName}: ${typeName} = ${JSON.stringify(value, null, 2)};\n`;

const run = async () => {
  const posterBaseUrl = await getPosterBase();
  const catalogMovies = [];
  const movieCreditsById = {};
  const usedTmdbIds = new Set();

  for (const seed of movieSeeds) {
    console.log(`Syncing ${seed.id}: ${seed.query} (${seed.year})`);
    const { tmdbId, catalogMovie, credits } = await fetchCatalogMovie(seed, posterBaseUrl);
    catalogMovies.push(catalogMovie);
    movieCreditsById[seed.id] = credits;
    usedTmdbIds.add(tmdbId);
  }

  const additionalSeedCount = Math.max(0, TARGET_CATALOG_MOVIE_COUNT - movieSeeds.length);

  if (additionalSeedCount > 0) {
    const additionalSeeds = await discoverAdditionalMovieSeeds(movieSeeds.length + 1, usedTmdbIds);

    if (additionalSeeds.length < additionalSeedCount) {
      throw new Error(
        `Only generated ${additionalSeeds.length} additional seeds. ` +
          `Target was ${additionalSeedCount}.`
      );
    }

    for (const seed of additionalSeeds.slice(0, additionalSeedCount)) {
      console.log(`Syncing ${seed.id}: ${seed.query} (${seed.year})`);
      const { tmdbId, catalogMovie, credits } = await fetchCatalogMovie(seed, posterBaseUrl);
      catalogMovies.push(catalogMovie);
      movieCreditsById[seed.id] = credits;
      usedTmdbIds.add(tmdbId);
    }
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
