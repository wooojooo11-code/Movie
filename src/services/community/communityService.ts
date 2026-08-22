import {
  getCommunityFollowsRelation,
  getCommunityLikesRelation,
  getCommunityPostMoviesRelation,
  getCommunityPollOptionsRelation,
  getCommunityPollVotesRelation,
  getCommunityPollsRelation,
  getCommunityPostsRelation,
  getCommunityProfilesRelation,
  getCommunitySavesRelation,
  getDailyQuestionAnswersRelation,
  getDailyQuestionsRelation,
  getSupabaseUserListsRelation,
  isSupabaseConfigured,
  supabase
} from '@/lib/supabase';
import { getSituationDailyQuestion } from '@/data/situations';
import type {
  CommunityCategory,
  CommunityFeedPage,
  CommunityListReference,
  CommunityMovieReference,
  CommunityPost,
  CommunityPostDetail,
  CommunityPostDraft,
  CommunityProfile,
  CommunitySort,
  DailyQuestion,
  DailyQuestionAnswer,
  DailyQuestionAnswerInput
} from '@/types/community';
import type { CommunityPoll, CommunityPollOption } from '@/types/poll';
import type { CommunitySituationMovieSignal, SituationPresetId } from '@/types/recommendation';

type Row = Record<string, any>;

export interface CommunityFeedRequest {
  category: CommunityCategory | 'all';
  sort: CommunitySort;
  query: string;
  offset: number;
  limit?: number;
  viewerId?: null | string;
}

const ensureSupabase = () => {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('커뮤니티를 사용하려면 Supabase 연결 설정이 필요합니다.');
  }
};

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const asNullableString = (value: unknown): null | string => (typeof value === 'string' && value ? value : null);
// 이전 bigint 컬럼을 아직 마이그레이션하지 않은 환경도 게시글을 읽을 수 있게 합니다.
const asMovieId = (value: unknown): null | string =>
  typeof value === 'string' && value
    ? value
    : typeof value === 'number' && Number.isFinite(value)
      ? String(value)
      : null;

const toProfile = (row: Row): CommunityProfile => ({
  id: asString(row.user_id),
  nickname: asString(row.author_name, '영화 친구'),
  avatarUrl: asNullableString(row.author_avatar_url)
});

const toDailyAnswerAuthor = (userId: string, profile?: Row): CommunityProfile => ({
  id: userId,
  nickname: asString(profile?.nickname, 'Movie friend'),
  avatarUrl: asNullableString(profile?.avatar_url)
});

const toMovie = (id: unknown, title: unknown, posterPath: unknown): null | CommunityMovieReference => {
  const movieId = asMovieId(id);
  const movieTitle = asNullableString(title);

  return movieId && movieTitle
    ? { id: movieId, title: movieTitle, posterPath: asNullableString(posterPath) }
    : null;
};

const toList = (row: Row | undefined): null | CommunityListReference => {
  if (!row?.id) {
    return null;
  }

  return {
    id: asString(row.id),
    title: asString(row.title, '제목 없는 리스트'),
    description: asString(row.description),
    movieIds: Array.isArray(row.movie_ids) ? row.movie_ids.filter((id): id is string => typeof id === 'string') : [],
    saveCount: asNumber(row.save_count)
  };
};

const toPost = (
  row: Row,
  lists = new Map<string, CommunityListReference>(),
  moviesByPost = new Map<string, CommunityMovieReference[]>()
): CommunityPost => {
  const id = asString(row.id);
  const legacyMovie = toMovie(row.movie_id, row.movie_title, row.movie_poster_path);
  // 새 연결 테이블이 아직 없는 이전 게시글도 첫 번째 영화를 그대로 보여줍니다.
  const movies = moviesByPost.get(id) ?? (legacyMovie ? [legacyMovie] : []);

  return {
    id,
    userId: asString(row.user_id),
    category: row.category as CommunityCategory,
    title: asString(row.title),
    content: asString(row.content),
    movie: movies[0] ?? legacyMovie,
    movies,
    list: row.list_id ? lists.get(asString(row.list_id)) ?? null : null,
    imageUrl: asNullableString(row.image_url),
    hasSpoiler: Boolean(row.has_spoiler),
    author: toProfile(row),
    likeCount: asNumber(row.like_count),
    commentCount: asNumber(row.comment_count),
    saveCount: asNumber(row.save_count),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at)
  };
};

const queryListReferences = async (posts: readonly Row[]) => {
  const listIds = [...new Set(posts.map((post) => asNullableString(post.list_id)).filter(Boolean))] as string[];
  const relation = getSupabaseUserListsRelation();

  if (!relation || listIds.length === 0) {
    return new Map<string, CommunityListReference>();
  }

  const { data, error } = await relation
    .select('id, title, description, movie_ids, save_count')
    .in('id', listIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((row: Row) => [asString(row.id), toList(row)!]));
};

const queryPostMovies = async (posts: readonly Row[]) => {
  const postIds = [...new Set(posts.map((post) => asString(post.id)).filter(Boolean))];
  const relation = getCommunityPostMoviesRelation();

  if (!relation || postIds.length === 0) {
    return new Map<string, CommunityMovieReference[]>();
  }

  const { data, error } = await relation
    .select('post_id, movie_id, movie_title, movie_poster_path, position')
    .in('post_id', postIds)
    .order('position', { ascending: true });

  // 새 SQL을 적용하기 전에도 기존 커뮤니티 화면은 계속 열리도록 이전 단일 영화 값으로 되돌립니다.
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return new Map<string, CommunityMovieReference[]>();
    }
    throw error;
  }

  const moviesByPost = new Map<string, CommunityMovieReference[]>();
  for (const row of (data ?? []) as Row[]) {
    const movie = toMovie(row.movie_id, row.movie_title, row.movie_poster_path);
    const postId = asString(row.post_id);
    if (!movie || !postId) continue;
    const movies = moviesByPost.get(postId) ?? [];
    movies.push(movie);
    moviesByPost.set(postId, movies);
  }
  return moviesByPost;
};

const queryPolls = async (postIds: readonly string[], viewerId?: null | string) => {
  const pollsRelation = getCommunityPollsRelation();
  const optionsRelation = getCommunityPollOptionsRelation();

  if (!pollsRelation || !optionsRelation || postIds.length === 0) {
    return new Map<string, CommunityPoll>();
  }

  const { data: polls, error: pollsError } = await pollsRelation.select('*').in('post_id', postIds);
  if (pollsError) throw pollsError;
  const pollRows = (polls ?? []) as Row[];
  const pollIds = pollRows.map((poll) => asString(poll.id));

  if (pollIds.length === 0) {
    return new Map<string, CommunityPoll>();
  }

  const { data: options, error: optionsError } = await optionsRelation
    .select('*')
    .in('poll_id', pollIds)
    .order('position');
  if (optionsError) throw optionsError;

  let viewerVotes: Row[] = [];
  const votesRelation = getCommunityPollVotesRelation();
  if (viewerId && votesRelation) {
    const { data, error } = await votesRelation.select('poll_id, option_id').eq('user_id', viewerId).in('poll_id', pollIds);
    if (error) throw error;
    viewerVotes = (data ?? []) as Row[];
  }

  const voteByPoll = new Map(viewerVotes.map((vote) => [asString(vote.poll_id), asNullableString(vote.option_id)]));
  const optionsByPoll = new Map<string, CommunityPollOption[]>();
  for (const option of (options ?? []) as Row[]) {
    const pollId = asString(option.poll_id);
    const next: CommunityPollOption = {
      id: asString(option.id),
      pollId,
      optionText: asString(option.option_text),
      movie: toMovie(option.movie_id, option.movie_title, option.movie_poster_path),
      voteCount: asNumber(option.vote_count),
      position: asNumber(option.position)
    };
    optionsByPoll.set(pollId, [...(optionsByPoll.get(pollId) ?? []), next]);
  }

  return new Map(
    pollRows.map((poll) => [
      asString(poll.post_id),
      {
        id: asString(poll.id),
        postId: asString(poll.post_id),
        question: asString(poll.question),
        options: optionsByPoll.get(asString(poll.id)) ?? [],
        viewerOptionId: voteByPoll.get(asString(poll.id)) ?? null
      }
    ])
  );
};

const decoratePosts = async (rows: readonly Row[], viewerId?: null | string) => {
  const [lists, polls, moviesByPost] = await Promise.all([
    queryListReferences(rows),
    queryPolls(rows.map((row) => asString(row.id)), viewerId),
    queryPostMovies(rows)
  ]);
  return rows.map((row) => ({ ...toPost(row, lists, moviesByPost), poll: polls.get(asString(row.id)) }));
};

const cleanSearchTerm = (query: string) => query.trim().replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ');

// 예전 Supabase 설정에는 여러 관련 영화를 담는 테이블이 없을 수 있어, 글을 만들기 전에 안내 가능한 오류로 바꿉니다.
const ensureMultipleRelatedMoviesSupported = async () => {
  const relation = getCommunityPostMoviesRelation();
  if (!relation) throw new Error('관련 영화 저장 기능을 사용할 수 없습니다.');

  const { error } = await relation.select('post_id').limit(1);
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      throw new Error('여러 관련 영화를 등록하려면 최신 커뮤니티 SQL을 먼저 실행해 주세요.');
    }
    throw error;
  }

  return relation;
};

export const fetchCommunityFeed = async (request: CommunityFeedRequest): Promise<CommunityFeedPage> => {
  ensureSupabase();
  const relation = getCommunityPostsRelation()!;
  const pageSize = request.limit ?? 10;
  let query = relation.select('*').neq('category', 'mission_proof');

  if (request.category !== 'all') {
    query = query.eq('category', request.category);
  }

  const term = cleanSearchTerm(request.query);
  if (term) {
    const wildcard = `*${term}*`;
    query = query.or(`title.ilike.${wildcard},content.ilike.${wildcard},movie_title.ilike.${wildcard},author_name.ilike.${wildcard}`);
  }

  const ordering: Record<CommunitySort, { column: string; ascending: boolean }> = {
    latest: { column: 'created_at', ascending: false },
    popular: { column: 'like_count', ascending: false },
    comments: { column: 'comment_count', ascending: false },
    saves: { column: 'save_count', ascending: false }
  };
  const order = ordering[request.sort];
  const { data, error } = await query
    .order(order.column, { ascending: order.ascending })
    .order('created_at', { ascending: false })
    .range(request.offset, request.offset + pageSize);

  if (error) throw error;
  const rows = (data ?? []) as Row[];
  return { posts: await decoratePosts(rows.slice(0, pageSize), request.viewerId), hasMore: rows.length > pageSize };
};

export const fetchPopularPosts = async (viewerId?: null | string) =>
  (await fetchCommunityFeed({ category: 'all', sort: 'popular', query: '', offset: 0, limit: 3, viewerId })).posts;

export const fetchViewerPostInteractions = async (postIds: readonly string[], userId?: null | string) => {
  const liked = new Set<string>();
  const saved = new Set<string>();
  if (!userId || postIds.length === 0) return { liked, saved };
  ensureSupabase();
  const [likes, saves] = await Promise.all([
    getCommunityLikesRelation()!.select('post_id').eq('user_id', userId).in('post_id', postIds),
    getCommunitySavesRelation()!.select('post_id').eq('user_id', userId).in('post_id', postIds)
  ]);
  if (likes.error || saves.error) throw likes.error ?? saves.error;
  for (const row of (likes.data ?? []) as Row[]) liked.add(asString(row.post_id));
  for (const row of (saves.data ?? []) as Row[]) saved.add(asString(row.post_id));
  return { liked, saved };
};

// 저장한 글은 최신 저장 순서대로 일부만 보여 주고, 전체 개수는 별도로 함께 반환합니다.
export const fetchSavedCommunityPosts = async (userId: string, limit = 3) => {
  ensureSupabase();
  const savesRelation = getCommunitySavesRelation()!;
  const { data: saves, error: savesError, count } = await savesRelation
    .select('post_id, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (savesError) throw savesError;

  const savedPostIds = ((saves ?? []) as Row[]).map((save) => asString(save.post_id)).filter(Boolean);
  if (savedPostIds.length === 0) return { posts: [] as CommunityPost[], totalCount: count ?? 0 };

  const { data: postRows, error: postsError } = await getCommunityPostsRelation()!
    .select('*')
    .in('id', savedPostIds)
    .neq('category', 'mission_proof');
  if (postsError) throw postsError;

  const decoratedPosts = (await decoratePosts((postRows ?? []) as Row[], userId)) as CommunityPost[];
  const postsById = new Map<string, CommunityPost>(decoratedPosts.map((post) => [post.id, post]));
  const posts: CommunityPost[] = [];

  // 저장한 시각 순서를 유지하기 위해, 조회 결과를 저장 목록의 id 순서로 다시 정렬합니다.
  savedPostIds.forEach((postId) => {
    const post = postsById.get(postId);
    if (post) posts.push(post);
  });

  return {
    posts,
    totalCount: count ?? savedPostIds.length
  };
};

export const fetchCommunityPost = async (postId: string, viewerId?: null | string): Promise<CommunityPostDetail> => {
  ensureSupabase();
  const relation = getCommunityPostsRelation()!;
  const { data, error } = await relation.select('*').eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('게시글을 찾을 수 없습니다.');
  if ((data as Row).category === 'mission_proof') throw new Error('게시글을 찾을 수 없습니다.');
  const [post] = await decoratePosts([data as Row], viewerId);
  const viewer = { hasLiked: false, hasSaved: false, isFollowingAuthor: false };

  if (viewerId) {
    const [likes, saves, follows] = await Promise.all([
      getCommunityLikesRelation()!.select('id').eq('post_id', postId).eq('user_id', viewerId).maybeSingle(),
      getCommunitySavesRelation()!.select('id').eq('post_id', postId).eq('user_id', viewerId).maybeSingle(),
      post.userId === viewerId
        ? Promise.resolve({ data: null, error: null })
        : getCommunityFollowsRelation()!.select('id').eq('follower_id', viewerId).eq('following_id', post.userId).maybeSingle()
    ]);
    if (likes.error || saves.error || follows.error) throw likes.error ?? saves.error ?? follows.error;
    viewer.hasLiked = Boolean(likes.data);
    viewer.hasSaved = Boolean(saves.data);
    viewer.isFollowingAuthor = Boolean(follows.data);
  }
  return { ...post, viewer, relays: [] };
};

export const ensureCommunityProfile = async (userId: string, nickname: string, avatarUrl?: null | string) => {
  ensureSupabase();
  const relation = getCommunityProfilesRelation()!;
  const { error } = await relation.upsert({ id: userId, nickname: nickname.trim() || '영화 친구', avatar_url: avatarUrl ?? null });
  if (error) throw error;
};

export const createCommunityPost = async (draft: CommunityPostDraft) => {
  ensureSupabase();
  // 첫 번째 영화는 이전 검색·정렬 호환용으로 게시글 본문에도 함께 저장합니다.
  const relatedMovies = draft.movies.length > 0 ? draft.movies : draft.movie ? [draft.movie] : [];
  const primaryMovie = relatedMovies[0] ?? null;
  // 여러 편을 선택했다면 글을 만들기 전에 저장 테이블이 준비됐는지 먼저 확인합니다.
  const postMoviesRelation = relatedMovies.length > 1 ? await ensureMultipleRelatedMoviesSupported() : null;
  const payload = {
    category: draft.category,
    title: draft.title.trim(),
    content: draft.content.trim(),
    movie_id: primaryMovie?.id ?? null,
    movie_title: primaryMovie?.title ?? null,
    movie_poster_path: primaryMovie?.posterPath ?? null,
    related_movies: relatedMovies.map((movie) => ({
      movie_id: movie.id,
      movie_title: movie.title,
      movie_poster_path: movie.posterPath
    })),
    list_id: draft.listId,
    image_url: draft.imageUrl.trim() || null,
    has_spoiler: draft.hasSpoiler,
    poll_question: draft.pollQuestion.trim() || draft.title.trim(),
    poll_options: draft.pollOptions.filter((option) => option.optionText.trim()).map((option) => ({
      option_text: option.optionText.trim(),
      movie_id: option.movie?.id ?? null,
      movie_title: option.movie?.title ?? null,
      movie_poster_path: option.movie?.posterPath ?? null
    }))
  };
  const { data, error } = await supabase!.rpc('create_community_post', { payload });
  if (error) throw error;

  const postId = asString(data);

  // 오래된 RPC가 첫 번째 영화만 저장해도, 선택한 모든 영화를 보조 테이블에 한 번 더 저장해 누락을 막습니다.
  if (postMoviesRelation && postId) {
    const { error: moviesError } = await postMoviesRelation.upsert(
      relatedMovies.map((movie, index) => ({
        post_id: postId,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_poster_path: movie.posterPath,
        position: index + 1
      })),
      { onConflict: 'post_id,movie_id', ignoreDuplicates: true }
    );
    if (moviesError) throw moviesError;
  }

  return postId;
};

export const updateCommunityPost = async (postId: string, draft: Pick<CommunityPostDraft, 'title' | 'content' | 'imageUrl' | 'hasSpoiler' | 'movie'>) => {
  ensureSupabase();
  const { error } = await getCommunityPostsRelation()!
    .update({
      title: draft.title.trim(), content: draft.content.trim(), image_url: draft.imageUrl.trim() || null,
      has_spoiler: draft.hasSpoiler, movie_id: draft.movie?.id ?? null,
      movie_title: draft.movie?.title ?? null, movie_poster_path: draft.movie?.posterPath ?? null
    })
    .eq('id', postId);
  if (error) throw error;
};

export const deleteCommunityPost = async (postId: string) => {
  ensureSupabase();
  const { error } = await getCommunityPostsRelation()!.delete().eq('id', postId);
  if (error) throw error;
};

const toggleRelation = async (relation: any, key: string, postId: string, userId: string, active: boolean) => {
  const request = active
    ? relation.delete().eq('post_id', postId).eq('user_id', userId)
    : relation.insert({ post_id: postId, user_id: userId });
  const { error } = await request;
  if (error) throw error;
  return !active;
};

export const toggleCommunityLike = (postId: string, userId: string, active: boolean) =>
  toggleRelation(getCommunityLikesRelation()!, 'like', postId, userId, active);

export const toggleCommunitySave = async (postId: string, userId: string) => {
  ensureSupabase();
  const savesRelation = getCommunitySavesRelation()!;
  const { data: existingSave, error: existingSaveError } = await savesRelation
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSaveError) throw existingSaveError;

  const { error: mutationError } = existingSave
    ? await savesRelation.delete().eq('post_id', postId).eq('user_id', userId)
    : await savesRelation.insert({ post_id: postId, user_id: userId });

  // A second browser tab can attempt the same save at the same time. In that case,
  // the unique constraint means the post is already saved, which is the desired state.
  if (mutationError && mutationError.code !== '23505') throw mutationError;

  const [{ data: savedRow, error: savedRowError }, { data: postRow, error: postRowError }] = await Promise.all([
    savesRelation.select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
    getCommunityPostsRelation()!.select('save_count').eq('id', postId).maybeSingle()
  ]);

  if (savedRowError || postRowError) throw savedRowError ?? postRowError;

  return {
    saved: Boolean(savedRow),
    saveCount: Math.max(0, asNumber((postRow as Row | null)?.save_count))
  };
};

export const toggleCommunityFollow = async (followingId: string, userId: string, active: boolean) => {
  ensureSupabase();
  const relation = getCommunityFollowsRelation()!;
  const { error } = active
    ? await relation.delete().eq('follower_id', userId).eq('following_id', followingId)
    : await relation.insert({ follower_id: userId, following_id: followingId });
  if (error) throw error;
  return !active;
};

const seoulDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

export const fetchDailyQuestion = async (viewerId?: null | string): Promise<DailyQuestion | null> => {
  ensureSupabase();
  const { data, error } = await getDailyQuestionsRelation()!.select('*').eq('active_date', seoulDate()).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const question = data as Row;
  const answersRelation = getDailyQuestionAnswersRelation()!;
  const [{ count, error: countError }, answerResult] = await Promise.all([
    answersRelation.select('*', { count: 'exact', head: true }).eq('question_id', question.id),
    viewerId ? answersRelation.select('*').eq('question_id', question.id).eq('user_id', viewerId).maybeSingle() : Promise.resolve({ data: null, error: null })
  ]);
  if (countError || answerResult.error) throw countError ?? answerResult.error;
  const answer = answerResult.data as Row | null;
  const answerMovie = answer ? toMovie(answer.movie_id, answer.movie_title, answer.movie_poster_path) : null;
  const activeDate = asString(question.active_date);
  const situationQuestion = getSituationDailyQuestion(activeDate);
  return {
    id: asString(question.id),
    question: situationQuestion?.question ?? asString(question.question),
    activeDate,
    situationPresetId: situationQuestion?.situationId ?? null,
    answerCount: count ?? 0,
    viewerAnswer: answer ? {
      id: asString(answer.id), questionId: asString(answer.question_id), userId: asString(answer.user_id),
      content: asString(answer.content) === answerMovie?.title ? '' : asString(answer.content), createdAt: asString(answer.created_at), updatedAt: asString(answer.updated_at),
      movie: answerMovie,
      author: toDailyAnswerAuthor(asString(answer.user_id))
    } : null
  };
};

// Hide the viewer's own answer so this view focuses on other community members.
export const fetchDailyQuestionAnswers = async (questionId: string, excludeUserId?: null | string): Promise<DailyQuestionAnswer[]> => {
  ensureSupabase();
  let query = getDailyQuestionAnswersRelation()!
    .select('id, question_id, user_id, content, movie_id, movie_title, movie_poster_path, created_at, updated_at')
    .eq('question_id', questionId);

  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
  if (error) throw error;

  const answers = (data ?? []) as Row[];
  const userIds = [...new Set(answers.map((answer) => asString(answer.user_id)).filter(Boolean))];
  const profilesById = new Map<string, Row>();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await getCommunityProfilesRelation()!
      .select('id, nickname, avatar_url')
      .in('id', userIds);
    if (profilesError) throw profilesError;
    for (const profile of (profiles ?? []) as Row[]) {
      profilesById.set(asString(profile.id), profile);
    }
  }

  return answers.map((answer) => {
    const userId = asString(answer.user_id);
    const movie = toMovie(answer.movie_id, answer.movie_title, answer.movie_poster_path);
    return {
      id: asString(answer.id),
      questionId: asString(answer.question_id),
      userId,
      content: asString(answer.content) === movie?.title ? '' : asString(answer.content),
      movie,
      createdAt: asString(answer.created_at),
      updatedAt: asString(answer.updated_at),
      author: toDailyAnswerAuthor(userId, profilesById.get(userId))
    };
  });
};

export const saveDailyQuestionAnswer = async (
  questionId: string,
  userId: string,
  input: DailyQuestionAnswerInput
): Promise<DailyQuestionAnswer> => {
  ensureSupabase();
  const { data, error } = await getDailyQuestionAnswersRelation()!
    .upsert(
      {
        question_id: questionId,
        user_id: userId,
        content: input.content.trim() || input.movie.title,
        movie_id: input.movie.id,
        movie_title: input.movie.title,
        movie_poster_path: input.movie.posterPath
      },
      { onConflict: 'question_id,user_id' }
    )
    .select('*').single();
  if (error) throw error;
  const row = data as Row;
  const movie = toMovie(row.movie_id, row.movie_title, row.movie_poster_path);
  return {
    id: asString(row.id), questionId: asString(row.question_id), userId: asString(row.user_id),
    content: asString(row.content) === movie?.title ? '' : asString(row.content), createdAt: asString(row.created_at), updatedAt: asString(row.updated_at),
    movie,
    author: toDailyAnswerAuthor(asString(row.user_id))
  };
};

export const fetchSituationCommunityMovieSignals = async (
  situationPresetId: SituationPresetId
): Promise<CommunitySituationMovieSignal[]> => {
  ensureSupabase();

  const { data: questions, error: questionsError } = await getDailyQuestionsRelation()!
    .select('id')
    .eq('situation_preset_id', situationPresetId);
  if (questionsError) throw questionsError;

  const questionIds = (questions ?? []).map((question: Row) => asString(question.id)).filter(Boolean);
  if (questionIds.length === 0) return [];

  const { data: answers, error: answersError } = await getDailyQuestionAnswersRelation()!
    .select('movie_id')
    .in('question_id', questionIds);
  if (answersError) throw answersError;

  const countByMovieId = new Map<string, number>();
  for (const answer of (answers ?? []) as Row[]) {
    const movieId = asMovieId(answer.movie_id);
    if (!movieId) continue;
    countByMovieId.set(movieId, (countByMovieId.get(movieId) ?? 0) + 1);
  }

  return [...countByMovieId.entries()]
    .map(([movieId, answerCount]) => ({ movieId, answerCount }))
    .sort((left, right) => right.answerCount - left.answerCount || left.movieId.localeCompare(right.movieId));
};

export const fetchMyShareableLists = async (userId: string): Promise<CommunityListReference[]> => {
  ensureSupabase();
  const relation = getSupabaseUserListsRelation();
  if (!relation) return [];
  const { data, error } = await relation.select('id, title, description, movie_ids, save_count').eq('user_id', userId).eq('is_private', false).order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => toList(row)!).filter(Boolean);
};
