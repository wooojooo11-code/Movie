import {
  getCommunityFollowsRelation,
  getCommunityLikesRelation,
  getCommunityMissionProofsRelation,
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
  MissionProof
} from '@/types/community';
import type { CommunityPoll, CommunityPollOption } from '@/types/poll';

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

const toPost = (row: Row, lists = new Map<string, CommunityListReference>()): CommunityPost => ({
  id: asString(row.id),
  userId: asString(row.user_id),
  category: row.category as CommunityCategory,
  title: asString(row.title),
  content: asString(row.content),
  movie: toMovie(row.movie_id, row.movie_title, row.movie_poster_path),
  list: row.list_id ? lists.get(asString(row.list_id)) ?? null : null,
  imageUrl: asNullableString(row.image_url),
  hasSpoiler: Boolean(row.has_spoiler),
  author: toProfile(row),
  likeCount: asNumber(row.like_count),
  commentCount: asNumber(row.comment_count),
  saveCount: asNumber(row.save_count),
  createdAt: asString(row.created_at),
  updatedAt: asString(row.updated_at)
});

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

const queryMissionProofs = async (postIds: readonly string[]) => {
  const relation = getCommunityMissionProofsRelation();
  if (!relation || postIds.length === 0) return new Map<string, MissionProof>();
  const { data, error } = await relation.select('*').in('post_id', postIds);
  if (error) throw error;
  return new Map(
    ((data ?? []) as Row[]).map((row) => [
      asString(row.post_id),
      {
        missionId: asNullableString(row.mission_id),
        missionName: asString(row.mission_name),
        movie: toMovie(row.movie_id, row.movie_title, row.movie_poster_path),
        reflection: asString(row.reflection),
        imageUrl: asNullableString(row.image_url),
        completedAt: asString(row.completed_at),
        badgeLabel: asString(row.badge_label, 'MISSION COMPLETE')
      }
    ])
  );
};

const decoratePosts = async (rows: readonly Row[], viewerId?: null | string) => {
  const [lists, polls, missionProofs] = await Promise.all([
    queryListReferences(rows),
    queryPolls(rows.map((row) => asString(row.id)), viewerId),
    queryMissionProofs(rows.map((row) => asString(row.id)))
  ]);
  return rows.map((row) => ({ ...toPost(row, lists), poll: polls.get(asString(row.id)), missionProof: missionProofs.get(asString(row.id)) }));
};

const cleanSearchTerm = (query: string) => query.trim().replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ');

export const fetchCommunityFeed = async (request: CommunityFeedRequest): Promise<CommunityFeedPage> => {
  ensureSupabase();
  const relation = getCommunityPostsRelation()!;
  const pageSize = request.limit ?? 10;
  let query = relation.select('*');

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

export const fetchCommunityPost = async (postId: string, viewerId?: null | string): Promise<CommunityPostDetail> => {
  ensureSupabase();
  const relation = getCommunityPostsRelation()!;
  const { data, error } = await relation.select('*').eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('게시글을 찾을 수 없습니다.');
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
  const payload = {
    category: draft.category,
    title: draft.title.trim(),
    content: draft.content.trim(),
    movie_id: draft.movie?.id ?? null,
    movie_title: draft.movie?.title ?? null,
    movie_poster_path: draft.movie?.posterPath ?? null,
    list_id: draft.listId,
    image_url: draft.imageUrl.trim() || null,
    has_spoiler: draft.hasSpoiler,
    poll_question: draft.pollQuestion.trim() || draft.title.trim(),
    poll_options: draft.pollOptions.filter((option) => option.optionText.trim()).map((option) => ({
      option_text: option.optionText.trim(),
      movie_id: option.movie?.id ?? null,
      movie_title: option.movie?.title ?? null,
      movie_poster_path: option.movie?.posterPath ?? null
    })),
    mission_id: draft.mission.id,
    mission_name: draft.mission.name.trim(),
    mission_movie_id: draft.mission.movie?.id ?? null,
    mission_movie_title: draft.mission.movie?.title ?? null,
    mission_movie_poster_path: draft.mission.movie?.posterPath ?? null,
    mission_reflection: draft.mission.reflection.trim(),
    mission_image_url: draft.mission.imageUrl.trim() || null,
    mission_completed_at: draft.mission.completedAt,
    mission_badge_label: draft.mission.badgeLabel.trim()
  };
  const { data, error } = await supabase!.rpc('create_community_post', { payload });
  if (error) throw error;
  return asString(data);
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
export const toggleCommunitySave = (postId: string, userId: string, active: boolean) =>
  toggleRelation(getCommunitySavesRelation()!, 'save', postId, userId, active);

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
  return {
    id: asString(question.id), question: asString(question.question), activeDate: asString(question.active_date),
    answerCount: count ?? 0,
    viewerAnswer: answer ? { id: asString(answer.id), questionId: asString(answer.question_id), userId: asString(answer.user_id), content: asString(answer.content), createdAt: asString(answer.created_at), updatedAt: asString(answer.updated_at) } : null
  };
};

export const saveDailyQuestionAnswer = async (questionId: string, userId: string, content: string): Promise<DailyQuestionAnswer> => {
  ensureSupabase();
  const { data, error } = await getDailyQuestionAnswersRelation()!
    .upsert({ question_id: questionId, user_id: userId, content: content.trim() }, { onConflict: 'question_id,user_id' })
    .select('*').single();
  if (error) throw error;
  const row = data as Row;
  return { id: asString(row.id), questionId: asString(row.question_id), userId: asString(row.user_id), content: asString(row.content), createdAt: asString(row.created_at), updatedAt: asString(row.updated_at) };
};

export const fetchMyShareableLists = async (userId: string): Promise<CommunityListReference[]> => {
  ensureSupabase();
  const relation = getSupabaseUserListsRelation();
  if (!relation) return [];
  const { data, error } = await relation.select('id, title, description, movie_ids, save_count').eq('user_id', userId).eq('is_private', false).order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => toList(row)!).filter(Boolean);
};
