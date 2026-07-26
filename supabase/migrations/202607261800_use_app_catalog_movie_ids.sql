-- 커뮤니티 영화 연결을 외부 TMDB ID가 아닌 앱 카탈로그 ID(movie_*)로 통일합니다.
-- 이미 저장된 숫자 ID는 텍스트로 보존하며, 프런트엔드에서 읽기 호환 처리합니다.
alter table public.community_posts
  alter column movie_id type text using movie_id::text;

alter table public.community_poll_options
  alter column movie_id type text using movie_id::text;

alter table public.recommendation_relays
  alter column movie_id type text using movie_id::text;

alter table public.community_mission_proofs
  alter column movie_id type text using movie_id::text;

create or replace function public.create_community_post(payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_post_id uuid;
  v_category text := payload ->> 'category';
  v_list_id text := nullif(payload ->> 'list_id', '');
  v_poll_id uuid;
  v_option jsonb;
  v_option_count integer := 0;
begin
  if auth.uid() is null then raise exception 'LOGIN_REQUIRED'; end if;
  if v_category not in ('movie_recommendation', 'list_share', 'mission_proof', 'movie_poll', 'daily_question') then
    raise exception 'INVALID_CATEGORY';
  end if;
  if v_category = 'list_share' and not exists (
    select 1 from public.user_lists where id = v_list_id and user_id = auth.uid() and is_private = false
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

    if v_option_count < 2 then raise exception 'POLL_OPTIONS_INVALID'; end if;
  end if;

  if v_category = 'mission_proof' then
    insert into public.community_mission_proofs (
      post_id, mission_id, mission_name, movie_id, movie_title, movie_poster_path, reflection, image_url, completed_at, badge_label
    ) values (
      v_post_id, nullif(payload ->> 'mission_id', ''), coalesce(nullif(payload ->> 'mission_name', ''), '영화 미션'),
      nullif(payload ->> 'mission_movie_id', ''), nullif(payload ->> 'mission_movie_title', ''),
      nullif(payload ->> 'mission_movie_poster_path', ''), coalesce(payload ->> 'mission_reflection', ''),
      nullif(payload ->> 'mission_image_url', ''), coalesce(nullif(payload ->> 'mission_completed_at', '')::date, current_date),
      coalesce(nullif(payload ->> 'mission_badge_label', ''), 'MISSION COMPLETE')
    );
  end if;

  return v_post_id;
end;
$$;
