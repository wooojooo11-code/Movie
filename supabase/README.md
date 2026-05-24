# Supabase setup

Run these migrations in the Supabase SQL Editor.

## 1. Ratings table

Run:

- `supabase/migrations/202605091520_create_public_ratings.sql`

This creates:

- `public.ratings`
- unique constraint on `(user_id, movie_id)`
- RLS policies so each user can only read/write their own ratings

## 2. Recommendation exclusions table

Run:

- `supabase/migrations/202605161740_create_public_recommendation_exclusions.sql`

This creates:

- `public.recommendation_exclusions`
- storage for movies dismissed with the `already_seen` reason
- RLS policies so each user can only read/write their own exclusions

## 3. User lists tables

Run:

- `supabase/migrations/202605140915_create_public_user_lists_and_list_interactions.sql`

This creates:

- `public.user_lists`
- `public.list_interactions`
- RLS policies for personal list ownership

## 4. Allow reading shared lists

Run:

- `supabase/migrations/202605160930_allow_shared_user_lists.sql`

This updates the select policy on `public.user_lists` so authenticated users can read:

- their own lists
- other users' lists where `is_private = false`

## 5. Movie library table

Run:

- `supabase/migrations/202605231610_create_public_movie_library_items.sql`

This creates:

- `public.movie_library_items`
- storage for movies saved with the `보고싶어요` action
- RLS policies so each user can only read/write their own library

## 6. Environment variables

`.env.local` example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key

VITE_SUPABASE_RATINGS_SCHEMA=public
VITE_SUPABASE_RATINGS_TABLE=ratings
VITE_SUPABASE_RATINGS_USER_COLUMN=user_id

VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_SCHEMA=public
VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_TABLE=recommendation_exclusions
VITE_SUPABASE_RECOMMENDATION_EXCLUSIONS_USER_COLUMN=user_id

VITE_SUPABASE_USER_LISTS_SCHEMA=public
VITE_SUPABASE_USER_LISTS_TABLE=user_lists
VITE_SUPABASE_USER_LISTS_USER_COLUMN=user_id

VITE_SUPABASE_LIST_INTERACTIONS_SCHEMA=public
VITE_SUPABASE_LIST_INTERACTIONS_TABLE=list_interactions
VITE_SUPABASE_LIST_INTERACTIONS_USER_COLUMN=user_id

VITE_SUPABASE_MOVIE_LIBRARY_SCHEMA=public
VITE_SUPABASE_MOVIE_LIBRARY_TABLE=movie_library_items
VITE_SUPABASE_MOVIE_LIBRARY_USER_COLUMN=user_id
```

## 7. Table purposes

### `public.ratings`

Stores taste-analysis results:

- movie decision
- rating
- review tags
- favorite character
- memo fields

### `public.recommendation_exclusions`

Stores recommendation exclusions such as:

- `already_seen`

This lets `already seen` recommendations stay hidden across devices for the same account.

### `public.user_lists`

Stores user-created lists:

- title
- movie id array
- privacy/shared state
- counts and metadata

### `public.list_interactions`

Stores per-user reactions to shared lists:

- saved state
- personal rating

### `public.movie_library_items`

Stores movies saved to the user's library:

- movie id
- saved timestamp
- source such as `want_to_watch`
