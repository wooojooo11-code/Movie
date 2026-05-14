# Supabase setup

## 1. 취향분석 `ratings` 테이블 만들기
1. Supabase 대시보드에서 현재 프로젝트를 엽니다.
2. `SQL Editor`로 이동합니다.
3. `supabase/migrations/202605091520_create_public_ratings.sql` 내용을 붙여넣고 실행합니다.

이 스크립트는 아래를 만듭니다.
- `public.ratings` 테이블
- `(user_id, movie_id)` 유니크 제약
- `updated_at` 자동 갱신 트리거
- 로그인한 사용자가 자기 데이터만 읽고 쓰게 하는 RLS 정책

## 2. 리스트용 테이블 만들기
1. 같은 `SQL Editor`에서
2. `supabase/migrations/202605140915_create_public_user_lists_and_list_interactions.sql` 내용을 붙여넣고 실행합니다.

이 스크립트는 아래를 만듭니다.
- `public.user_lists`
- `public.list_interactions`
- 리스트/반응용 `updated_at` 자동 갱신 트리거
- 로그인한 사용자가 자기 리스트와 반응만 읽고 쓰게 하는 RLS 정책

## 3. 환경 변수
`.env.local` 예시:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key

VITE_SUPABASE_RATINGS_SCHEMA=public
VITE_SUPABASE_RATINGS_TABLE=ratings
VITE_SUPABASE_RATINGS_USER_COLUMN=user_id

VITE_SUPABASE_USER_LISTS_SCHEMA=public
VITE_SUPABASE_USER_LISTS_TABLE=user_lists
VITE_SUPABASE_USER_LISTS_USER_COLUMN=user_id

VITE_SUPABASE_LIST_INTERACTIONS_SCHEMA=public
VITE_SUPABASE_LIST_INTERACTIONS_TABLE=list_interactions
VITE_SUPABASE_LIST_INTERACTIONS_USER_COLUMN=user_id
```

## 4. 테이블 역할

### `public.ratings`
- 취향분석 결과 저장
- 영화별 상태, 별점, 좋았던 포인트, 캐릭터, 메모 저장

### `public.user_lists`
- 사용자가 만든 리스트 저장
- 제목, 영화 ID 배열, 공개/비공개, 추천 리스트에서 가져온 원본 ID 저장

### `public.list_interactions`
- 공유 리스트에 대한 개인 반응 저장
- 저장 여부
- 개인 평점
