import type {
  ListSearchResult,
  MovieSearchResult,
  SearchMatchField,
  SearchResultsPayload,
  SearchableCatalogMovie,
  SharedMovieListRecord,
  UserMovieListRecord
} from '@/types/lists';

const normalize = (value: string) => value.toLocaleLowerCase('ko-KR').replace(/\s+/g, '');

const includesQuery = (value: string, query: string) => normalize(value).includes(query);

const MOVIE_MATCH_WEIGHT: Record<SearchMatchField, number> = {
  title: 5,
  director: 4,
  actor: 4,
  genre: 2,
  tag: 2,
  owner: 1,
  movie: 1
};

const LIST_MATCH_WEIGHT: Record<SearchMatchField, number> = {
  title: 5,
  movie: 3,
  owner: 2,
  director: 1,
  actor: 1,
  genre: 1,
  tag: 1
};

const addMatch = (matchedBy: SearchMatchField[], field: SearchMatchField) => {
  if (!matchedBy.includes(field)) {
    matchedBy.push(field);
  }
};

const buildMovieMatches = (movie: SearchableCatalogMovie, query: string) => {
  const matchedBy: SearchMatchField[] = [];

  if (includesQuery(movie.title, query)) {
    addMatch(matchedBy, 'title');
  }

  if (includesQuery(movie.director, query)) {
    addMatch(matchedBy, 'director');
  }

  if (movie.cast.some((actor) => includesQuery(actor, query))) {
    addMatch(matchedBy, 'actor');
  }

  if (movie.genres.some((genre) => includesQuery(genre, query))) {
    addMatch(matchedBy, 'genre');
  }

  if (movie.tags.some((tag) => includesQuery(tag, query))) {
    addMatch(matchedBy, 'tag');
  }

  return matchedBy;
};

const buildListMatches = (
  list: SharedMovieListRecord | UserMovieListRecord,
  query: string,
  movieMap: Record<string, SearchableCatalogMovie>
) => {
  const matchedBy: SearchMatchField[] = [];

  if (includesQuery(list.title, query)) {
    addMatch(matchedBy, 'title');
  }

  if (includesQuery(list.ownerName, query)) {
    addMatch(matchedBy, 'owner');
  }

  if (
    list.movieIds.some((movieId) => {
      const movie = movieMap[movieId];

      return movie ? includesQuery(movie.title, query) : false;
    })
  ) {
    addMatch(matchedBy, 'movie');
  }

  return matchedBy;
};

const sortByWeight = <T extends { score: number }>(items: T[]) => items.sort((a, b) => b.score - a.score);

export interface ListSearchCatalog {
  movies: SearchableCatalogMovie[];
  userLists: UserMovieListRecord[];
  sharedLists: SharedMovieListRecord[];
}

export interface ListSearchService {
  search(query: string, catalog: ListSearchCatalog): Promise<SearchResultsPayload>;
}

export const mockListSearchService: ListSearchService = {
  async search(query, catalog) {
    const trimmedQuery = normalize(query);

    if (!trimmedQuery) {
      return {
        movies: [],
        lists: []
      };
    }

    const movieMap = Object.fromEntries(catalog.movies.map((movie) => [movie.id, movie])) as Record<
      string,
      SearchableCatalogMovie
    >;

    const movies = sortByWeight(
      catalog.movies
        .map((movie) => {
          const matchedBy = buildMovieMatches(movie, trimmedQuery);

          if (matchedBy.length === 0) {
            return null;
          }

          return {
            type: 'movie' as const,
            movie,
            matchedBy,
            score: matchedBy.reduce((sum, field) => sum + MOVIE_MATCH_WEIGHT[field], 0)
          };
        })
        .filter((item): item is MovieSearchResult & { score: number } => Boolean(item))
    )
      .slice(0, 8)
      .map(({ score: _score, ...result }) => result);

    const lists = sortByWeight(
      [...catalog.userLists, ...catalog.sharedLists]
        .map((list) => {
          const matchedBy = buildListMatches(list, trimmedQuery, movieMap);

          if (matchedBy.length === 0) {
            return null;
          }

          return {
            type: 'list' as const,
            list,
            source: 'createdAt' in list ? ('mine' as const) : ('shared' as const),
            matchedBy,
            score: matchedBy.reduce((sum, field) => sum + LIST_MATCH_WEIGHT[field], 0)
          };
        })
        .filter((item): item is ListSearchResult & { score: number } => Boolean(item))
    )
      .slice(0, 6)
      .map(({ score: _score, ...result }) => result);

    return {
      movies,
      lists
    };
  }
};
