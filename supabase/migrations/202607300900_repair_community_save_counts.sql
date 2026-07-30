create or replace function public.refresh_community_post_count(p_post_id uuid, p_column text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_column = 'like_count' then
    update public.community_posts set like_count = (select count(*) from public.community_likes where post_id = p_post_id) where id = p_post_id;
  elsif p_column = 'save_count' then
    update public.community_posts set save_count = (select count(*) from public.community_saves where post_id = p_post_id) where id = p_post_id;
  elsif p_column = 'comment_count' then
    update public.community_posts set comment_count = (select count(*) from public.community_comments where post_id = p_post_id) where id = p_post_id;
  end if;
end;
$$;

create or replace function public.refresh_community_post_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_column text := tg_argv[0];
  v_post_id uuid;
begin
  v_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  perform public.refresh_community_post_count(v_post_id, v_column);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists refresh_community_save_count on public.community_saves;
create trigger refresh_community_save_count after insert or delete on public.community_saves
for each row execute function public.refresh_community_post_count_trigger('save_count');

create or replace function public.refresh_user_list_save_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_list_id text;
begin
  v_list_id := case when tg_op = 'DELETE' then old.list_id else new.list_id end;
  update public.user_lists
  set save_count = (select count(*) from public.list_interactions where list_id = v_list_id and saved = true)
  where id = v_list_id;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists refresh_user_list_save_count on public.list_interactions;
create trigger refresh_user_list_save_count after insert or update or delete on public.list_interactions
for each row execute function public.refresh_user_list_save_count_trigger();

update public.community_posts as post
set save_count = counts.save_count
from (
  select posts.id, count(saves.id)::integer as save_count
  from public.community_posts as posts
  left join public.community_saves as saves on saves.post_id = posts.id
  group by posts.id
) as counts
where post.id = counts.id
  and post.save_count is distinct from counts.save_count;

update public.user_lists as list
set save_count = counts.save_count
from (
  select lists.id, count(interactions.id) filter (where interactions.saved)::integer as save_count
  from public.user_lists as lists
  left join public.list_interactions as interactions on interactions.list_id = lists.id
  group by lists.id
) as counts
where list.id = counts.id
  and list.save_count is distinct from counts.save_count;
