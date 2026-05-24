create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.movie_library_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  source text not null default 'want_to_watch' check (source in ('want_to_watch')),
  saved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, movie_id)
);

create index if not exists movie_library_items_user_id_idx
on public.movie_library_items (user_id);

create index if not exists movie_library_items_saved_at_idx
on public.movie_library_items (saved_at desc);

drop trigger if exists set_movie_library_items_updated_at on public.movie_library_items;
create trigger set_movie_library_items_updated_at
before update on public.movie_library_items
for each row
execute function public.set_updated_at();

alter table public.movie_library_items enable row level security;

drop policy if exists "Users can read own movie library items" on public.movie_library_items;
create policy "Users can read own movie library items"
on public.movie_library_items
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own movie library items" on public.movie_library_items;
create policy "Users can insert own movie library items"
on public.movie_library_items
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own movie library items" on public.movie_library_items;
create policy "Users can update own movie library items"
on public.movie_library_items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own movie library items" on public.movie_library_items;
create policy "Users can delete own movie library items"
on public.movie_library_items
for delete
to authenticated
using (auth.uid() = user_id);
