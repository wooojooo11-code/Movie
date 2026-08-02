-- 커뮤니티의 미션 인증 기능을 비활성화합니다.
-- 기존 데이터와 테이블은 삭제하지 않습니다. 이미 작성된 미션 인증 글은 공개 목록과 상세 조회에서만 숨깁니다.

-- 이전 미션 인증 글을 포함하지 않도록 게시글 읽기/작성/수정 권한을 다시 설정합니다.
drop policy if exists "Community posts are public" on public.community_posts;
create policy "Community posts are public"
on public.community_posts for select to public
using (category <> 'mission_proof');

drop policy if exists "Users create own community posts" on public.community_posts;
create policy "Users create own community posts"
on public.community_posts for insert to authenticated
with check (auth.uid() = user_id and category <> 'mission_proof');

drop policy if exists "Users update own community posts" on public.community_posts;
create policy "Users update own community posts"
on public.community_posts for update to authenticated
using (auth.uid() = user_id and category <> 'mission_proof')
with check (auth.uid() = user_id and category <> 'mission_proof');

-- 미션 인증 부속 테이블은 RLS를 유지하되 브라우저에서 더 이상 읽거나 작성할 수 없게 합니다.
drop policy if exists "Mission proofs are public" on public.community_mission_proofs;
drop policy if exists "Owners create mission proofs" on public.community_mission_proofs;
drop policy if exists "Owners update mission proofs" on public.community_mission_proofs;

-- 게시글, 관련 영화, 투표를 한 번에 만드는 RPC에서도 미션 인증 유형을 허용하지 않습니다.
create or replace function public.create_community_post(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid;
  v_category text := payload ->> 'category';
  v_list_id text := nullif(payload ->> 'list_id', '');
  v_poll_id uuid;
  v_option jsonb;
  v_option_count integer := 0;
  v_related_movie jsonb;
  v_related_movie_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'LOGIN_REQUIRED';
  end if;

  if v_category not in ('movie_recommendation', 'list_share', 'movie_poll', 'daily_question') then
    raise exception 'INVALID_CATEGORY';
  end if;

  if v_category = 'list_share' and not exists (
    select 1
    from public.user_lists
    where id = v_list_id and user_id = auth.uid() and is_private = false
  ) then
    raise exception 'SHARED_LIST_REQUIRED';
  end if;

  insert into public.community_posts (
    user_id, category, title, content, movie_id, movie_title, movie_poster_path, list_id, image_url, has_spoiler
  ) values (
    auth.uid(), v_category, trim(payload ->> 'title'), coalesce(payload ->> 'content', ''),
    nullif(payload ->> 'movie_id', ''), nullif(payload ->> 'movie_title', ''),
    nullif(payload ->> 'movie_poster_path', ''), v_list_id, nullif(payload ->> 'image_url', ''),
    coalesce((payload ->> 'has_spoiler')::boolean, false)
  ) returning id into v_post_id;

  -- 관련 영화는 개수 제한 없이 순서대로 저장합니다.
  for v_related_movie in
    select value from jsonb_array_elements(coalesce(payload -> 'related_movies', '[]'::jsonb))
  loop
    if nullif(v_related_movie ->> 'movie_id', '') is not null
      and nullif(v_related_movie ->> 'movie_title', '') is not null then
      v_related_movie_count := v_related_movie_count + 1;
      insert into public.community_post_movies (post_id, movie_id, movie_title, movie_poster_path, position)
      values (
        v_post_id,
        nullif(v_related_movie ->> 'movie_id', ''),
        nullif(v_related_movie ->> 'movie_title', ''),
        nullif(v_related_movie ->> 'movie_poster_path', ''),
        v_related_movie_count
      )
      on conflict (post_id, movie_id) do nothing;
    end if;
  end loop;

  -- 예전 단일 관련 영화 데이터와의 호환을 위해 첫 영화는 기존 칼럼에도 남깁니다.
  if v_related_movie_count = 0
    and nullif(payload ->> 'movie_id', '') is not null
    and nullif(payload ->> 'movie_title', '') is not null then
    insert into public.community_post_movies (post_id, movie_id, movie_title, movie_poster_path, position)
    values (
      v_post_id, nullif(payload ->> 'movie_id', ''), nullif(payload ->> 'movie_title', ''),
      nullif(payload ->> 'movie_poster_path', ''), 1
    )
    on conflict (post_id, movie_id) do nothing;
  end if;

  if v_category = 'movie_poll' then
    insert into public.community_polls (post_id, question)
    values (v_post_id, trim(coalesce(payload ->> 'poll_question', payload ->> 'title')))
    returning id into v_poll_id;

    for v_option in select value from jsonb_array_elements(coalesce(payload -> 'poll_options', '[]'::jsonb)) loop
      v_option_count := v_option_count + 1;
      insert into public.community_poll_options (poll_id, option_text, movie_id, movie_title, movie_poster_path, position)
      values (
        v_poll_id, trim(v_option ->> 'option_text'), nullif(v_option ->> 'movie_id', ''),
        nullif(v_option ->> 'movie_title', ''), nullif(v_option ->> 'movie_poster_path', ''), v_option_count
      );
    end loop;

    if v_option_count < 2 then
      raise exception 'POLL_OPTIONS_INVALID';
    end if;
  end if;

  return v_post_id;
end;
$$;

grant execute on function public.create_community_post(jsonb) to authenticated;
