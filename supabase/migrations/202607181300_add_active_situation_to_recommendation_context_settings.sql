alter table public.recommendation_context_settings
  add column if not exists active_situation jsonb;

alter table public.recommendation_context_settings
  add column if not exists active_situation_updated_at timestamptz;

update public.recommendation_context_settings
set active_situation = coalesce(active_situation, '{"kind":"none"}'::jsonb),
    active_situation_updated_at = coalesce(active_situation_updated_at, updated_at)
where active_situation is null
   or active_situation_updated_at is null;

alter table public.recommendation_context_settings
  alter column active_situation set default '{"kind":"none"}'::jsonb;

alter table public.recommendation_context_settings
  alter column active_situation_updated_at set default timezone('utc', now());

alter table public.recommendation_context_settings
  alter column active_situation set not null;

alter table public.recommendation_context_settings
  alter column active_situation_updated_at set not null;
