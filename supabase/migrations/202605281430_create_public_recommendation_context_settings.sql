create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.recommendation_context_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_context text not null default 'normal'
    check (current_context in ('normal', 'after_exam', 'bed_time', 'with_friends', 'after_academy')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists recommendation_context_settings_updated_at_idx
on public.recommendation_context_settings (updated_at desc);

drop trigger if exists set_recommendation_context_settings_updated_at on public.recommendation_context_settings;
create trigger set_recommendation_context_settings_updated_at
before update on public.recommendation_context_settings
for each row
execute function public.set_updated_at();

alter table public.recommendation_context_settings enable row level security;

drop policy if exists "Users can read own recommendation context settings" on public.recommendation_context_settings;
create policy "Users can read own recommendation context settings"
on public.recommendation_context_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own recommendation context settings" on public.recommendation_context_settings;
create policy "Users can insert own recommendation context settings"
on public.recommendation_context_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own recommendation context settings" on public.recommendation_context_settings;
create policy "Users can update own recommendation context settings"
on public.recommendation_context_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own recommendation context settings" on public.recommendation_context_settings;
create policy "Users can delete own recommendation context settings"
on public.recommendation_context_settings
for delete
to authenticated
using (auth.uid() = user_id);
