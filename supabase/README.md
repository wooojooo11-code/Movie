# Supabase setup

## ratings 테이블 만들기

1. Supabase 대시보드에서 현재 프로젝트를 엽니다.
2. `SQL Editor`로 이동합니다.
3. `supabase/migrations/202605091520_create_public_ratings.sql` 파일 내용을 붙여넣고 실행합니다.

이 스크립트는 아래를 한 번에 만듭니다.

- `public.ratings` 테이블
- `(user_id, movie_id)` 유니크 제약
- `updated_at` 자동 갱신 트리거
- 로그인한 사용자가 자기 데이터만 읽고 쓰게 하는 RLS 정책

## 앱이 기대하는 컬럼

- `user_id`
- `movie_id`
- `status`
- `rating`
- `review_tags`
- `favorite_character`
- `answered_at`
- `raw_decision`
- `detail_completed`
- `review_text`
- `question_text`

## 앱 환경 변수

`.env.local` 예시:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
VITE_SUPABASE_RATINGS_SCHEMA=public
VITE_SUPABASE_RATINGS_TABLE=ratings
VITE_SUPABASE_RATINGS_USER_COLUMN=user_id
```
