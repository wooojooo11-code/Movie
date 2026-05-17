create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.recommendation_exclusions (
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  reason text not null default 'already_seen' check (reason in ('already_seen')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, movie_id, reason)
);

create index if not exists recommendation_exclusions_user_id_idx
on public.recommendation_exclusions (user_id);

create index if not exists recommendation_exclusions_updated_at_idx
on public.recommendation_exclusions (updated_at desc);

drop trigger if exists set_recommendation_exclusions_updated_at on public.recommendation_exclusions;
create trigger set_recommendation_exclusions_updated_at
before update on public.recommendation_exclusions
for each row
execute function public.set_updated_at();

alter table public.recommendation_exclusions enable row level security;

drop policy if exists "Users can read own recommendation exclusions" on public.recommendation_exclusions;
create policy "Users can read own recommendation exclusions"
on public.recommendation_exclusions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own recommendation exclusions" on public.recommendation_exclusions;
create policy "Users can insert own recommendation exclusions"
on public.recommendation_exclusions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own recommendation exclusions" on public.recommendation_exclusions;
create policy "Users can update own recommendation exclusions"
on public.recommendation_exclusions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recommendation exclusions" on public.recommendation_exclusions;
create policy "Users can delete own recommendation exclusions"
on public.recommendation_exclusions
for delete
to authenticated
using (auth.uid() = user_id);
