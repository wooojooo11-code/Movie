import { catalogMovies } from '@/data/catalog';

type RatingMovie = (typeof catalogMovies)[number];
type TasteAnalysisGenreGroupKey = 'action' | 'comedy' | 'mystery' | 'romance' | 'sf';

const ACTION_GENRE = '\uC561\uC158';
const COMEDY_GENRE = '\uCF54\uBBF8\uB514';
const MYSTERY_GENRE = '\uBBF8\uC2A4\uD130\uB9AC';
const ROMANCE_GENRE = '\uB85C\uB9E8\uC2A4';
const THRILLER_GENRE = '\uC2A4\uB9B4\uB7EC';
const genreQuotaPerBatch = 4;

const genreDisplayOrder: TasteAnalysisGenreGroupKey[] = [
  'action',
  'mystery',
  'comedy',
  'romance',
  'sf'
];
const totalGenreGroupCount = genreDisplayOrder.length;

// Assign scarcer groups first so later balanced batches stay possible.
const genreAssignmentOrder: TasteAnalysisGenreGroupKey[] = [
  'sf',
  'romance',
  'comedy',
  'action',
  'mystery'
];

const genreMatchers: Record<TasteAnalysisGenreGroupKey, (movie: RatingMovie) => boolean> = {
  action: (movie) => movie.genres.includes(ACTION_GENRE),
  comedy: (movie) => movie.genres.includes(COMEDY_GENRE),
  mystery: (movie) =>
    movie.genres.includes(MYSTERY_GENRE) || movie.genres.includes(THRILLER_GENRE),
  romance: (movie) => movie.genres.includes(ROMANCE_GENRE),
  sf: (movie) => movie.genres.includes('SF')
};

const createEmptyGroupedPools = (): Record<TasteAnalysisGenreGroupKey, RatingMovie[]> => ({
  action: [],
  comedy: [],
  mystery: [],
  romance: [],
  sf: []
});

type FlowEdge = {
  cap: number;
  rev: number;
  to: number;
};

const addFlowEdge = (graph: FlowEdge[][], from: number, to: number, cap: number) => {
  const forwardEdge: FlowEdge = { to, rev: graph[to].length, cap };
  const backwardEdge: FlowEdge = { to: from, rev: graph[from].length, cap: 0 };
  graph[from].push(forwardEdge);
  graph[to].push(backwardEdge);
};

const tryBuildBalancedGroupedPools = (quotaPerGroup: number) => {
  const candidateMovies = catalogMovies.filter((movie) =>
    genreDisplayOrder.some((groupKey) => genreMatchers[groupKey](movie))
  );

  const sourceNode = 0;
  const movieNodeStart = 1;
  const groupNodeStart = movieNodeStart + candidateMovies.length;
  const sinkNode = groupNodeStart + totalGenreGroupCount;
  const graph: FlowEdge[][] = Array.from({ length: sinkNode + 1 }, () => []);

  candidateMovies.forEach((movie, movieIndex) => {
    const movieNode = movieNodeStart + movieIndex;

    addFlowEdge(graph, sourceNode, movieNode, 1);

    for (const groupKey of genreDisplayOrder) {
      if (genreMatchers[groupKey](movie)) {
        addFlowEdge(graph, movieNode, groupNodeStart + genreDisplayOrder.indexOf(groupKey), 1);
      }
    }
  });

  genreDisplayOrder.forEach((_, groupIndex) => {
    addFlowEdge(graph, groupNodeStart + groupIndex, sinkNode, quotaPerGroup);
  });

  let maxFlow = 0;

  while (true) {
    const previous: Array<{ edgeIndex: number; node: number } | null> = Array.from(
      { length: graph.length },
      () => null
    );
    const queue = [sourceNode];
    previous[sourceNode] = { node: -1, edgeIndex: -1 };

    for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
      const node = queue[queueIndex];

      for (let edgeIndex = 0; edgeIndex < graph[node].length; edgeIndex += 1) {
        const edge = graph[node][edgeIndex];

        if (edge.cap <= 0 || previous[edge.to] !== null) {
          continue;
        }

        previous[edge.to] = { node, edgeIndex };
        queue.push(edge.to);

        if (edge.to === sinkNode) {
          break;
        }
      }

      if (previous[sinkNode] !== null) {
        break;
      }
    }

    if (previous[sinkNode] === null) {
      break;
    }

    let pathCapacity = Number.POSITIVE_INFINITY;

    for (let node = sinkNode; node !== sourceNode; ) {
      const pathStep = previous[node];

      if (!pathStep) {
        pathCapacity = 0;
        break;
      }

      pathCapacity = Math.min(pathCapacity, graph[pathStep.node][pathStep.edgeIndex].cap);
      node = pathStep.node;
    }

    if (!Number.isFinite(pathCapacity) || pathCapacity <= 0) {
      break;
    }

    for (let node = sinkNode; node !== sourceNode; ) {
      const pathStep = previous[node];

      if (!pathStep) {
        break;
      }

      const edge = graph[pathStep.node][pathStep.edgeIndex];
      edge.cap -= pathCapacity;
      graph[node][edge.rev].cap += pathCapacity;
      node = pathStep.node;
    }

    maxFlow += pathCapacity;
  }

  if (maxFlow !== quotaPerGroup * totalGenreGroupCount) {
    return null;
  }

  const groupedPools = createEmptyGroupedPools();

  candidateMovies.forEach((movie, movieIndex) => {
    const movieNode = movieNodeStart + movieIndex;

    for (const edge of graph[movieNode]) {
      if (
        edge.to >= groupNodeStart &&
        edge.to < groupNodeStart + totalGenreGroupCount &&
        edge.cap === 0
      ) {
        const groupKey = genreDisplayOrder[edge.to - groupNodeStart];
        groupedPools[groupKey].push(movie);
        break;
      }
    }
  });

  return groupedPools;
};

const buildBalancedGroupedPools = () => {
  const candidateMovieCount = catalogMovies.filter((movie) =>
    genreDisplayOrder.some((groupKey) => genreMatchers[groupKey](movie))
  ).length;
  const maximumQuotaPerGroup =
    Math.floor(candidateMovieCount / totalGenreGroupCount / genreQuotaPerBatch) * genreQuotaPerBatch;

  for (
    let quotaPerGroup = maximumQuotaPerGroup;
    quotaPerGroup >= genreQuotaPerBatch;
    quotaPerGroup -= genreQuotaPerBatch
  ) {
    const groupedPools = tryBuildBalancedGroupedPools(quotaPerGroup);

    if (groupedPools) {
      return groupedPools;
    }
  }

  const fallbackPools = createEmptyGroupedPools();
  const assignedMovieIds = new Set<string>();

  for (const groupKey of genreAssignmentOrder) {
    for (const movie of catalogMovies) {
      if (assignedMovieIds.has(movie.id) || !genreMatchers[groupKey](movie)) {
        continue;
      }

      fallbackPools[groupKey].push(movie);
      assignedMovieIds.add(movie.id);
    }
  }

  return fallbackPools;
};

const groupedRatingMoviePools = buildBalancedGroupedPools();

const balancedBatchCount = Math.min(
  ...genreDisplayOrder.map((groupKey) =>
    Math.floor(groupedRatingMoviePools[groupKey].length / genreQuotaPerBatch)
  )
);

const buildBatchAtIndex = (batchIndex: number) =>
  genreDisplayOrder.flatMap((groupKey) => {
    const start = batchIndex * genreQuotaPerBatch;
    return groupedRatingMoviePools[groupKey].slice(start, start + genreQuotaPerBatch);
  });

const ratingBatches = Array.from({ length: balancedBatchCount }, (_, batchIndex) =>
  buildBatchAtIndex(batchIndex)
).filter((batch) => batch.length === genreQuotaPerBatch * totalGenreGroupCount);

const additionalRatingBatches = ratingBatches.slice(1);

export const primaryRatingMovies = ratingBatches[0] ?? [];
export const ratingMovies = ratingBatches.flat();
export const initialTasteAnalysisCount = primaryRatingMovies.length;
export const tasteAnalysisBatchSize = genreQuotaPerBatch * totalGenreGroupCount;
const primaryRatingMovieIdSet = new Set(primaryRatingMovies.map((movie) => movie.id));

export const getUnratedMoviesFromPool = (
  ratedMovieIds: readonly string[],
  pool: readonly RatingMovie[]
) => {
  const ratedIdSet = new Set(ratedMovieIds);
  return pool.filter((movie) => !ratedIdSet.has(movie.id));
};

export const getAdditionalBatchCount = () => additionalRatingBatches.length;

export const getAdditionalRatingBatchByIndex = (batchIndex: number) => {
  const safeBatchIndex = Math.max(0, batchIndex);
  return additionalRatingBatches[safeBatchIndex] ?? [];
};

export const getUnratedMoviesFromAdditionalBatch = (
  ratedMovieIds: readonly string[],
  batchIndex: number
) => getUnratedMoviesFromPool(ratedMovieIds, getAdditionalRatingBatchByIndex(batchIndex));

export const getNextAdditionalBatchIndex = (ratedMovieIds: readonly string[]) => {
  const totalBatchCount = getAdditionalBatchCount();

  for (let index = 0; index < totalBatchCount; index += 1) {
    if (getUnratedMoviesFromAdditionalBatch(ratedMovieIds, index).length > 0) {
      return index;
    }
  }

  return null;
};

export const getFollowingAdditionalBatchIndex = (
  ratedMovieIds: readonly string[],
  currentBatchIndex: number
) => {
  const totalBatchCount = getAdditionalBatchCount();

  for (let index = currentBatchIndex + 1; index < totalBatchCount; index += 1) {
    if (getUnratedMoviesFromAdditionalBatch(ratedMovieIds, index).length > 0) {
      return index;
    }
  }

  return null;
};

export const hasAdditionalTasteAnalysisMovies = (ratedMovieIds: readonly string[]) =>
  getNextAdditionalBatchIndex(ratedMovieIds) !== null;

export const buildAdditionalTasteAnalysisBatch = (
  ratedMovieIds: readonly string[],
  reservedMovieIds: readonly string[] = []
) => {
  const excludedMovieIds = new Set<string>([
    ...ratedMovieIds,
    ...reservedMovieIds,
    ...primaryRatingMovieIdSet
  ]);
  const nextBatch = genreDisplayOrder.flatMap((groupKey) =>
    groupedRatingMoviePools[groupKey]
      .filter((movie) => !excludedMovieIds.has(movie.id))
      .slice(0, genreQuotaPerBatch)
  );

  return nextBatch.length === tasteAnalysisBatchSize ? nextBatch : [];
};
