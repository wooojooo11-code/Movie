ALTER TABLE public.movie_library_items
  ADD COLUMN IF NOT EXISTS rating numeric(2, 1),
  ADD COLUMN IF NOT EXISTS review_text text NOT NULL DEFAULT '';

ALTER TABLE public.movie_library_items
  DROP CONSTRAINT IF EXISTS movie_library_items_rating_range_check;

ALTER TABLE public.movie_library_items
  ADD CONSTRAINT movie_library_items_rating_range_check
  CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5 AND mod(rating * 2, 1) = 0));

ALTER TABLE public.movie_library_items
  DROP CONSTRAINT IF EXISTS movie_library_items_review_text_length_check;

ALTER TABLE public.movie_library_items
  ADD CONSTRAINT movie_library_items_review_text_length_check
  CHECK (char_length(review_text) <= 160);
