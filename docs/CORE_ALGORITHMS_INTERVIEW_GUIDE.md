# Moodie 핵심 알고리즘과 시스템 설계: 코드 기반 면접 연구 노트

> 분석 기준: 2026-09-20의 로컬 작업 디렉터리. 커밋된 코드뿐 아니라 작업 중인 소스도 포함한다. 실제 서비스의 DB 마이그레이션 적용 여부와 운영 데이터는 조회하지 않았다.
>
> 이 문서는 논문 형식을 빌린 구현 분석서다. 실험으로 검증하지 않은 추천 정확도·성능 개선율을 주장하지 않는다. **구현 사실**, **코드에서 도출한 해석**, **향후 개선안**을 구분한다. 코드 블록은 별도 표시가 없으면 핵심 동작을 보존한 축약 예제이며, 원본 파일과 함수명을 함께 제시한다.

## 초록

Moodie는 영화 평가, 취향 분석, 상황별 추천, 개인 보관함, 영화 리스트, 커뮤니티, 프로필과 칭호를 결합한 Vue 기반 애플리케이션이다. 기술적으로 중요한 부분은 특정한 단일 추천 공식보다, 서로 다른 성격의 사용자 신호를 수집하고 정규화한 뒤 클라이언트의 설명 가능한 점수 모델과 PostgreSQL의 사용자 간 집계로 연결하는 과정에 있다.

영화 추천은 기존 콘텐츠 기반 취향 점수로 후보를 정렬한 후, 개인 장르 선호·유사 사용자·상황·TMDB 품질·새로움·감독 및 배우의 여섯 신호로 다시 계산한다. 리스트 추천에는 콘텐츠 평균 점수와 이진 좋아요 벡터의 코사인 유사도가 공존한다. 커뮤니티 추천은 미관람 영화, 협업 신호, 작성자 유사도, 반응, 최신성을 별도의 SQL 식으로 결합한다. 따라서 모든 기능을 하나의 협업 필터링 또는 하나의 AI 모델이라고 설명하면 실제 구현과 어긋난다.

또한 로컬 우선 저장, 타임스탬프 기반 병합, Promise 저장 큐, 요청 세대 번호, DB의 유일성 제약과 트랜잭션, 서버 권한 검증, 외부 API의 제한된 동시성 수집이 핵심 구현 주제다. 본 문서는 수식·코드·수치 예제·복잡도·반례·면접 질문을 통해 이러한 구조를 설명한다.

**핵심어:** 설명 가능한 추천, 콘텐츠 기반 필터링, 사용자 기반 협업 필터링, 상황 추천, 로컬 우선 저장, 최종적 일관성, 비동기 경쟁 상태, PostgreSQL 윈도 함수, 멱등성.

## 읽는 순서

1. **전체 구조 이해:** 1~3장.
2. **추천 알고리즘 집중:** 4~10장.
3. **실무 난이도가 높은 코드:** 11~19장.
4. **면접에서 검증받을 내용:** 20~23장.
5. **실제 코드 정독:** 부록의 파일 지도와 원문 발췌.

## 1. 분석 범위와 실행 코드의 기준

### 1.1 기술 구성

`package.json` 기준 주요 구성은 Vue 3, TypeScript, Pinia, Vue Router, Supabase JS, Vite, Tailwind CSS, Vite PWA다. 백엔드는 Supabase의 PostgreSQL·인증·Storage·Edge Functions와 Netlify Functions로 나뉜다. 버전 범위는 설치된 정확한 버전과 같다고 단정하지 않는다.

| 영역 | 주요 경로 | 역할 |
|---|---|---|
| 화면 | `src/views`, `src/components` | 입력 수집, 화면 상태, 결과 표시 |
| 도메인 상태 | `src/services/*Store.ts` | 평가·리스트·보관함 상태와 비동기 조정 |
| 인증 상태 | `src/stores/auth.ts` | Pinia 인증 스토어 |
| 순수 계산 | `movie_recommendation_algorithm.ts`, `recommendationScoring.ts`, `situationRecommendation.ts` | 프로필 집계와 점수 계산 |
| 저장소 어댑터 | `*Repository.ts` | localStorage와 Supabase 변환 |
| 정적 데이터 | `src/data/catalog.ts`, `movieCredits.ts` | 영화·인물 메타데이터 |
| DB 로직 | `supabase/migrations` | 테이블, RLS, RPC, 집계, 트리거 |
| 외부 API 프록시 | `netlify/functions` | KOBIS·TMDB 서버 호출 |
| 관리 기능 | `supabase/functions` | 회원 삭제, 영화 메타데이터 동기화 |
| 검증 | `scripts/test-*.mjs` | 추천 규칙·카탈로그·박스오피스 검증 |

모든 상태가 Pinia에 들어 있는 것은 아니다. 인증은 `defineStore`를 쓰지만 추천·보관함·리스트는 모듈 범위의 `reactive`, `ref`, `computed`를 노출하는 공유 스토어다. 면접에서는 “Pinia만으로 전역 상태를 관리했다”보다 이 차이를 설명하는 편이 정확하다.

### 1.2 복사본과 실제 진입점

분석의 우선순위는 실제 import 경로다. `copied-files/state-data-flow`와 `copied-files/views`를 이름만 보고 현재 구현으로 간주하지 않는다. 다만 **TMDB 수집 스크립트는 예외**다.

```js
// scripts/sync-tmdb-data.mjs의 실제 전체 진입 코드
import '../copied-files/tmdb-api/sync-tmdb-data.mjs';
```

즉 이 복사본 디렉터리의 수집 코드는 실제 실행 코드다. 생성 결과인 `dist`, `public/assets`, 서비스 워커 번들보다 원본 소스와 마이그레이션을 근거로 사용한다. 마이그레이션은 같은 함수가 뒤에서 재정의될 수 있으므로 가장 먼저 등장한 SQL만 읽으면 틀린 설명이 된다.

### 1.3 문서에서 보장하지 않는 것

운영 추천 정확도, 실제 DB 실행 계획, 동시 접속 처리량, 운영 RLS 적용 상태, 외부 API의 현재 응답 품질은 이 로컬 분석만으로 알 수 없다. 테스트가 통과하더라도 이 항목들이 자동으로 검증되는 것은 아니다.

## 2. 전체 데이터 흐름과 설계 경계

```text
평가 화면 / 상세 평가
  → createRatingInput 및 원래 선택 정보 보존
  → recommendationStore: 영화별 평가 교체
  → 전체 평가로 콘텐츠 프로필 재계산
  → localStorage 즉시 저장
  → Promise 큐를 통해 Supabase 저장
  → 협업 추천 RPC의 집계 결과 갱신

정적 영화 카탈로그 + 평가 상태
  → 기존 콘텐츠 점수로 전체 후보 정렬
  → 제외/재노출/상황 필터
  → 여섯 원점수 계산
  → 상황별 배점 적용
  → 최종 정렬 후 상위 10개
```

DB에는 개인의 원시 평가가 있고, 브라우저에는 로그인한 사용자의 평가와 타 사용자를 집계한 결과가 전달된다. 서버는 타인과의 비교, 원자적인 다중 테이블 쓰기, 권한 있는 관리 작업을 담당한다. 클라이언트는 카탈로그를 이용해 점수를 빠르게 재계산하고 추천 이유를 구성한다.

이 구조의 장점은 계산 과정을 설명하기 쉽고 상황 선택에 즉시 반응한다는 점이다. 반면 카탈로그와 계산 비용이 브라우저에 실리고, 여러 스토어와 서버 계산 사이에 동일한 개념의 정의가 달라질 수 있다. 이 문서에서 반복해서 확인할 쟁점은 **“어떤 평가를 좋아요 또는 관람으로 간주하는가”**다.

## 3. 입력 모델: 사용자의 행동과 저장 상태를 분리하기

**원본:** `src/types/rating.ts`, `src/services/ratingInput.ts`, `src/services/recommendationStore.ts`의 `submitSwipeRating`.

### 3.1 정규화가 정보를 지울 수 있다

저장용 상태는 `not_seen | dislike | like`지만 실제 선택에는 `not_interested`가 있다. `not_interested`는 저장 시 `dislike`가 되므로 원래 선택을 따로 보존해야 한다.

```ts
export const toStoredRatingStatus = (
  decision: RatingDecision | 'not_interested'
): SwipeStatus => decision === 'not_interested' ? 'dislike' : decision;

// 별도의 rawDecision, rawDirection으로 입력의 의미를 보존한다.
// like + right: 재미있음
// like + up: 관심있음
```

`getDetailedRatingFeedbackMode`는 `like + right`에 긍정 상세 평가를, `dislike`에 부정 상세 평가를 요구한다. `like + up`과 `not_interested`는 같은 상세 평가 흐름이 아니다. 원래 결정·방향·정규화된 상태·상세 완료 여부를 분리한 것은 UI 행동과 저장 스키마를 연결하기 위한 설계다.

그러나 모든 후속 계산이 `rawDirection`까지 보는 것은 아니다. 관심 있음이 `like`로 저장된 뒤 다른 계산에서 관람 또는 긍정 평가처럼 취급될 수 있다. 입력 모델을 정교하게 만드는 것과 소비하는 모든 코드가 그 의미를 지키는 것은 별개의 문제다.

### 3.2 배열 복사와 경계 정규화

```ts
// createRatingInput 핵심
({
  movieId, userId, status,
  rating: details.rating ?? null,
  reviewTags: details.reviewTags ? [...details.reviewTags] : [],
  favoriteCharacters: details.favoriteCharacters ? [...details.favoriteCharacters] : [],
  answeredAt: new Date().toISOString()
});
```

폼 배열을 그대로 넣으면 제출 후 폼을 수정할 때 저장 객체도 변할 수 있다. 여기서는 배열을 복사해 참조 공유를 끊는다. 다만 깊은 객체가 아니라 문자열 배열이므로 얕은 배열 복사로 충분하다.

`normalizeFavoriteCharacters`는 문자열 또는 배열을 받아 문자열만 남기고, trim·빈 값 제거·`선택안함` 제거·중복 제거 후 최대 3개로 제한한다. 이전 단일 선택 스키마를 새 다중 선택 모델로 옮길 때도 쓰인다.

**면접 질문:** TypeScript 타입이 있는데 왜 런타임 정규화가 필요한가?

**답변:** 타입은 컴파일 시점의 약속이다. localStorage의 과거 JSON, DB 응답, 사용자 입력은 런타임 데이터이므로 예전 스키마나 잘못된 값이 들어올 수 있다. 타입 단언만으로 데이터가 바뀌지는 않는다.

### 3.3 실제 연결부에서 발견한 `stars`와 `rating`의 불일치

현재 `RatingView.vue`의 긍정·부정 상세 제출은 `createRatingInput(..., feedback)`을 호출한다. 폼 타입의 별점 이름은 `stars`지만 `createRatingInput`은 `details.rating`을 읽는다. 따라서 이 호출에서 생성되는 `input.rating`은 null이다. 별도로 `options.feedback.rating = feedback.stars`를 전달하지만 `submitSwipeRating`은 그 객체에서 reviewText와 questionText만 꺼내고 input을 그대로 저장한다.

```ts
// 현재 연결을 설명하기 위한 축약
const feedback = { stars: 4.5, reviewTags: [], favoriteCharacters: [] };
const input = createRatingInput(userId, movieId, 'like', feedback);
// details.rating은 없으므로 input.rating === null
```

이것은 **소스상 확인한 필드 전달 문제**이며 브라우저·운영 DB에서 실제 재현한 결과는 아니다. 타입 검사 통과만으로 검출되지 않는 이유는 공통 선택 필드가 있는 구조적 타입의 객체를 변수로 전달할 수 있고 `rating`이 optional이기 때문이다. 다른 편집 화면은 입력 객체를 직접 구성하므로 모든 평가 경로가 똑같이 잘못된다고 일반화해서는 안 된다.

개선 예제는 `createRatingInput(..., { rating: feedback.stars, reviewTags: feedback.reviewTags, favoriteCharacters: feedback.favoriteCharacters })`처럼 명시적으로 변환하는 것이다. 이 문서 작성에서는 애플리케이션 코드를 수정하지 않았다. 면접에서는 “타입 검사와 도메인 의미 검증은 다르며, 제출부터 저장까지의 통합 테스트가 필요하다”는 사례로 설명할 수 있다.

## 4. 콘텐츠 기반 취향 프로필: 희소 특징의 가중 합

**원본:** `src/services/movie_recommendation_algorithm.ts`의 `applyRatingToProfile`, `calculateMovieRecommendationScore`, `recommendMovies`, `recommendLists`.

### 4.1 자료구조와 수학적 해석

프로필은 장르, 태그, 리뷰 태그, 캐릭터를 키로 하는 네 개의 점수 사전이다. 대부분의 특징이 없거나 0이므로 희소 벡터로 볼 수 있다. 단, 실제 저장은 벡터 라이브러리가 아닌 `Record<string, number>`다.

영화 m에 대한 점수는 다음과 같다.

```text
S_content(u,m)
 = Σ P_genre[g]       (g ∈ 영화 장르)
 + Σ P_tag[t]         (t ∈ 영화 태그)
 + Σ P_review[r]      (리뷰 태그 r의 연결 특징 중 하나라도 영화와 일치)
 + Σ P_character[c]   (c ∈ 영화 캐릭터)
```

단순 내적과 유사하지만 리뷰 태그는 매핑 사전을 통해 장르·태그와 연결되는 불리언 매칭이다. 코사인 정규화나 학습된 임베딩을 쓰는 구현은 아니다.

### 4.2 별점과 행동의 결합

| 별점 | 가중치 w(r) |
|---|---:|
| 0.5, 1.0 | -3 |
| 1.5, 2.0 | -2 |
| 2.5 | -1 |
| 3.0 | 0 |
| 3.5 | 1 |
| 4.0 | 2 |
| 4.5 | 3 |
| 5.0 | 4 |
| null 또는 매핑에 없는 값 | 0 |

좋아요의 장르 가중치는 `3 + w(r)`, 태그 가중치는 `max(1, floor((3+w(r))/2))`다. 싫어요의 장르 가중치는 `-2 + min(0,w(r))`, 태그 가중치는 `min(-1,ceil(장르 가중치/2))`다.

```ts
// 원본의 핵심 식
const totalLikeWeight = LIKE_BASE_WEIGHT + getRatingWeight(input.rating);
const likeTagWeight = Math.max(1, Math.floor(totalLikeWeight / 2));

const totalDislikeWeight = DISLIKE_BASE_WEIGHT + Math.min(0, getRatingWeight(input.rating));
const dislikeTagWeight = Math.min(-1, Math.ceil(totalDislikeWeight / 2));
```

좋아요는 선택 리뷰 태그마다 +2, 선택 캐릭터마다 +1이다. 싫어요는 각각 -2, -1이다. `not_seen`은 `totalRatings`만 1 증가시키고 특징 점수는 바꾸지 않는다. 따라서 `totalRatings`를 “실제 관람한 영화 수”라고 설명하면 안 된다.

### 4.3 손으로 따라가는 예제

사용자가 장르 `[액션, 스릴러]`, 태그 `[긴장감, 빠른전개]`인 영화에 좋아요와 4.5점을 준다고 하자. 리뷰 태그는 `시간 가는 줄 몰랐어요`, 캐릭터는 `민재`를 선택한다.

1. 별점 가중치 3과 좋아요 기본 3을 합쳐 장르마다 +6.
2. 영화 태그마다 `floor(6/2)=3`.
3. 리뷰 태그에 +2, 캐릭터 민재에 +1.
4. 다른 후보가 `[액션]`, `[빠른전개]`, `[민재]`를 가지면 `6+3+2+1=12`가 된다. 리뷰 태그 매핑에 `빠른전개`가 들어 있어 +2가 추가된다.

여러 신호가 같은 의미를 중복 반영할 수 있다. 이는 설명 가능한 강화이면서 동시에 과도한 중복 가산의 원인이 될 수 있다.

### 4.4 자유 텍스트에서 특징 추출

`normalizeReviewText`는 소문자화, NFKC 정규화, 공백·일부 구두점 제거를 수행한다. `REVIEW_TEXT_KEYWORD_RULES`의 키워드가 포함되면 장르·태그·리뷰 태그를 `Set`에 모은다. 같은 특징을 여러 규칙이 찾더라도 텍스트 추출 결과에서는 한 번만 남는다.

```ts
// 축약: 사전 기반 부분 문자열 탐색
for (const rule of REVIEW_TEXT_KEYWORD_RULES) {
  if (!rule.needles.some(needle => normalizedText.includes(normalizeReviewText(needle)))) continue;
  for (const tag of rule.tags ?? []) tags.add(tag);
}
```

텍스트 신호의 부호는 문장의 감정이 아니라 사용자의 전체 `like/dislike`에서 결정된다. “음악은 좋지만 스토리는 별로” 같은 혼합 감정, “지루하지 않다” 같은 부정 표현을 문법적으로 해석하지 않는다. 따라서 **자연어 감성 분석 모델**이 아니라 **규칙 기반 특징 추출기**다.

### 4.5 프로필을 매번 재계산하는 이유

스토어는 영화별 평가를 교체한 뒤 `ratings.reduce(...)`로 프로필을 처음부터 다시 만든다. 수정 전 평가의 기여를 정확히 빼는 역연산을 구현하는 대신 계산량을 지불해 중복 누적을 피한다.

장점은 삭제·수정·병합 후 결과를 원본 평가에서 재현할 수 있다는 것이다. 반면 `applyRatingToProfile`은 매번 각 사전을 복사한다. 평가 수 R, 누적 특징 종류 D라면 복사 비용까지 대략 `O(RD + 입력 특징 처리량)`이 발생한다. 특징 종류가 R과 함께 증가하면 단순히 `O(R)`라고 단정할 수 없다.

### 4.6 후보 정렬과 리스트 평균

`recommendMovies`는 제외 ID를 Set으로 만들고, 전체 후보를 계산·내림차순 정렬·상위 K개 절단한다. N개 영화의 점수 계산이 평균 F라면 `O(NF + N log N)`이다. 전체 정렬을 하는 현재 구현을 `O(N log K)`라고 설명해서는 안 된다.

리스트 점수는 존재하는 영화 점수의 산술 평균이다. 존재하지 않는 영화 ID는 제외되며, 유효 영화가 없으면 0점이다. 합계 대신 평균을 쓰므로 긴 리스트의 자동 우위를 줄이지만 한 개의 매우 높은 영화로 구성된 리스트를 과대평가할 수 있다.

## 5. 현재 영화 추천의 중심: 여섯 신호의 100점 결합

**원본:** `src/config/recommendationScoring.ts`, `src/services/recommendationScoring.ts`, `src/services/situationRecommendation.ts`.

### 5.1 기존 점수와 최종 점수의 관계

스토어의 후보 풀 크기는 카탈로그 전체 길이다. 기존 콘텐츠 알고리즘으로 정렬한 후보를 `rankSituationMovies`에 넘기고, 최종 결과에서 10개를 고른다. 최종 점수에 기존 콘텐츠 점수를 그대로 더하는 코드는 없다.

따라서 리뷰 태그·자유 텍스트·캐릭터 기반 기존 점수는 후보 순서에 영향을 주며, 최종 점수와 품질 점수가 같은 경우의 입력 순서 tie-break에도 영향을 줄 수 있다. 반면 현재 개인 선호 원점수는 장르와 평가로 별도 계산한다. 이 구분은 프로젝트를 정확히 이해했는지 확인하는 중요한 면접 지점이다.

### 5.2 배점표

| 신호 | 상황 없음 | 직접 상황 선택 | 고정 프리셋 |
|---|---:|---:|---:|
| 개인 선호 | 30 | 27 | 0 |
| 유사 사용자 | 30 | 25 | 0 |
| 상황 | 0 | 20 | 80 |
| TMDB 품질 | 20 | 16 | 20 |
| 새로움 | 10 | 6 | 0 |
| 감독·배우 | 10 | 6 | 0 |
| 합계 | 100 | 100 | 100 |

각 원점수 sᵢ는 0~100으로 제한하고, 배점 wᵢ에 대해 `기여점수ᵢ = clamp(sᵢ) × wᵢ / 100`이다. 최종 점수는 기여점수 합이다. NaN, Infinity 같은 비유한 값은 clamp에서 최솟값 0으로 처리한다.

```ts
const scaleRawScore = (rawScore: number, maximum: number) =>
  clampRecommendationScore(rawScore) * maximum / 100;

// 실제 구현은 각 필드를 명시적으로 계산한다.
const finalScore = clampRecommendationScore(
  Object.values(breakdown).reduce((total, value) => total + value, 0)
);
```

점수 82는 “좋아할 확률 82%”가 아니다. 수동으로 설계한 정렬 점수이며 확률 보정이나 실제 만족도 학습을 수행하지 않는다.

### 5.3 개인 장르 선호 모델

현재 별점 보정은 앞 장의 `RATING_WEIGHT_MAP`과 다르다.

| 별점 | 보정 a(r) |
|---|---:|
| null 또는 음수 | 0 |
| 1.5 이하 | -2 |
| 2.5 이하 | -1 |
| 3.5 이하 | 0 |
| 4.5 이하 | +1 |
| 그 초과 | +2 |

`not_seen`과 카탈로그에 없는 영화는 건너뛴다. 장르별 affinity는 좋아요 +1 또는 싫어요 -1에 별점 보정을 더해 누적한다. 양수인 장르만 선호 장르이며, affinity 상위 3개가 메인 장르다. 동점이면 한국어 이름 정렬을 사용한다.

후보 점수는 다음 식이다.

```text
P(m) = clamp(
  70
  + 10 × 메인 장르 일치 개수
  +  2 × 나머지 선호 장르 일치 개수
  + Σ 후보 장르별 과거 별점 보정 평균
)
```

후보의 장르는 `new Set(movie.genres)`로 중복 제거한다. 비선호 장르에도 해당 장르의 별점 보정 평균은 반영된다. 하지만 음수 affinity 자체를 직접 점수에서 빼지는 않는다. 예를 들어 별점 없는 싫어요만 받은 장르는 affinity가 음수여도 보정 평균은 0이므로 해당 장르라는 이유만으로 70에서 추가 감점되지 않는다.

**구현 비용 주의:** 장르마다 보정 배열을 `[...이전배열, 새값]`으로 확장한다. 동일 장르에 R개의 평가가 몰리면 복사 합이 `1+2+…+R`이 되어 최악 `O(R²)`가 된다. 개선하려면 장르별 합계와 개수만 저장하면 된다. 현재 구현이 이미 그렇게 최적화되어 있다고 말하지 않는다.

### 5.4 TMDB 품질 점수

```text
Q(m) = clamp(50 + max(평균평점,0)
                + min(max(투표수,0),4000) / 4000 × 40)
```

평균 8.0, 투표수 2,000이면 78점이다. 투표수 4,000 이상이면 가산은 40점에서 포화한다. 80점 이상이면 높은 평가라는 이유 문구를 추가한다.

이것은 베이지안 평점이 아니다. 평균 평점 1점 차이는 원점수 1점 차이인데, 투표수는 최대 40점 차이를 만든다. 따라서 인기·표본 크기의 영향이 크다. 개선안으로 베이지안 가중 평균을 제시할 수 있지만 기존 구현과 구별해야 한다.

### 5.5 감독·배우 점수

좋아요 평가 영화의 감독은 선호 감독 집합에 들어간다. 사용자가 선택한 캐릭터를 `credits.characters`의 인덱스로 찾고 같은 인덱스의 `credits.cast`를 배우로 연결한다. 부정 평가에서 선택한 배우는 비선호 집합에 들어간다.

```text
H(m) = clamp(80
             + 10 × 선호 감독 일치 여부
             +  2 × 선호 주연 배우 수
             -  2 × 비선호 주연 배우 수)
```

주연 범위는 출연진 앞 5명이다. 동일 배우가 선호와 비선호 집합에 모두 있으면 두 항이 상쇄될 수 있다. 누적 횟수를 세지만 최종 모델은 `count > 0`인 집합이므로 한 번 좋아한 배우와 여러 번 좋아한 배우가 같은 +2를 받는다.

인덱스 기반 연결은 데이터 생성 시 배우와 캐릭터 배열의 순서가 반드시 대응한다는 불변식을 요구한다. 인물 ID 기반 구조가 더 견고한 개선안이다.

### 5.6 새로움과 협업 신호의 연결

새로움은 encountered Set에 없으면 100, 있으면 0이다. 최종 랭커는 이미 접한 영화의 유사 사용자 점수도 0으로 만든다. 노출 이력은 새로움뿐 아니라 협업 점수에도 영향을 준다.

현재 스토어가 전달하는 encountered 목록은 평가 ID, 제외 ID, 추천 노출 ID다. 함수 주석은 보관함·리스트도 언급하지만 이 호출부는 해당 스토어의 전체 저장 ID를 직접 합치지 않는다. “모든 저장 행동이 항상 새로움에 반영된다”는 설명은 코드로 입증되지 않는다.

### 5.7 수치 예제와 정렬

직접 상황 선택에서 원점수가 `[80,75,60,78,100,90]`이면 다음과 같다.

```text
개인: 80×0.27 = 21.60
협업: 75×0.25 = 18.75
상황: 60×0.20 = 12.00
품질: 78×0.16 = 12.48
신규:100×0.06 =  6.00
인물: 90×0.06 =  5.40
최종            = 76.23
```

정렬 우선순위는 최종 점수 내림차순 → 품질 원점수 내림차순 → 입력 인덱스 오름차순이다. 점수, 원점수, 항목별 기여점수, 항목별 최대점수를 결과 객체에 모두 남겨 디버깅과 설명에 사용할 수 있다.

추천 이유는 중복 제거 후 최대 6개이며, 기여점수순으로 다시 정렬하지 않는다. 따라서 첫 번째 문구가 가장 크게 기여한 이유라는 보장은 없다.

## 6. 상황 추천: 제약 조건과 점수 조건을 분리하기

**원본:** `src/services/situationRecommendation.ts`, `src/data/situations.ts`.

### 6.1 규칙의 일치율

장르 ID 한 개 일치는 +2, 태그·문맥 태그·문자열 키워드·캐릭터 일치는 각각 +1.5다. 해당 규칙의 모든 항목을 만족했을 때의 점수를 분모로 정규화한다.

```text
S_rule = 100 × (2×일치 장르 수 + 1.5×일치 키워드 계열 수)
               / (2×규칙 장르 수 + 1.5×규칙 키워드 계열 수)
```

분모가 0이면 0점이다. 규칙에 장르 2개와 태그 2개가 있고 각각 1개씩 맞으면 `100×3.5/7=50`이다. 장르 여러 개가 대안의 의미여도 분모에는 모두 들어가므로, 많은 항목을 가진 규칙은 전부 만족하기 어려워 점수가 낮아질 수 있다.

### 6.2 선택한 항목끼리 재정규화

기분 20, 날씨 10, 특별한 날 20, 보고 싶은 이유 50의 상대 중요도를 사용한다. 사용자가 선택한 항목만 합쳐 분모로 쓰고, 이유가 여러 개면 이유 전체 50을 균등 분배한다.

```text
기분과 이유만 선택: 기분 20/70, 이유 50/70
기분 점수 50, 이유 점수 80:
상황점수 = 50×20/70 + 80×50/70 ≈ 71.43
```

이렇게 하면 항목을 적게 선택했다는 이유만으로 무조건 감점되지 않는다. `isStrongMatch`는 이유가 하나라도 맞거나 두 종류 이상이 맞으면 true지만 현재 최종 정렬은 이 플래그를 직접 사용하지 않는다.

### 6.3 러닝타임은 가산점이 아니라 필터

| 선택 | 엄격 구간 | 후보가 하나도 없을 때 완화 |
|---|---|---|
| 90분 이하 | ≤90 | ≤105 |
| 120분 전후 | 91~134 | 76~149 |
| 긴 영화 | ≥135 | ≥120 |
| 시리즈 | 카탈로그에 동일 collectionId가 2편 이상 | 없으면 원래 후보 |

엄격 구간에서 1편만 발견되어도 범위를 넓혀 10편을 채우지 않는다. 완화 구간도 없으면 원래 후보를 돌려준다. 런타임이 없거나 0 이하인 영화는 시간 조건에 직접 일치하지 않는다.

실화 요청은 문맥 태그 `true_story` 또는 실화 TMDB ID 집합으로 먼저 후보를 제한한다. 이후 러닝타임 필터를 완화하더라도 전달받은 실화 후보 집합 안에서 처리한다.

**설명 문구의 한계:** 시간 필터가 전체 후보로 폴백한 경우에도 숫자 런타임이 있으면 “선택한 관람 시간에 맞는 …분” 문구를 만들 수 있다. 필터 단계의 결과 상태를 문구 생성에도 전달하는 개선이 필요하다.

### 6.4 프리셋은 별도 운영 모드

현재 프리셋은 `after_breakup`, `offline_rest`, `before_travel`, `cleaning`, `before_confession`, `winter_vibes`, `sunday_night`의 7개다. 전용 후보 조건과 80:20의 상황·품질 배점을 사용한다.

예를 들어 `before_travel`은 모험 장르 ID 12, `cleaning`은 코미디 35, `before_confession`은 로맨스 10749, `winter_vibes`는 겨울 문맥 태그로 후보를 제한한다. `sunday_night`는 감동·여운 계열 태그가 있으면서 액션·스릴러·공포·범죄·전쟁 장르를 제외한다.

프리셋에 명시적 TMDB ID가 있으면 해당 목록으로 후보를 제한하는 경로도 있다. 후보가 모두 사라지면 전체 카탈로그에서 고정 목록을 복구하는 코드가 있으므로, 향후 이런 프리셋을 추가할 때는 사용자 제외 영화가 다시 들어오지 않는지 검증해야 한다.

설정에 `communityBlend: 0.25`가 있고 스토어는 커뮤니티 상황 신호를 읽지만, 현재 `rankSituationMovies`의 점수 계산에 그 신호는 전달·결합되지 않는다. 설정 존재만으로 “커뮤니티를 25% 반영한다”고 설명하면 잘못이다.

## 7. 영화 협업 필터링: SQL로 유사 사용자 집계

**원본:** `supabase/migrations/202608271200_add_score_based_movie_recommendations.sql`, `recommendationRepository.ts`의 `remoteCollaborativeRecommendationRepository`.

### 7.1 이산 신호 생성

SQL CASE는 원래 결정이 좋아요이거나 별점이 3 이상이면 +1, 그다음 조건으로 싫어요·관심 없음이거나 3 미만이면 -1을 부여한다. `not_seen`은 제외한다. 보관함 항목은 +1이다.

```sql
case
  when coalesce(history.raw_decision, history.status) = 'like'
    or history.rating >= 3 then 1
  when coalesce(history.raw_decision, history.status) in ('dislike', 'not_interested')
    or history.rating < 3 then -1
  else 0
end
```

CASE는 첫 번째 일치가 우선이다. 좋아요 + 낮은 별점, 싫어요 + 높은 별점은 모두 첫 조건으로 +1이 될 수 있다. 모순 신호를 해소하는 명시적 제품 정책이 필요하다.

평가와 보관함을 합친 뒤 `(user_id,movie_id)`로 `max(preference)`를 선택한다. 따라서 영화 협업 추천에서는 **싫어요와 보관함 저장이 동시에 있으면 +1이 우선**이다. 커뮤니티 추천의 결합 정책과 다르다.

### 7.2 유사도와 후보 점수

```text
sim_movie(u,v) = clamp(70 + 5×일치 수 - 5×불일치 수)

C(m) = min(100,
           추천 이웃들의 sim_movie 평균
           + min(5×(서로 다른 추천 이웃 수-1),20))
```

공통 영화가 존재하고 유사도가 70 이상인 이웃의 긍정 영화를 후보로 선택한다. 현재 사용자의 신호가 있는 영화는 제외한다. 상위 100개 영화 ID와 집계 점수·이웃 수만 반환한다.

예를 들어 공통 영화 4개 중 3개 일치, 1개 불일치면 `70+15-5=80`이다. 어떤 후보를 80점과 90점 이웃 두 명이 좋아하면 평균 85에 +5가 붙어 90점이 된다.

이 식은 코사인 유사도도 Pearson 상관계수도 아니다. 기본 70에서 공통 항목의 일치·불일치를 더하는 휴리스틱이다. 한 개의 일치만 있어도 75점이므로 표본이 작은 이웃을 과신할 수 있다.

### 7.3 서버에서 계산하는 이유

개인 이력에 RLS가 걸려 있으면 클라이언트가 모든 사용자의 이력을 읽어 비교하면 안 된다. `security definer`, 고정 `search_path`, `auth.uid()` 기반 현재 사용자 선택, authenticated 실행 권한을 통해 집계 결과만 제공한다.

`security definer`라는 단어 자체가 안전을 보장하지는 않는다. 함수 소유자 권한으로 실행되므로 함수 내부의 사용자 필터와 반환 컬럼이 실제 보안 경계다. 개인별 내역을 반환하지 않더라도 작은 집계에서 추론이 가능한지와 호출 남용 방지는 별도 검토 대상이다.

### 7.4 이전 RPC와의 호환

새 RPC가 없는 경우 특정 함수 누락 오류를 확인하고 기존 `get_collaborative_recommendation_signals`로 전환한다. 이전 점수는 응답 내 최댓값 M으로 다음과 같이 변환한다.

```text
legacyNormalized = min(100, 70 + 30×legacyScore/M)  (M>0)
```

이전 점수의 상대적인 크기를 새로운 범위에 맞추지만 서로 다른 응답 배치 사이의 절대 비교는 어렵다. 네트워크 오류나 권한 오류를 스키마 누락으로 오인해 조용히 폴백하지 않는 것이 중요하다.

## 8. 리스트 추천: 콘텐츠 평균과 코사인 유사도

**원본:** `movie_recommendation_algorithm.ts`, `supabase/migrations/202608121300_add_similar_taste_list_recommendations.sql`, `src/services/listStore.ts`.

콘텐츠 리스트 추천은 4장의 영화 점수 평균을 사용한다. 별도로 공개 사용자 리스트 추천은 작성자의 좋아요 이력이 현재 사용자와 얼마나 겹치는지 계산한다.

```text
sim_list(u,v) = |L_u ∩ L_v| / sqrt(|L_u|×|L_v|)
```

이는 좋아요 여부를 0/1 벡터로 표현했을 때의 코사인 유사도다. 좋아요는 `coalesce(raw_decision,status)='like'`이고 별점이 없거나 3.5 이상인 경우다. 영화 협업 추천의 3점 기준과 다르다.

현재 사용자 좋아요 4편, 상대 좋아요 9편, 공통 3편이면 `3/sqrt(36)=0.5`다. 상대가 영화 100편을 좋아한다면 단순 교집합만으로 생기는 유리함을 분모가 완화한다.

최종 대상은 본인이 아닌 사용자의 공개 원본 리스트, 아직 저장하지 않은 리스트, 유사도 0.25 이상이다. 유사도 → 공통 좋아요 수 → 수정 시각 순으로 최대 12개를 반환한다. 분모 0은 `nullif(...,0)`로 막는다.

리스트 작성자와 취향이 비슷하다고 리스트에 담긴 모든 영화가 맞는 것은 아니다. 작성자 유사도와 리스트 내부 영화 점수를 결합하는 것은 가능한 개선안이지만 현재 SQL은 그렇게 계산하지 않는다.

## 9. 커뮤니티 추천: 콘텐츠 단위로 전파되는 취향

**원본:** `supabase/migrations/202608291200_add_personalized_community_post_recommendations.sql`, `communityService.ts`의 `fetchRecommendedCommunityPosts`.

### 9.1 영화 추천과 다른 신호 결합

평가 신호를 먼저 만들고 해당 영화에 평가가 없는 경우에만 보관함을 +1로 넣는다. 따라서 영화 RPC의 `max(-1,+1)=+1` 규칙과 달리, 여기서는 평가가 보관함보다 우선한다.

공통 영화 선호가 p∈{-1,+1}일 때 유사도는 다음과 같다.

```text
sim_post(u,v) = 50 + 50×avg(p_u×p_v)
```

공통 영화가 a개 일치, b개 불일치이면 `100a/(a+b)`와 같다. 3개 일치, 1개 불일치면 75점이다. 영화 협업 후보에는 유사도 ≥65와 공통 영화 ≥2 조건을 함께 적용한다. 작성자 유사도 항에는 같은 최소 공통 수 제한이 직접 들어가지 않는 점도 구분해야 한다.

### 9.2 게시물과 영화의 관계를 모으기

연관 영화 테이블, 기존 단일 영화 컬럼, 공유 리스트의 `movie_ids`, 투표 선택지 영화 ID를 `UNION`한다. `UNION ALL`이 아니므로 동일한 게시물·영화 쌍의 중복이 제거된다. 한 영화가 본문과 투표에 동시에 있어도 미관람 개수를 두 번 부풀리지 않기 위한 구조다.

### 9.3 최종 게시물 점수

```text
S_post = 8×미관람 관련 영화 수
       + 0.55×최고 협업 영화 점수
       + 0.30×max(작성자 유사도-50,0)
       + min(1.2×좋아요 + 1.8×저장 + 댓글,18)
       + 0.35×max(14-게시 후 경과일,0)
```

소수 둘째 자리로 반올림한다. 미관람 2편, 최고 협업 90, 작성자 유사도 80, 좋아요 5·저장 2·댓글 3, 게시 2일 경과면 `16+49.5+9+12.6+4.2=91.3`이다.

본인 글, 일일 질문·미션 인증, 읽은 글, 저장한 글은 제외한다. 영화 참조가 있는 글만 내부 조인에 남는다. 결과 개수는 1~12 범위로 제한하고 기본 6개다.

이 점수는 100점 상한이 없다. 미관람 영화 수 항도 제한이 없어서 관련 영화를 많이 붙이면 유리할 수 있다. “게시물도 영화처럼 100점 만점”이라는 설명은 틀리다.

### 9.4 세 가지 유사도는 같은 것이 아니다

| 대상 | 유사도 | 표본 보정 및 제한 |
|---|---|---|
| 영화 | 70 + 5×일치 - 5×불일치 | 0~100, 이웃 ≥70 |
| 공개 리스트 | 교집합 / 기하평균 크기 | 유사도 ≥0.25 |
| 커뮤니티 | 공통 평가 일치 비율 ×100 | 협업 영화 이웃 ≥65, 겹침 ≥2 |

면접에서 “왜 통일하지 않았는가”를 묻는다면 현재 구현이 서로 다른 정책으로 진화한 상태라는 사실을 인정하고, 목적별 차이를 유지할지 공통 신호 계층으로 정리할지 검증이 필요하다고 설명한다.

## 10. 콜드 스타트와 취향 분석 표본 구성

**원본:** `src/data/rating.ts`, `tasteAnalysisResult.ts`, `tasteInsights.ts`, `recommendationStore.ts`.

### 10.1 초기 평가 영화 10개

액션 28, 로맨스 10749, 스릴러 53, SF 878, 코미디 35의 다섯 장르에서 순서대로 최대 2편씩 뽑는다. Set으로 이미 뽑거나 제외한 ID를 차단하고 부족분은 카탈로그의 남은 영화로 채워 총 10편을 만든다.

```ts
// 실제 알고리즘을 축약
for (const genrePool of genrePools) {
  let added = 0;
  for (const movie of genrePool) {
    if (used.has(movie.id)) continue;
    selected.push(movie);
    used.add(movie.id);
    if (++added === 2) break;
  }
}
return [...selected, ...catalogMovies.filter(m => !used.has(m.id))].slice(0, 10);
```

`buildTasteAnalysisBatch`의 매개변수 `_selectedGenres`는 현재 사용하지 않는다. 장르 선택 UI가 있다고 선택 장르에 따라 표본을 구성한다고 설명하면 안 된다. 초기 표본은 고정 장르 풀과 카탈로그 순서에 영향을 받으며 무작위 표집이나 정보 이득 기반 능동 학습이 아니다.

추가 배치는 초기 배치, 평가 완료, 이미 예약된 배치의 ID를 제외한다. 다중 장르 영화가 앞 장르에서 선택되면 뒤 장르에서는 제외되므로 장르 순서에 따른 편향도 생길 수 있다.

### 10.2 추천 후보 고갈 대응

평가와 제외 목록을 제거한 새 후보가 하나라도 있으면 그 풀을 사용한다. 새 후보가 완전히 비었을 때만 이미 평가한 영화를 허용하되 제외 목록은 유지한다. 이는 재관람 후보를 보여주는 fallback이며 신규 후보가 10개 미만이라고 반드시 재관람 후보를 섞는 구조는 아니다.

### 10.3 취향 시각화와 추천 모델은 별개

`getTasteAnalysisResult`는 좋아요 기록만 분석한다. 별점이 있으면 0.5~5로 제한한 값을 사용하고, 없으면 right=4, up=2.5, 기타=3.5를 부여한다. 한 영화의 장르가 G개면 각 장르에 weight/G, 중복 제거한 태그가 T개면 weight/T를 준다.

장르가 많은 영화가 그래프 전체를 과도하게 지배하는 것을 줄이는 방법이다. 표시 비율은 모든 특징 점수 합을 분모로 계산한 뒤 상위 일부만 보여 주므로, 화면에 나온 비율 합은 100이 아닐 수 있다. 반올림 차이도 있다.

`getTasteInsights`는 배우·감독을 선택 횟수 → 평균 별점 → 최근 평가 시각으로 정렬해 상위 3명을 만든다. 반면 `getTasteAnalysisResult`의 배우는 선택 배우 중 첫 유효 배우 또는 첫 출연진 한 명만 사용한다. 두 화면의 배우 순위가 다른 것은 서로 다른 집계 규칙 때문일 수 있다.

## 11. 로컬 우선 저장과 데이터 병합

**원본:** `recommendationStore.ts`의 `persistState`, `mergeRatingRecords`, `mergeSnapshots`, `setActiveUser`; `recommendationRepository.ts`.

### 11.1 저장 흐름

상태 변경 → 로컬 저장 → 원격 큐 → Supabase 순서다. 네트워크 응답 전에도 로컬 상태를 사용할 수 있다. 원격 실패는 상태와 오류 메시지로 표시한다.

다만 이를 완전한 오프라인 동기화 엔진이라고 설명하면 과장이다. 영속적인 outbox, 명시적인 재시도 스케줄러, 삭제 tombstone, 서버 버전 기반 충돌 검사는 별도로 구현되어 있지 않다. 로컬 상태가 남는 것과 모든 변경이 결국 서버에 반드시 반영되는 것은 다르다.

### 11.2 영화별 충돌 해결

```ts
// 원본 핵심
const shouldReplaceRatingRecord = (current, candidate) => {
  const currentTime = getAnsweredAtTime(current);
  const candidateTime = getAnsweredAtTime(candidate);
  if (candidateTime !== currentTime) return candidateTime > currentTime;
  if (candidate.detailCompleted !== current.detailCompleted) return candidate.detailCompleted;
  return false;
};
```

로컬 배열을 먼저, 원격 배열을 뒤에 순회해 movieId를 Map 키로 사용한다. 더 최신 평가가 이기고, 같은 시각이면 상세 완료 평가가 이긴다. 둘 다 같으면 기존 값을 보존하므로 이 호출 순서에서는 로컬 우선이다. 잘못된 날짜는 0으로 처리한다.

예를 들어 로컬 10:00의 상세 평가와 원격 10:01의 간단 평가가 충돌하면 원격이 이긴다. 상세 완료 우선은 **시각이 같을 때만** 적용된다.

Map 병합은 평균 `O(L+R)`, 마지막 시각 정렬은 U개 고유 영화에 대해 `O(U log U)`, 메모리는 `O(U)`다.

### 11.3 스냅샷의 필드마다 병합 정책이 다르다

| 필드 | 병합 정책 |
|---|---|
| 평가 | 최신 시각, 동률이면 상세 완료 |
| 프로필 | 병합된 평가에서 재생성 |
| 제외 영화 | 집합 합집합 |
| 추가 배치 | 배치 ID로 중복 제거, 생성 시각 정렬 |
| 선택 장르 | 원격이 비어 있지 않으면 원격 |
| 활성 상황 | 업데이트 시각이 더 최신인 쪽 |
| 추천 노출, 재개 화면 | 로컬 |

전체 객체에 동일한 “마지막 쓰기 우선”을 적용하지 않는다는 점이 중요하다. 필드의 의미에 따라 서로 다른 정책을 사용한다.

### 11.4 병합의 한계와 개선안

클라이언트 시계가 틀리면 최신 기록 판정이 잘못된다. 삭제 기록이 없으면 다른 기기의 오래된 데이터가 재등장할 수 있다. 제외 목록 합집합은 추가 보존에는 강하지만 제외 취소를 전파하기 어렵다. 같은 시각·같은 상세 여부의 다른 데이터는 인수 순서에 영향을 받으므로 엄밀한 CRDT라고 부를 수 없다.

개선안은 서버 revision, 작업 ID, tombstone, 변경 로그와 ack 상태를 가진 outbox다. 작은 서비스에서는 현재 방식이 구현 비용을 줄이지만, 다중 기기 편집을 보장하려면 충돌 모델을 명시해야 한다.

`libraryStore.setActiveUser`는 원격 스냅샷이 있으면 로컬에 덮어쓰는 경로다. 모든 스토어가 위 병합 규칙을 공유한다고 설명해서는 안 된다.

### 11.5 history는 이벤트 로그가 아니다

`rating_history`에는 `unique(user_id,movie_id)`가 있다. 이름이 history여도 평가 수정의 모든 버전을 누적하는 이벤트 로그가 아니라 사용자·영화별 지속 기록이다. 추천 평가 흐름의 현재 상태와 별도로 보존하는 데이터이며, 이벤트 소싱을 구현했다고 말할 수 없다.

## 12. 비동기 코드를 지탱하는 네 가지 패턴

### 12.1 쓰기 순서를 지키는 Promise 체인

**원본:** `recommendationStore.ts`의 `enqueueRemoteTask`.

```ts
remoteSaveChain = remoteSaveChain
  .catch(() => { /* 앞선 실패로 다음 저장을 막지 않는다. */ })
  .then(() => runRemoteTask(task, fallbackMessage));
return remoteSaveChain;
```

A→B→C로 수정했는데 서버 응답이 B→A→C 순서로 끝나는 문제를 줄이기 위해 동일 스토어의 요청을 직렬화한다. 단일 클라이언트 안의 순서를 보장하는 것이며, 여러 기기의 쓰기 순서나 여러 스토어 사이의 트랜잭션까지 보장하지 않는다.

`runRemoteTask`가 예외를 잡으면 반환 Promise가 resolve될 수 있다. 따라서 `await submitSwipeRating()` 종료를 원격 저장 성공과 동일하게 해석해서는 안 된다. `listStore`는 성공 여부를 boolean으로 반환하는 별도 구현이다.

스냅샷은 모든 하위 객체를 깊게 복사한 불변 객체가 아니다. 배열 교체 중심의 변경에서는 영향이 제한되지만, 큐에 넣은 뒤 참조 객체를 직접 수정하는 경로가 있는지는 별도로 확인해야 한다.

### 12.2 읽기에서는 최신 요청만 반영

**원본:** `listStore.ts`의 `refreshMovieSearchResults`, `refreshListSearchResults`.

```ts
const searchToken = ++latestMovieSearchToken;
const results = await searchCatalog(trimmedQuery);
if (searchToken !== latestMovieSearchToken) return;
state.movieResults = results.movies;
```

“인” 검색이 늦게 끝나 “인터스텔라” 결과를 덮는 문제를 막는다. 요청 취소가 아니라 결과 적용을 포기하는 방식이다. 네트워크 낭비까지 줄이려면 AbortController나 debounce가 추가로 필요하다. 현재 검색 구현은 로컬 Promise지만 비동기 인터페이스에서도 순서 제어를 명시했다.

### 12.3 진행 중 Promise 캐시

**원본:** `src/services/tmdbMovieCast.ts`.

```ts
const castCache = new Map<number, Promise<TmdbCastMember[]>>();
const loadMovieCast = (id: number) => {
  const cached = castCache.get(id);
  if (cached) return cached;
  const request = requestMovieCast(id).catch(error => {
    castCache.delete(id);
    throw error;
  });
  castCache.set(id, request);
  return request;
};
```

결과가 도착하기 전부터 같은 요청을 공유하는 single-flight 패턴이다. 실패한 Promise를 제거해 재시도를 허용한다. 성공 결과는 메모리에 계속 남으며 별도 TTL·상한이 없으므로 장시간 사용과 많은 영화 조회에서는 캐시 크기를 고려해야 한다.

### 12.4 사용자 변경과 오래된 응답

협업 신호 갱신은 응답 후 `state.userId===userId`를 확인한다. 상황 신호는 requestId와 현재 프리셋을 확인한다. 반면 `recommendationStore.setActiveUser`의 원격 스냅샷 로드 후에는 같은 수준의 사용자 세대 확인이 없어, 연속 사용자 전환에서 오래된 응답이 새 상태를 덮을 가능성을 검토해야 한다.

**개선 예제 — 현재 구현에 없는 제안:**

```ts
let userEpoch = 0;
async function activateUser(userId: string) {
  const epoch = ++userEpoch;
  const remote = await repository.load(userId);
  if (epoch !== userEpoch) return;
  applySnapshot(remote);
}
```

쓰기 큐, 읽기 토큰, Promise 캐시는 서로 다른 문제를 푼다. 하나를 사용했다고 모든 경쟁 상태가 해결되는 것은 아니다.

## 13. 검색·중복 판별·공유 리스트의 동기화

**원본:** `listSearchService.ts`, `listStore.ts`.

### 13.1 필드 가중치 기반 검색

검색 문자열은 한국어 로케일 소문자화 후 모든 공백을 제거한다. 영화 제목 5, 감독 4, 배우 4, 장르 2, 태그 2를 합산하고 상위 8개를 반환한다. 같은 필드에서 여러 배우가 맞아도 해당 필드는 한 번만 점수에 들어간다.

리스트 검색의 실제 검사 대상은 제목 5, 소유자 2, 포함 영화 제목 3이다. 가중치 테이블에 감독·배우·장르·태그가 정의되어 있어도 `buildListMatches`는 그 필드를 검사하지 않는다.

이 검색은 부분 문자열 검색이며 BM25, 형태소 분석, 오타 교정, 벡터 검색이 아니다. 검색 가능한 텍스트 길이를 포함한 순회 비용과 결과 정렬 비용이 든다. 개선하려면 정규화 문자열 사전 계산, 역색인, 서버 전문검색을 검토한다.

### 13.2 순서와 중복을 무시하는 정규 서명

```ts
const getMovieIdsSignature = (movieIds: readonly string[]) =>
  [...new Set(movieIds)].sort().join('|');
```

`[B,A]`와 `[A,B]`를 같은 목록으로 본다. 단, 목록 내부 중복은 별도 검사로 금지한다. “표시 순서가 같은가”를 확인하는 `areMovieIdsEqual`은 길이와 같은 인덱스 값을 비교하므로 서명과 목적이 다르다.

M개 영화의 서명 생성은 `O(M log M)`이다. 후보 리스트마다 다시 계산하면 `O(L×M log M)` 수준이며, 이를 여러 리스트에 반복 적용하면 더 커진다. 서명 캐시 또는 서버의 정규화 키가 개선 방향이다.

문자열 구분자 `|`를 ID가 포함할 수 있으면 충돌 가능성이 있다. 또한 브라우저가 읽은 목록 안에서 중복이 없다는 것은 동시에 다른 사용자가 같은 목록을 만드는 것을 막지 못한다. 전역 중복 금지가 제품 요구라면 서버 유일성 규칙이 필요하다.

### 13.3 가져온 리스트는 원본을 추적한다

`sourceListId`가 있는 리스트는 공개 카탈로그의 원본 제목과 영화 배열을 동기화한다. 원본이 조회되지 않으면 기존 복사본을 유지한다. `persistState`는 저장 후 공유 목록을 다시 읽어 정규화하고 fingerprint가 달라졌으면 다시 저장한다.

변경 없는 재저장을 줄이는 설계지만 JSON fingerprint는 객체 구조·배열 순서의 영향을 받는다. 내용상 동일성, 표시 순서 동일성, 저장 스냅샷 동일성을 혼동하지 않는 것이 중요하다.

## 14. 커뮤니티 DB: 원자성, 유일성, 집계 비용

### 14.1 다중 테이블 생성의 원자성

**원본:** 최종 재정의인 `202608021000_remove_community_mission_proof.sql`의 `create_community_post`.

RPC는 로그인 검사, 카테고리 검사, 공개 리스트 소유권 검사 후 게시물·관련 영화·투표·투표 선택지를 같은 DB 함수 안에서 생성한다. 선택지가 2개 미만이면 예외를 던진다. 예외가 전파되면 함수 호출 트랜잭션 전체가 롤백되어 게시물만 남는 부분 성공을 막는다.

```sql
insert into public.community_posts (...) values (...) returning id into v_post_id;
-- 관련 영화와 투표 선택지 삽입
if v_option_count < 2 then
  raise exception 'POLL_OPTIONS_INVALID';
end if;
```

관련 영화는 `(post_id,movie_id)` 충돌 시 무시한다. position은 삽입 시도마다 증가하므로 중복 입력으로 번호가 건너뛰어도 순서 자체는 유지할 수 있다. “항상 연속 정수다”라는 불변식까지 보장하지 않는다.

### 14.2 한 사람 한 표

**원본:** `pollService.ts`, 커뮤니티 스키마.

```ts
await votes.upsert(
  { poll_id: pollId, option_id: optionId, user_id: userId },
  { onConflict: 'poll_id,user_id' }
);
```

클라이언트에서 기존 표를 확인한 뒤 insert하는 방식은 두 요청이 동시에 “없음”을 보고 중복 삽입할 수 있다. DB의 unique 제약과 upsert는 이 불변식을 DB에서 강제한다. 사용자가 다른 선택지로 바꾸면 같은 표가 갱신된다. 선택지의 소속 투표 일치 검증과 본인 권한은 별도의 스키마·정책 문제다.

### 14.3 집계 컬럼과 트리거

좋아요·저장·댓글 수를 게시물에 저장해 목록 조회를 단순화한다. 트리거는 원본 관계 테이블의 `count(*)`로 집계를 다시 계산한다. DELETE에서는 `OLD`, 나머지에서는 `NEW`를 사용한다.

정규화된 관계 테이블이 진실의 원천이고 count는 파생 데이터다. 재집계는 복구하기 쉽지만 인기 게시물의 반복 쓰기에서 비용이 커질 수 있다. 또한 트리거가 있다는 사실만으로 동시 트랜잭션의 카운트 정확성이 모두 증명되는 것은 아니다. 실제 격리 수준에서 동시 삽입·삭제를 재현해 잠금과 스냅샷 동작을 확인해야 한다.

대안인 원자적 `count=count+1`은 조회를 줄이지만 중복 삽입 방지·삭제·수정 전환·실패 처리를 정확히 설계해야 한다. 대규모 서비스에서는 비동기 집계와 주기적 재조정도 가능하다.

### 14.4 N+1을 줄이는 조립

`decoratePosts`는 여러 게시물의 리스트·투표·관련 영화를 배치 조회하고 독립 조회를 `Promise.all`로 병렬 실행한 뒤 Map으로 결합한다. 댓글 작성자도 고유 사용자 ID를 Set으로 모아 한 번에 가져온다.

페이지마다 일정 수의 배치 호출을 하는 것과 게시물 N개마다 추가 호출하는 N+1 구조는 다르다. 다만 `Promise.all` 중 하나가 실패하면 전체 조립도 실패하므로 부가 데이터에 부분 실패를 허용할지는 제품 정책이다.

### 14.5 한 개 더 읽는 페이지네이션

```ts
.range(request.offset, request.offset + pageSize)
// 반환은 앞 pageSize개, hasMore는 rows.length > pageSize
```

range의 끝 인덱스가 포함되므로 의도적으로 pageSize+1개를 가져온다. 전체 count 쿼리 없이 다음 페이지 존재를 판단한다. offset이 커지거나 중간 삽입이 잦으면 비용·중복·누락 문제가 생길 수 있으므로 `(정렬 점수, 생성 시각, id)`를 이용한 커서 방식이 개선안이다.

### 14.6 서비스 페이지네이션과 화면의 전체 로딩은 다르다

현재 `CommunityPage.vue`는 `COMMUNITY_FEED_PAGE_SIZE=100`으로 `while(hasNextPage)`를 돌며 마지막 페이지까지 모은 뒤 표시한다. 서비스 함수에 페이지네이션이 있다고 화면이 무한 스크롤로 점진적으로 표시한다고 말하면 안 된다. 총 P개 글에 대해 응답·메모리·조립 비용이 P에 비례해 늘어난다.

검색 입력에는 300ms debounce가 있지만 `loadFeed`는 loading 중이면 새 호출을 무시한다. 루프 안에서는 현재 탭·검색어·정렬을 매번 읽고, 최신 요청 토큰은 없다. 로딩 도중 조건이 바뀌면 이전 결과가 남거나 페이지 간 조건이 섞일 가능성을 검토해야 한다. 요청 시작 시 조건 스냅샷을 고정하고 세대 번호로 최신 요청만 반영하는 개선이 적합하다.

### 14.7 낙관적 좋아요와 서버 확인형 저장

좋아요는 먼저 Set과 화면 count를 바꾸고 서버 실패 시 되돌리는 optimistic update다. 반면 저장은 게시물별 진행 중 ID Set으로 중복 클릭을 막고 서버가 다시 읽어 준 saved 상태와 save_count를 적용한다. 두 작업의 사용자 경험과 일관성 전략이 다르다.

```ts
// 좋아요의 핵심 흐름을 축약
const wasActive = activeIds.value.has(post.id);
activeIds.value = withToggledId(activeIds.value, post.id, !wasActive);
post.likeCount += wasActive ? -1 : 1;
try {
  await toggle(post.id, userId, wasActive);
} catch {
  activeIds.value = withToggledId(activeIds.value, post.id, wasActive);
  post.likeCount += wasActive ? 1 : -1;
}
```

여러 좋아요 요청이 겹치면 단순 역연산 rollback이 이후 성공 상태를 덮을 수 있다. 저장 서비스는 조회 후 insert/delete하고 unique 위반 23505를 이미 저장된 상태로 수용한 다음 상태를 다시 읽는다. 이것도 모든 다중 탭 토글을 선형화하는 서버 원자적 toggle과는 다르다. 작업을 “토글” 대신 `setSaved(true/false)`로 표현하면 재시도 의미를 명확히 만들 수 있다.

### 14.8 추천 릴레이의 인접 목록 모델

`relayService.ts`는 `parent_relay_id`로 부모를 참조하는 인접 목록 모델을 사용한다. 조회는 글 단위·생성 시각순이며 작성자 정보는 사용자 ID 집합으로 배치 조회한다. 서비스 자체에서 재귀 CTE나 DFS로 트리를 순회하는 구현은 아니다. 부모 관계가 있다는 사실만으로 복잡한 그래프 알고리즘을 구현했다고 말하지 않는다.

중첩 표시나 전체 하위 트리 삭제를 확장한다면 부모가 같은 게시물에 속하는지, 순환을 금지할지, 부모 삭제를 cascade 또는 null 처리할지의 정책이 먼저다.

## 15. 프로필과 칭호: SQL 알고리즘과 서버 검증

**원본:** `202607271500_create_profiles_and_titles.sql`, `202607271600_use_rating_history_for_profile_overview.sql`, `titleService.ts`, `titleUnlockStore.ts`.

### 15.1 연속 출석: gaps and islands

```sql
with answer_dates as (
  select distinct (created_at at time zone public.profile_timezone(p_timezone))::date as answer_date
  from public.daily_question_answers
  where user_id = p_user_id
), grouped as (
  select answer_date,
         answer_date - row_number() over (order by answer_date)::integer as streak_group
  from answer_dates
)
-- streak_group별 count(*)가 연속 일수
```

연속 날짜가 1일 증가할 때 row_number도 1 증가하므로 두 값의 차이가 일정하다. 예를 들어 9/1, 9/2, 9/4에서 각각 1,2,3을 빼면 앞의 두 날짜는 같은 그룹, 마지막은 다른 그룹이다.

동일 날짜의 여러 답변은 distinct로 한 번만 센다. 먼저 사용자 시간대의 날짜로 바꾸므로 UTC 날짜 경계 때문에 하루가 잘못 분리되는 것을 줄인다. 일반적으로 정렬 비용 `O(D log D)`가 중심이며 실제 비용은 인덱스와 실행 계획에 달려 있다.

현재 current_streak는 마지막 날짜가 **오늘인 그룹만** 계산한다. 어제까지 연속으로 답했더라도 오늘 아직 답하지 않으면 0이다. “어제까지의 기록을 유예한다”는 일반적인 앱 정책과 다를 수 있다. longest_streak는 모든 그룹 중 최대다.

### 15.2 빙고: 집계 후 불리언 판정

관람 영화에서 장르 수, 평점 조건, 러닝타임, 개봉 연도, 감독·배우 조건을 집계한다. 각 3×3 보드는 가로 3·세로 3·대각선 2개의 총 8개 승리선을 OR로 검사한다.

```text
빙고 여부 = OR(각 승리선에 대해 AND(해당 칸들의 조건 충족))
```

DB 함수가 조건을 재검사한 다음 `(user_id,board_id)` 충돌은 무시하고 완성을 기록한다. UI에서 “빙고 완성”이라고 전송한 사실을 신뢰하지 않는 구조다. 현재 하드코딩된 선 조건은 이해하기 쉽지만 보드 변경 시 SQL도 수정해야 한다.

### 15.3 칭호 발급과 멱등성

클라이언트는 칭호 ID 대신 `watch`, `rating`, `daily_question`, `bingo`, `list` 같은 이벤트를 보낸다. 서버는 해당 이벤트의 후보 칭호만 골라 저장된 데이터로 조건을 계산한다.

```sql
insert into public.user_titles (user_id, title_id)
select v_user_id, candidate.id
from candidates as candidate
where public.profile_title_progress_value(...) >= candidate.condition_value
on conflict (user_id, title_id) do nothing
returning title_id, earned_at;
```

같은 이벤트를 여러 번 보내도 unique 제약 때문에 같은 칭호가 여러 번 생기지 않는다. `RETURNING`으로 새로 발급된 칭호만 알림에 전달한다. 동적 감독 칭호의 코드에 쓰는 md5는 이름으로 안정적인 식별자를 만들기 위한 것이며 암호 저장 목적이 아니다.

### 15.4 최신 프로필과 칭호 계산의 데이터 차이

후속 마이그레이션은 `get_profile_overview`가 `rating_history`를 사용하도록 바꾼다. 반면 칭호 진행과 빙고 함수의 여러 조건은 `ratings`를 사용한다. 두 테이블이 같은 범위를 담는다고 단정하면 프로필 수치와 칭호 진행도의 차이를 설명할 수 없다.

배우 빙고 SQL은 `favorite_character` 문자열을 이름·캐릭터 문자열과 직접 비교한다. 저장소가 다중 선택을 JSON 문자열로 직렬화하는 경우와 의미가 맞는지도 확인해야 한다. 이는 소스상 호환성 검토 지점이며 운영에서 실제 문제가 재현되었다고 주장하는 것은 아니다.

### 15.5 부가 기능 실패를 핵심 행동과 분리하기

`titleService`는 메타데이터 동기화·칭호 발급 실패를 catch하고 경고 후 빈 결과를 반환한다. 평가 저장이 칭호 API 장애 때문에 실패하지 않도록 기능의 실패 범위를 나눈다. 다만 발급을 나중에 반드시 재검사하는 영속 큐를 구현한 것은 아니다.

칭호 알림은 ref 배열의 맨 앞을 activeTitle로 보여 주고 dismiss에서 첫 항목을 제거하는 FIFO다. enqueue는 이미 큐에 있는 ID와 중복을 막지만 새로 들어오는 한 배치 안의 중복 ID를 Set에 순차 추가하지는 않는다. DB가 중복 없는 발급 결과를 준다는 전제와 프런트엔드 방어의 범위를 구분한다.

## 16. 외부 API 수집: 공정한 선택과 제한된 동시성

**원본:** `copied-files/tmdb-api/sync-tmdb-data.mjs`.

### 16.1 파이프라인

시드 영화 검색·수동 매핑 → 장르별 discovery 후보 수집 → 중복 제거 및 라운드 로빈 선택 → 영화 상세·크레딧·OTT·예고편 보강 → `catalog.ts`, `movieCredits.ts` 생성의 흐름이다. 목표 카탈로그 크기 상수는 2,000이며 실제 현재 파일의 개수는 별도로 세어야 한다.

### 16.2 장르 라운드 로빈

장르마다 cursor를 유지하고 매 라운드 각 장르에서 아직 사용하지 않은 영화 한 개씩 선택한다. 전역 Set으로 다중 장르 중복을 막는다. 한 라운드에서 추가가 없으면 종료해 무한 루프를 피한다.

단순 인기순 전체 정렬보다 특정 장르가 초반을 독점하는 것을 줄이지만, 장르 버킷의 후보 품질과 수가 같다는 보장은 없다. 부족분은 fallback discovery로 채우며 목표 수를 채우지 못하면 오류를 낸다.

각 버킷 cursor가 뒤로 가지 않으므로 전체 후보 방문 수에 비례하는 비용을 중심으로 해석할 수 있다. 입력 목록에서 같은 영화를 매번 처음부터 탐색하는 방식과 다르다.

### 16.3 워커 풀과 결과 순서 보존

```js
const results = new Array(items.length);
let nextIndex = 0;
const worker = async () => {
  while (nextIndex < items.length) {
    const currentIndex = nextIndex;
    nextIndex += 1;
    results[currentIndex] = await mapper(items[currentIndex], currentIndex);
  }
};
await Promise.all(
  Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
);
```

상세 수집 동시성 상수는 4다. 모든 영화를 `Promise.all(items.map(...))`로 보내는 대신 최대 C개의 mapper 작업을 유지한다. 인덱스 할당은 await 이전의 동기 구간에서 일어나 같은 JS 실행 맥락에서 중복 배정되지 않는다.

완료 순서로 push하지 않고 원래 인덱스에 기록하므로 결과 순서는 입력과 같다. 평균 요청 시간이 T라면 이상적인 지연은 대략 `ceil(N/C)×T`지만 재시도·속도 제한·각 작업의 여러 API 호출 때문에 실제 시간은 달라진다. mapper 동시성 제한과 전체 시스템의 모든 HTTP 요청 제한은 동일한 보장이 아니다.

### 16.4 재시도 정책의 실제 의미

429, 500, 502, 503, 504 응답은 최대 4회 시도한다. Retry-After를 숫자로 해석하고, 숫자가 아니면 `700×(attempt+1)` ms를 사용한다. 이는 지수 백오프가 아니라 선형 대기다.

**중요한 코드상 경계:** 헤더가 없으면 `headers.get`은 null이고 `Number(null)`은 0이다. 따라서 현재 분기는 헤더가 없을 때도 0ms 대기로 들어갈 수 있다. fetch 자체가 throw하는 네트워크 오류도 이 루프에서 별도 catch하지 않으므로 같은 방식으로 재시도되지 않는다.

개선하려면 null·빈 문자열을 먼저 구분하고, Retry-After의 날짜 형식과 상한을 처리하며, 지수 백오프+jitter와 타임아웃을 적용할 수 있다. 현재 구현이 이미 이를 수행한다고 설명하지 않는다.

### 16.5 ID 안정성과 생성 파일 원자성

동적 discovery 영화의 앱 ID는 `movie_${startIndex+index}` 형식이다. 후보 순서가 바뀌는 전체 재수집에서 같은 앱 ID가 다른 TMDB 영화에 매핑될 위험이 있는지 확인해야 한다. 사용자 평가는 앱 movieId를 참조하므로 단순한 데이터 생성 문제가 아니라 참조 무결성 문제다.

개선안은 영속적인 TMDB→앱 ID 레지스트리 또는 외부 ID 기반 안정 키다. 또한 두 생성 파일을 순차 write하므로 중간 실패에 대한 원자성이 없다. 임시 파일 생성·검증 후 교체하는 방법을 고려할 수 있다. 이 문서 작성에서는 실제 동기화 스크립트를 실행하지 않았다.

## 17. KOBIS와 TMDB의 엔터티 연결, 캐시, 폴백

**원본:** `netlify/functions/kobis-boxoffice.mjs`, `tmdb-kobis-detail.mjs`, `_shared/tmdb.mjs`, `movieTrailer.ts`, `tmdbMovieCast.ts`.

### 17.1 서로 다른 API의 영화를 연결하는 법

KOBIS의 영화 코드와 TMDB ID는 별개다. 포스터 검색에서는 제목을 소문자로 바꾸고 Unicode 문자·숫자 이외를 제거한 뒤 정확히 같은 제목만 후보로 둔다. 개봉 연도 차이가 작은 순, 인기도가 높은 순으로 고른다. 일부 영화는 명시적 코드→TMDB ID 매핑을 사용한다.

```text
KOBIS 제목·개봉일
 → TMDB 제목+연도 검색
 → 정규화 제목 정확 일치 필터
 → |개봉연도 차이| 오름차순
 → 인기 내림차순
```

제목이 비슷한 다른 영화를 잘못 붙이는 false positive를 줄이는 대신 번역명·부제 차이로 놓치는 false negative가 생길 수 있다. 포스터용 수동 매핑과 상세 검색 경로는 별도이므로 둘의 일치 정책도 점검 대상이다.

### 17.2 날짜와 부분 실패

한국 시각 기준 어제부터 7일 전까지 완료 집계를 탐색한다. 데이터가 비면 이전 날짜를 보지만, HTTP 오류가 throw되면 바깥 catch로 빠지므로 모든 오류에서 7일을 계속 재시도하는 구조는 아니다.

포스터는 영화별 try/catch 안에서 병렬 조회한다. 포스터 한 개가 실패해도 해당 포스터만 null로 만들고 박스오피스 자체를 유지한다. 중요 데이터와 부가 데이터의 실패 범위를 분리한 사례다.

### 17.3 다층 캐시

| 계층 | 구현 |
|---|---|
| 생성 카탈로그 | 미리 저장된 영화 메타데이터·예고편 |
| 예고편 localStorage | 버전 접두어와 cachedAt, 30일 TTL |
| 배우 조회 메모리 | 영화 ID별 Promise 캐시 |
| HTTP | 박스오피스 성공 응답 900초, 상세 성공 응답 1일 등 |
| PWA | 정적 자산 사전 캐시와 지정 이미지 URL의 런타임 캐시 |

예고편은 카탈로그 값 → localStorage → API 순으로 읽는다. 저장소가 꽉 찼거나 비활성화되어도 캐시 실패가 재생 자체를 막지 않도록 catch한다. 응답의 YouTube key 형식과 name 타입을 검사한다.

배우 사진은 정규화한 배우 이름으로 먼저 매칭하고 없으면 같은 배열 인덱스로 폴백한다. 이 방식은 표시 성공률을 높이지만 잘못된 사진을 붙일 수 있으므로 인물 ID 매칭이나 실패 시 null이 더 적절한지 판단해야 한다.

## 18. 인증·권한·회원 삭제의 시스템 경계

**원본:** `src/stores/auth.ts`, `src/router/index.ts`, `src/lib/supabase.ts`, Supabase RLS와 Edge Functions.

### 18.1 세션 동기화 중복 제거

인증 스토어는 focus, pageshow, online, storage, visibilitychange 등에서 세션을 다시 확인한다. 일반 요청은 4초 throttle, 주기 확인은 5초 간격이며 숨겨진 문서에서는 건너뛴다. 동시에 진행 중인 `sessionSyncPromise`가 있으면 공유하고 finally에서 지운다.

throttle은 호출 빈도를 제한하고 Promise 공유는 중복 진행을 막는다. 두 기능은 다르다. 강제 갱신은 throttle을 우회하지만 진행 중 Promise 공유는 유지한다. `getSession` 호출을 모두 서버 검증 요청으로 단정해서도 안 된다.

### 18.2 스토어 전환과 라우터 가드

세션 적용은 추천·리스트·보관함 스토어의 활성 사용자를 변경한다. 라우터 가드는 초기화 또는 세션 확인 후 guestOnly와 requiresAuth를 검사한다. 이는 사용자 경험을 위한 접근 흐름이며 보안의 최종 경계는 DB RLS와 서버 인증이다.

이메일이 아닌 로그인 ID는 소문자화·인코딩 후 가상 이메일 도메인에 연결한다. 이 변환은 계정 식별 편의 기능이며 비밀번호 보안 알고리즘이 아니다. 인코딩 과정에서 문자 치환을 수행하므로 서로 다른 입력이 같은 식별자로 매핑되는지 경계값 테스트가 필요하다.

### 18.3 서버 비밀키와 로컬 프록시

TMDB·KOBIS 키는 Netlify 함수의 서버 환경변수로 읽는다. Vite 개발·preview 플러그인은 동일 핸들러를 로컬 서버 경로에 연결한다. 서버용 키에 `VITE_`를 붙이지 않는다는 프로젝트 규칙이 있다.

개발 어댑터는 Node 요청을 Web Request로, Web Response를 Node 응답으로 변환한다. 현재 구현은 요청 body 전달을 일반화하지 않았으므로 POST 바디가 필요한 새 함수까지 자동 지원한다고 볼 수 없다.

### 18.4 회원 삭제

서버는 POST와 확인 문자열을 검사하고 전달된 Authorization으로 `auth.getUser()`를 호출한다. 삭제 대상은 클라이언트가 보낸 임의 userId가 아니라 **검증된 user.id**다. 서비스 역할 키는 서버에서만 사용한다.

아바타는 최대 100개씩 조회·삭제하고 다시 처음부터 조회한다. 삭제하면서 offset을 늘리면 남은 항목을 건너뛸 수 있으므로 이 방식이 적합하다. 이후 관리자 API로 사용자를 삭제한다.

Storage 삭제와 사용자 삭제는 하나의 DB 트랜잭션이 아니다. 아바타를 지운 뒤 계정 삭제가 실패하는 부분 성공이 가능하다. 같은 요청의 재시도와 잔여 데이터 정리 정책을 별도로 고려해야 한다.

### 18.5 서버에서 메타데이터를 가져와도 ID 연결은 검증해야 한다

`sync-profile-movie-metadata`는 로그인 확인 후 최대 50개의 `movieId`, `tmdbMovieId`를 받고 TMDB에서 메타데이터를 직접 조회한다. 장르나 감독을 브라우저가 임의 전송하지 못하게 하는 장점이 있다.

하지만 이 두 ID의 대응 관계도 클라이언트 입력이다. 현재 정규화는 길이·숫자 범위를 검사하므로 정식 카탈로그의 매핑과 일치하는지는 추가 서버 검증이 필요하다. “서버가 API를 호출하므로 메타데이터의 모든 의미가 신뢰 가능하다”는 결론은 성립하지 않는다.

## 19. 프런트엔드의 어려운 상태: 제스처와 PWA

### 19.1 스와이프 판정은 순서가 있는 결정 트리

**원본:** `src/components/rating/RatingMovieCard.vue`.

pointerdown에서 시작 좌표를 저장하고 pointer capture를 잡는다. 이동량 dx,dy로 `translate(dx,dy)`와 `rotate(dx/24)`를 구성한다. pointerup의 순서는 다음과 같다.

1. dy < -80이고 |dy| > |dx|면 위쪽 관심 있음.
2. dx > 80이면 오른쪽 재미있음.
3. dx < -80이면 왼쪽 재미없음.
4. dy > 80이고 |dy| > |dx|면 아래쪽 관심 없음.
5. 나머지는 원위치.

위쪽은 수평보다 먼저 검사하지만 아래쪽은 뒤에 검사한다. 예를 들어 dx=90, dy=140이면 아래가 아니라 오른쪽이다. 단순히 “가장 큰 축으로 결정한다”고 요약하면 틀린다. 속도 기반 flick이나 상대 화면 크기 기반 임계값도 아니다.

`pointercancel`도 `onPointerUp`에 연결되어 있으므로 취소 시 이동량에 따라 선택을 확정할 수 있다. 취소는 reset만 해야 하는지 별도 테스트할 가치가 있다. 버튼 내부에서는 pointer 이벤트 전파를 막아 카드 드래그와 버튼 동작의 충돌을 줄인다.

### 19.2 PWA 범위

프로덕션은 자동 업데이트 모드로 서비스 워커를 등록한다. 개발 모드는 기존 등록과 캐시를 지워 오래된 번들이 보이는 문제를 줄인다. 이 삭제는 현재 origin의 등록·캐시 전반에 영향을 줄 수 있으므로 같은 origin에 다른 앱을 함께 둘 때 범위를 고려해야 한다.

Vite 설정의 런타임 이미지 캐시는 Unsplash URL 대상으로, TMDB 이미지 전체에 적용되는 설정은 아니다. 정적 자산 캐시가 있다고 Supabase 쓰기나 외부 API 조회까지 오프라인으로 작동한다고 설명해서는 안 된다.

### 19.3 평가 화면은 URL과 저장 상태를 합친 상태 기계다

**원본:** `src/views/RatingView.vue`, `EditRatingView.vue`, `recommendationStore.ts`.

현재 화면은 route query의 `mode=detail|more|edit`, `detailPaused`, 추가 배치 인덱스, 현재 영화, 상세 미완료 평가 목록을 조합해 결정된다. `ratingResumeSurface`는 primary·detail·more 및 각 completion 상태를 저장한다.

```text
초기 평가 → 상세 필요 여부 판정 → 상세 대기열
    │                            │
    └→ 초기 평가 완료             ├→ 상세 제출 → 다음 상세 영화
                                 └→ 건너뛰기 → detailCompleted=true

추가 평가 → 기존 배치 재개 또는 새 배치 예약 → 동일 평가 흐름
이력 수정 → 원래 결정·방향을 draft로 복원 → 상세 모드 또는 즉시 저장
```

`getDetailedRatingFeedbackMode`가 양성/음성 폼 선택의 공통 정책이다. primary 저장 중에는 `isSavingPrimaryDecision`으로 중복 입력을 차단하고 finally에서 해제한다. 현재 상세 대상은 선택한 검색 영화가 대기열에 있으면 우선하고, 없으면 다음 미완료 영화로 이동한다. DOM 갱신 후 스크롤하기 위해 nextTick을 사용한다.

상세 건너뛰기도 `detailCompleted=true`로 저장한다. 따라서 상세 완료를 “별점·태그를 실제로 모두 입력했다”라고 해석하면 안 된다. 완료는 흐름을 마쳤다는 상태이며 입력 충실도는 별도다.

현재 상태는 여러 ref·computed·watch에 분산되어 있다. 모드 조합이 늘어나면 불가능한 상태가 생길 수 있으므로 discriminated union과 명시적인 전이 함수를 사용하는 것이 개선안이다.

```ts
// 설계 개선 예시. 현재 프로젝트에 구현되어 있지는 않다.
type RatingScreen =
  | { kind: 'primary'; batchId: string; movieId: string }
  | { kind: 'detail'; movieId: string; feedbackMode: 'positive' | 'negative' }
  | { kind: 'completion'; batchId: string }
  | { kind: 'paused'; resume: 'primary' | 'detail' };
```

### 19.4 프로필 이미지 저장의 부분 성공

`profileService.ts`는 image MIME 접두어와 5MB 상한을 검사하고, `userId/timestamp-UUID.ext` 경로로 업로드한 뒤 프로필 행에 URL을 기록한다. 고유 파일명은 기존 이미지의 캐시와 파일명 충돌을 줄인다. 클라이언트 파일 검증은 사용자 안내이고 최종 업로드 권한·제한은 Storage 정책에서 다뤄야 한다.

업로드 성공 후 프로필 update가 실패하면 참조되지 않는 파일이 남을 수 있다. 이전 아바타를 새 파일로 교체하는 과정 역시 단일 트랜잭션이 아니므로 보상 삭제나 주기적 고아 파일 정리가 개선안이다. 이는 계정 삭제와 같은 “DB 밖의 자원을 함께 바꾸는 작업”이라는 공통 문제다.

## 20. 복잡도와 확장성: 무엇이 먼저 병목이 되는가


기호: N=영화 수, R=평가 수, D=특징 종류, L=리스트 수, M=리스트당 영화 수, F=영화 특징 처리량, U=병합 후 고유 평가 수, C=워커 수.

| 작업 | 현재 구현의 주요 비용 | 확장 시 검토 |
|---|---|---|
| 콘텐츠 전체 랭킹 | O(NF + N log N) | 특징 인덱스, top-K heap, 서버 후보 생성 |
| 프로필 전체 재계산 | 사전 복사 포함 O(RD + 입력 처리) | 불변성 유지한 단일 집계, 증분 계산 |
| 장르 보정 배열 누적 | 동일 장르 편중 시 O(R²) | sum/count 누적 |
| 평가 병합 | O(L_local+R_remote+U log U) | revision, 변경분 교환 |
| 중복 리스트 서명 | 후보당 O(M log M) | 서명 캐시, 서버 키 |
| 연속 날짜 계산 | 정렬 중심 O(D_dates log D_dates) | 사용자·날짜 인덱스와 실행 계획 |
| 외부 상세 수집 | 시간은 네트워크와 C에 의존, 결과 메모리 O(N) | 제한 동시성, 재시도, 배치 체크포인트 |
| SQL 협업 집계 | 사용자-영화 공통 간선과 조인 카디널리티에 의존 | EXPLAIN, 부분 인덱스, 사전 집계 |

SQL을 코드 길이만 보고 O(N)이라고 단정하지 않는다. 특히 인기 영화에 평가가 집중되면 자기 사용자 신호와 이웃 신호의 조인 결과가 커질 수 있다. `(movie_id,user_id)`와 `(user_id,movie_id)` 인덱스의 역할이 다를 수 있고, 부분 인덱스는 쿼리 조건과 맞아야 효과가 있다.

클라이언트 최적화는 측정한 뒤 한다. 점수 계산만 빠르게 바꾸더라도 정적 카탈로그 번들 파싱, 화면 렌더링, 반복된 인증 후 스토어 로드가 더 큰 비용이면 사용자 체감은 달라지지 않을 수 있다.

## 21. 검증 전략과 연구 수준의 평가 설계

### 21.1 저장소에 있는 검증 스크립트

```sh
npm run test:situations
npm run test:catalog-surfaces
npm run test:kobis-boxoffice
npm run typecheck
```

상황 테스트는 jiti로 TypeScript 순수 계산을 읽어 규칙·배점·필터·순위를 검사한다. 카탈로그 표면과 박스오피스 스크립트는 각각 관련 데이터·호출 경로의 회귀를 검사한다. 구체적인 실행 결과는 문서 말미의 검증 기록에 남긴다.

테스트 통과가 추천 만족도 또는 실제 DB의 트랜잭션·RLS 검증을 뜻하지는 않는다. 외부 API를 모킹한 테스트는 계약과 폴백을 검증하지만 운영 API 가용성까지 확인하지 않는다.

### 21.2 추가로 가치가 높은 테스트

| 대상 | 중요한 시나리오 | 검증 이유 |
|---|---|---|
| 점수 | NaN, 결측 메타데이터, 0~100 경계 | 비정상 응답이 정렬을 오염시키지 않게 함 |
| 평가 | 좋아요+낮은 별점, 싫어요+높은 별점 | 정책 충돌을 명시 |
| 상황 | 엄격 1개, 완화 0개, 런타임 누락 | 필터·설명 일치 |
| 동기화 | A 사용자 요청 중 B 로그인 | 이전 응답의 상태 오염 방지 |
| 병합 | 동일 시각, 잘못된 시각, 삭제 후 재로그인 | 결정성·삭제 전파 |
| 투표 | 두 동시 요청, 선택 변경, 타인 ID | 유일성·권한 |
| 저장 수 | 동시 insert/delete | 트리거 카운트 무결성 |
| 수집 | Retry-After null·숫자·날짜, fetch throw | 대기·재시도 정책 |
| 계정 삭제 | Storage 성공 후 사용자 삭제 실패 | 부분 성공 복구 |
| 칭호 | 같은 이벤트 동시 호출 | 중복 발급 차단 |

### 21.3 추천 품질을 평가하려면

**아래는 개선·실험 제안이며 현재 수행한 실험이 아니다.** 시간순으로 과거 평가를 학습용, 이후 긍정 반응을 평가용으로 분리한다. 미래의 저장·노출을 과거 추천 계산에 섞으면 데이터 누수가 된다.

- Precision@K: 추천 K개 중 실제 긍정 반응 비율.
- Recall@K: 평가 대상 긍정 영화 중 추천에 포함된 비율.
- NDCG@K: 높은 만족도의 영화가 앞에 오는지 평가.
- Coverage: 전체 카탈로그 중 실제 추천되는 영화 비율.
- Diversity: 목록 안의 장르·인물 유사성이 지나치게 높지 않은지.
- Novelty와 재노출률: 새로운 후보를 얼마나 제공하는지.
- 온라인 지표: 상세 진입, 저장, 평가 완료, 부정 피드백, 세션당 만족도.

인기순 baseline, 콘텐츠만, 협업만, 전체 결합을 비교하고 각 신호를 하나씩 제거하는 ablation을 수행한다. 사용자가 보지 않은 영화를 싫어한다고 간주해서는 안 된다. 실제 노출과 클릭 기회를 기록해야 한다.

### 21.4 측정 전에 말할 수 없는 문장

“정확도를 20% 높였다”, “수만 명 동시 접속을 처리했다”, “모든 충돌을 해결했다”, “개인정보 유출이 불가능하다”는 현재 근거가 없다. 대신 “항목별 점수를 재현 가능하게 만들었다”, “클라이언트 요청 순서를 직렬화했다”, “개인 평가 대신 집계 결과를 반환한다”처럼 코드로 입증할 수 있는 성과를 말한다.

## 22. 면접 예상 질문과 답변

### Q1. 이 프로젝트의 가장 핵심적인 기술 문제는 무엇인가?

서로 다른 의미의 행동을 추천 신호로 연결하면서 로컬과 서버 상태를 일치시키는 문제다. 평가·관심·저장·노출을 구분하고, 클라이언트의 설명 가능한 점수와 서버의 사용자 간 비교를 결합했다. 동시에 빠른 응답을 위해 로컬에 먼저 저장하므로 병합·실패·재시도·경쟁 상태를 고려해야 한다.

### Q2. 머신러닝 추천 시스템을 직접 학습시켰는가?

현재는 규칙 기반 콘텐츠 점수와 SQL 협업 집계를 결합한 시스템이다. 모델 학습이나 임베딩 최적화는 없다. 가중치를 데이터로 학습하는 것은 향후 실험 방향이며 이미 구현했다고 말하지 않는다.

### Q3. 왜 여섯 원점수를 0~100으로 맞췄는가?

항목마다 범위가 다르면 큰 수를 만드는 항목이 의도치 않게 지배한다. 공통 범위로 제한한 뒤 배점을 적용해 기여를 설명하기 쉽게 했다. 그러나 범위가 같다고 통계적 분포나 의미까지 같은 것은 아니므로 실제 데이터로 보정할 필요가 있다.

### Q4. 추천 이유가 점수에 정확히 대응하는가?

점수 계산 함수가 이유를 함께 반환하고 기여점수를 보존한다. 다만 문구는 최대 6개를 순서대로 합치며 실제 기여순 정렬은 아니다. 시간 필터 폴백 문구도 개선 여지가 있다. 설명을 엄밀하게 하려면 사용한 규칙·실제 기여값·폴백 상태를 함께 반환해야 한다.

### Q5. 콜드 스타트는 어떻게 처리했는가?

초기 10개 평가 표본으로 신호를 만들고, 데이터가 적어도 개인 기본 점수·TMDB 품질·새로움·상황 규칙으로 정렬할 수 있다. 협업 신호가 없으면 0점이며 나머지 배점을 자동 재분배하지 않는다. 무평가 사용자의 추천 점수가 기존 사용자와 같은 의미라고 보장할 수 없다.

### Q6. 왜 장르 선호를 평균만으로 만들지 않았는가?

affinity 누적으로 반복 선호의 강도를 표현하고, 별점 보정 평균으로 장르에 대한 평가 경향을 추가한다. 대신 많이 평가한 장르가 유리하고 시간 감쇠가 없다는 한계가 있다. 평균·표본 수·최근성을 분리하면 더 유연해진다.

### Q7. 싫어요는 모든 추천 경로에서 같은 의미인가?

아니다. 기존 프로필은 강한 음수 누적을 쓰고, 현재 개인 점수는 별점 평균 보정 중심이며, 영화 RPC는 보관함과 max로 결합한다. 커뮤니티 RPC는 평가를 우선한다. 이 차이를 정책으로 문서화하고 공통 신호 변환기를 검토해야 한다.

### Q8. 추천 노출을 기록하면 어떤 변화가 생기는가?

해당 영화의 새로움 점수가 0이 되고 현재 랭커에서는 협업 점수도 0이 된다. 이는 탐색을 촉진할 수 있지만 노출 직후 점수가 크게 변할 수 있다. 시간에 따른 회복이나 세션 단위 고정 목록은 개선안이다.

### Q9. 평가 수정 때 전체 프로필을 다시 만드는 이유는?

기존 평가를 빼는 역연산을 별도로 유지하지 않아도 되어 정확성이 단순해진다. 현재 크기에서는 합리적인 선택일 수 있으나 사전 복사 비용과 평가 수 증가를 측정하고 집계 최적화를 적용할 수 있다.

### Q10. Promise 저장 큐가 DB 트랜잭션을 대신하는가?

아니다. 큐는 한 브라우저 스토어의 실행 순서를 정한다. 여러 테이블의 원자성은 DB 트랜잭션, 여러 사용자와 기기의 경쟁은 서버 제약·revision·잠금 정책으로 해결해야 한다.

### Q11. last-write-wins면 충돌이 완전히 해결되는가?

현재는 클라이언트 시각을 비교하는 정책이므로 시계 오차와 삭제 전파 문제가 있다. 동률에서 상세 완료를 우선하지만 동일 조건의 충돌은 순서에 의존한다. 요구 수준에 따라 서버 revision이나 작업 로그를 도입해야 한다.

### Q12. localStorage를 쓴 이유와 한계는?

작은 JSON 상태를 빠르게 복구하고 네트워크 실패 중에도 사용하기 쉽다. 동기 API라 큰 직렬화는 메인 스레드를 막고, 용량·권한·XSS·다중 탭 일관성 문제를 고려해야 한다. 큰 데이터와 영속 큐에는 IndexedDB가 후보가 된다.

### Q13. RLS와 라우터 가드의 차이는?

라우터는 화면 접근 흐름을 조절한다. 사용자가 직접 API를 호출할 수 있으므로 데이터 권한은 RLS와 서버 함수가 검증해야 한다. service role은 서버에서만 사용하고 definer 함수는 auth.uid와 반환 범위를 검토한다.

### Q14. SQL로 연속 출석을 계산하는 원리는?

날짜를 중복 제거·정렬한 뒤 row_number를 빼면 연속 날짜에서 같은 값이 나온다. 그 값으로 그룹화해 길이를 세면 된다. 시간대 변환과 오늘 미응답 시 current streak의 정의가 중요하다.

### Q15. DB 칭호 발급에서 멱등성은 어떻게 보장되는가?

사용자·칭호 unique 제약과 on conflict do nothing이 최종 경계다. 이벤트가 중복 도착해도 같은 소유권 행이 늘어나지 않는다. 브라우저의 알림 큐 중복 제거만으로 DB 중복을 막는 것은 아니다.

### Q16. 검색 결과의 역전을 어떻게 막는가?

요청마다 증가하는 토큰을 캡처하고 응답 시 최신 토큰과 비교한다. 이전 요청이 늦게 끝나면 결과를 버린다. 요청을 취소하는 것이 아니므로 비용 절감은 별도 debounce·취소로 다룬다.

### Q17. 동시성 4인 워커 풀의 결과가 섞이지 않는 이유는?

await 전에 인덱스를 배정하고 그 인덱스의 결과 칸에 기록한다. 실행 순서와 완료 순서가 달라도 결과 배열의 위치는 입력과 같다. 단일 JS 실행 맥락의 동기 구간이라는 전제가 있다.

### Q18. API 재시도에서 가장 주의할 점은?

재시도 가능한 오류인지, 대기값이 유효한지, 쓰기 작업이 멱등한지, 호출 상한이 있는지다. 이 프로젝트는 특정 HTTP 상태만 최대 4회 재시도하며 null Retry-After가 0으로 변하는 경계와 네트워크 예외 처리를 개선할 여지가 있다.

### Q19. 추천 시스템을 더 확장한다면 어디부터 바꾸겠는가?

우선 행동 의미와 점수 실험 기준을 통일하고 실제 지연을 측정한다. 이후 sum/count 집계, 정규화 텍스트 캐시, 서버 후보 생성과 클라이언트 재정렬, 협업 사전 집계를 검토한다. 데이터 규모를 모른 채 ANN이나 분산 시스템부터 도입하지 않는다.

### Q20. 가장 아쉬운 설계와 개선 우선순위는?

현재 추천 경로별 긍정 신호 정의, 원격 상태 적용의 세대 검증, 안정 movieId 유지가 우선 검토 대상이다. 사용자에게 직접 잘못된 데이터가 보이거나 평가가 다른 영화에 붙는 문제는 미세한 정렬 품질보다 우선한다. 이어서 점수 정책과 테스트·관측을 개선한다.

## 23. 발표용 설명과 학습 체크리스트

### 23.1 1분 설명 예시

“Moodie는 사용자가 영화에 남긴 평가와 현재 상황을 이용해 추천하는 서비스입니다. 브라우저에서 장르 선호, 상황 일치, 작품 품질, 새로움, 감독·배우 선호를 계산하고, DB에서는 공통 평가가 있는 사용자들의 추천 신호를 집계합니다. 항목별 원점수와 최종 기여를 분리해 추천 이유를 추적할 수 있게 했습니다. 평가를 먼저 로컬에 저장하고 서버에는 Promise 큐로 순서대로 반영하며, 다시 접속할 때 영화별 최신 기록을 병합합니다. 현재는 수동 규칙과 협업 집계를 결합한 모델이며, 실제 정확도 개선은 향후 시간순 평가 데이터와 대조 실험으로 검증해야 합니다.”

### 23.2 5분 설명의 순서

1. 사용자 문제와 평가·관심·저장 신호의 차이: 40초.
2. 후보 생성과 최종 여섯 점수, 76.23점 예제: 80초.
3. SQL 협업 집계와 타인의 원시 평가를 반환하지 않는 경계: 50초.
4. 로컬 우선 저장·병합·쓰기 큐·읽기 토큰: 70초.
5. 검증 범위, 코드상 한계, 다음 개선: 60초.

### 23.3 직접 설명할 수 있어야 할 것

- [ ] 기존 콘텐츠 점수와 현재 최종 점수의 차이.
- [ ] 별점 가중치 두 종류와 영화·리스트·게시물 유사도 세 종류.
- [ ] 100점 만점과 만족 확률의 차이.
- [ ] 필터와 점수, strict와 fallback의 차이.
- [ ] Map 병합, Set 중복 제거, 리스트 서명의 목적.
- [ ] 큐·요청 토큰·Promise 캐시가 각각 해결하는 문제.
- [ ] DB unique, RLS, 트랜잭션, definer 함수의 역할.
- [ ] 날짜-row_number가 연속 그룹을 만드는 이유.
- [ ] 워커 풀에서 실행 순서와 결과 순서를 분리하는 법.
- [ ] 테스트 통과와 운영 성능·추천 품질 검증의 차이.
- [ ] 아직 구현하지 않은 개선을 기존 성과로 말하지 않기.

## 부록 A. 정독할 원본 지도

아래 경로는 저장소 루트 기준이다. 줄 번호보다 함수명 검색을 권장한다. 코드 수정으로 줄이 이동해도 함수 단위 탐색은 유지되기 때문이다.

| 우선순위 | 파일·함수 | 확인할 내용 |
|---|---|---|
| 최상 | `src/services/recommendationStore.ts`: `contextAwareRecommendedMovies` | 실제 최종 호출 연결 |
| 최상 | `src/services/recommendationScoring.ts`: `calculateFinalRecommendationScore` | 배점과 점수 분해 |
| 최상 | `src/config/recommendationScoring.ts` | 모든 숫자 정책 |
| 최상 | `src/services/situationRecommendation.ts`: `rankSituationMovies` | 필터, 폴백, 점수, 설명, 정렬 |
| 최상 | `src/services/movie_recommendation_algorithm.ts`: `applyRatingToProfile` | 기존 프로필의 가중 누적 |
| 최상 | `202608271200_add_score_based_movie_recommendations.sql` | 영화 협업 추천 |
| 최상 | `202608291200_add_personalized_community_post_recommendations.sql` | 게시물 추천 |
| 높음 | `202608121300_add_similar_taste_list_recommendations.sql` | 코사인 유사도 |
| 높음 | `recommendationStore.ts`: `mergeRatingRecords`, `setActiveUser`, `enqueueRemoteTask` | 동기화의 보장 범위 |
| 높음 | `recommendationRepository.ts`: `remoteCollaborativeRecommendationRepository` | 스키마 호환과 점수 변환 |
| 높음 | `src/data/rating.ts`: `buildTasteAnalysisBatch` | 초기 표본 선택 |
| 높음 | `src/services/listStore.ts` | 검색 토큰, 공유 규칙, 복제본 동기화 |
| 높음 | `src/services/listSearchService.ts` | 가중 필드 검색 |
| 높음 | `202607271500_create_profiles_and_titles.sql` | 연속 날짜, 빙고, 칭호 발급 |
| 높음 | `202608021000_remove_community_mission_proof.sql` | 현재 게시물 생성 RPC |
| 높음 | `202607300900_repair_community_save_counts.sql` | 집계 트리거 |
| 높음 | `copied-files/tmdb-api/sync-tmdb-data.mjs` | 실제 수집 구현 |
| 보완 | `src/services/tasteAnalysisResult.ts`, `tasteInsights.ts` | 화면별 집계 차이 |
| 보완 | `src/services/community/communityService.ts`, `commentService.ts`, `pollService.ts` | 조립, 페이지네이션, upsert |
| 보완 | `src/stores/auth.ts`, `src/router/index.ts` | 세션 수명과 접근 흐름 |
| 보완 | `src/services/movieTrailer.ts`, `tmdbMovieCast.ts` | TTL 캐시와 Promise 캐시 |
| 보완 | `netlify/functions/kobis-boxoffice.mjs`, `tmdb-kobis-detail.mjs` | API 연결과 엔터티 매칭 |
| 보완 | `supabase/functions/delete-account/index.ts` | 인증된 본인 삭제와 부분 실패 |
| 보완 | `supabase/functions/sync-profile-movie-metadata/index.ts` | 서버 메타데이터 신뢰 경계 |
| 보완 | `src/components/rating/RatingMovieCard.vue` | 제스처 결정 순서 |
| 보완 | `vite.config.ts`, `src/registerServiceWorker.ts` | 로컬 함수 어댑터와 PWA |

SQL 파일은 모두 `supabase/migrations/` 아래에 있다. 축약된 TS 파일명은 문맥상 `src/services/` 아래를 뜻한다.

## 부록 B. 혼동하기 쉬운 주장 교정표

| 피해야 할 주장 | 코드에 맞는 설명 |
|---|---|
| 추천은 하나의 알고리즘이다 | 대상별 점수와 신호 정의가 다르다 |
| 모든 추천은 코사인 유사도다 | 공개 리스트에 코사인 유사도가 있고 영화·게시물은 다른 식이다 |
| 자유 텍스트를 AI가 감성 분석한다 | 정규화와 키워드 사전 매칭이다 |
| 리뷰 태그가 최종 100점에 직접 더해진다 | 기존 후보 순서에 영향, 최종 여섯 점수는 별도 계산이다 |
| 커뮤니티 신호 25%를 상황 점수에 반영한다 | 설정·조회는 있으나 현재 랭킹 연결은 없다 |
| 선택 장르로 초기 평가 영화를 뽑는다 | 현재 배치 함수는 선택 장르 인수를 사용하지 않는다 |
| 모든 저장 영화가 새로움 계산에 들어간다 | 현재 호출부의 encountered 조립 범위를 확인해야 한다 |
| history에 모든 수정 이벤트를 저장한다 | 사용자·영화 unique인 지속 기록이다 |
| 저장 Promise 종료는 서버 성공이다 | 추천 스토어는 실패를 잡고 상태에 기록한다 |
| 큐만 있으면 모든 경쟁 상태를 막는다 | 읽기 역전·계정 전환·다중 기기는 별도다 |
| API 수집은 지수 백오프다 | 현재 fallback 대기는 선형이며 null 처리 경계가 있다 |
| 서비스 워커로 모든 기능이 오프라인이다 | 정적 캐시와 로컬 데이터 범위가 중심이다 |
| 서버에서 데이터 조회하면 ID도 믿을 수 있다 | 브라우저가 전달한 앱 ID와 외부 ID 연결을 검증해야 한다 |
| 테스트가 추천 만족도를 증명한다 | 규칙 회귀 테스트와 품질 실험은 별개다 |

## 부록 C. 검증 기록

아래 실행 결과는 문서 작성 시점에 수행한 명령의 결과만 기록한다. 운영 DB 및 실제 사용자 대상 실험은 포함하지 않는다.

| 명령 | 결과 | 해석 |
|---|---|---|
| `npm run test:situations` | 통과: Situation recommendation tests passed. | 정의된 상황·점수 회귀 검증 |
| `npm run test:catalog-surfaces` | 통과: Catalog surface consistency tests passed. | 카탈로그 표면 일관성 검증 |
| `npm run test:kobis-boxoffice` | 통과: KOBIS poster matching tests passed. | 박스오피스 포스터 매칭 검증 |
| `npm run typecheck` | 종료 코드 0 | Vue·TypeScript 정적 검사 |

애플리케이션 동작을 변경하지 않고 이 Markdown 문서만 추가했다. 테스트와 타입 검사를 실행했으며 빌드·배포·실제 API 데이터 재수집·DB 마이그레이션은 실행하지 않았다. 타입 검사 과정의 캐시 파일 갱신은 문서와 별개인 도구의 부수 효과다. 작업 시작 시 이미 존재하던 소스·빌드 결과의 변경은 문서 근거로 읽되 수정하거나 되돌리지 않았다.

## 부록 D. 현재 소스에서 직접 발췌한 코드

아래 코드는 설명용 재작성 없이 실제 파일에서 추출했다. 각 블록은 원래 모듈의 타입·상수·import에 의존하므로 단독 복사 실행용 코드는 아니다. 행 번호는 문서 생성 시점의 위치다.

### D.1 기존 콘텐츠 취향 업데이트

원본: [src/services/movie_recommendation_algorithm.ts](C:/Users/woojo/OneDrive/Desktop/Movie/src/services/movie_recommendation_algorithm.ts:423), 시작 행 423.

```ts
export function applyRatingToProfile(
  profile: UserPreferenceProfile,
  movie: Movie,
  input: RatingInput,
  options?: {
    reviewText?: string;
  }
): UserPreferenceProfile {
  const nextProfile: UserPreferenceProfile = {
    ...profile,
    genreScores: { ...profile.genreScores },
    tagScores: { ...profile.tagScores },
    reviewTagScores: { ...profile.reviewTagScores },
    characterScores: { ...profile.characterScores },
    totalRatings: profile.totalRatings + 1
  };

  if (input.status === 'not_seen') {
    return nextProfile;
  }

  if (input.status === 'dislike') {
    const dislikeRatingWeight = Math.min(0, getRatingWeight(input.rating));
    const totalDislikeWeight = DISLIKE_BASE_WEIGHT + dislikeRatingWeight;
    const dislikeTagWeight = Math.min(-1, Math.ceil(totalDislikeWeight / 2));

    for (const genre of movie.genres) {
      addScore(nextProfile.genreScores, genre, totalDislikeWeight);
    }

    for (const tag of movie.tags) {
      addScore(nextProfile.tagScores, tag, dislikeTagWeight);
    }

    for (const reviewTag of input.reviewTags) {
      addScore(nextProfile.reviewTagScores, reviewTag, -REVIEW_TAG_WEIGHT);
    }

    for (const favoriteCharacter of getMeaningfulFavoriteCharacters(
      normalizeFavoriteCharacters(input.favoriteCharacters)
    )) {
      addScore(nextProfile.characterScores, favoriteCharacter, -CHARACTER_WEIGHT);
    }

    const reviewTextSignals = extractReviewTextSignals(options?.reviewText ?? '');

    for (const genre of reviewTextSignals.genres) {
      addScore(nextProfile.genreScores, genre, -REVIEW_TEXT_GENRE_WEIGHT);
    }

    for (const tag of reviewTextSignals.tags) {
      addScore(nextProfile.tagScores, tag, -REVIEW_TEXT_TAG_WEIGHT);
    }

    for (const reviewTag of reviewTextSignals.reviewTags) {
      addScore(nextProfile.reviewTagScores, reviewTag, -REVIEW_TEXT_REVIEW_TAG_WEIGHT);
    }

    return nextProfile;
  }

  const ratingWeight = getRatingWeight(input.rating);
  const totalLikeWeight = LIKE_BASE_WEIGHT + ratingWeight;

  for (const genre of movie.genres) {
    addScore(nextProfile.genreScores, genre, totalLikeWeight);
  }

  for (const tag of movie.tags) {
    addScore(nextProfile.tagScores, tag, Math.max(1, Math.floor(totalLikeWeight / 2)));
  }

  for (const reviewTag of input.reviewTags) {
    addScore(nextProfile.reviewTagScores, reviewTag, REVIEW_TAG_WEIGHT);
  }

  for (const favoriteCharacter of getMeaningfulFavoriteCharacters(
    normalizeFavoriteCharacters(input.favoriteCharacters)
  )) {
    addScore(nextProfile.characterScores, favoriteCharacter, CHARACTER_WEIGHT);
  }

  const reviewTextSignals = extractReviewTextSignals(options?.reviewText ?? '');

  for (const genre of reviewTextSignals.genres) {
    addScore(nextProfile.genreScores, genre, REVIEW_TEXT_GENRE_WEIGHT);
  }

  for (const tag of reviewTextSignals.tags) {
    addScore(nextProfile.tagScores, tag, REVIEW_TEXT_TAG_WEIGHT);
  }

  for (const reviewTag of reviewTextSignals.reviewTags) {
    addScore(nextProfile.reviewTagScores, reviewTag, REVIEW_TEXT_REVIEW_TAG_WEIGHT);
  }

  return nextProfile;
}
```

### D.2 최종 점수의 배점 결합

원본: [src/services/recommendationScoring.ts](C:/Users/woojo/OneDrive/Desktop/Movie/src/services/recommendationScoring.ts:286), 시작 행 286.

```ts
export const calculateFinalRecommendationScore = ({
  configuredPreset = false,
  hasSituation,
  rawScores
}: FinalRecommendationScoreInput): FinalRecommendationScoreResult => {
  const weights: RecommendationScoreWeights = configuredPreset
    ? RECOMMENDATION_SCORING_CONFIG.weights.configuredPreset
    : hasSituation
      ? RECOMMENDATION_SCORING_CONFIG.weights.withSituation
      : RECOMMENDATION_SCORING_CONFIG.weights.withoutSituation;
  const maximums: RecommendationScoreBreakdown = { ...weights };
  const breakdown: RecommendationScoreBreakdown = {
    personalPreference: scaleRawScore(rawScores.personalPreference, weights.personalPreference),
    similarUser: scaleRawScore(rawScores.similarUser, weights.similarUser),
    situation: scaleRawScore(rawScores.situation, weights.situation),
    tmdbQuality: scaleRawScore(rawScores.tmdbQuality, weights.tmdbQuality),
    novelty: scaleRawScore(rawScores.novelty, weights.novelty),
    people: scaleRawScore(rawScores.people, weights.people)
  };
  const finalScore = clampRecommendationScore(
    Object.values(breakdown).reduce((total, value) => total + value, 0)
  );

  return { breakdown, finalScore, maximums };
};
```

### D.3 영화별 평가 병합

원본: [src/services/recommendationStore.ts](C:/Users/woojo/OneDrive/Desktop/Movie/src/services/recommendationStore.ts:309), 시작 행 309.

```ts
const getAnsweredAtTime = (record: StoredRatingRecord) => {
  const timestamp = new Date(record.input.answeredAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const shouldReplaceRatingRecord = (current: StoredRatingRecord, candidate: StoredRatingRecord) => {
  const currentTime = getAnsweredAtTime(current);
  const candidateTime = getAnsweredAtTime(candidate);

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }

  if (candidate.detailCompleted !== current.detailCompleted) {
    return candidate.detailCompleted;
  }

  return false;
};

const mergeRatingRecords = (
  localRatings: readonly StoredRatingRecord[],
  remoteRatings: readonly StoredRatingRecord[]
) => {
  const mergedRatings = new Map<string, StoredRatingRecord>();

  for (const record of [...localRatings, ...remoteRatings]) {
    const existing = mergedRatings.get(record.input.movieId);

    if (!existing || shouldReplaceRatingRecord(existing, record)) {
      mergedRatings.set(record.input.movieId, record);
    }
  }

  return [...mergedRatings.values()].sort(
    (left, right) => getAnsweredAtTime(left) - getAnsweredAtTime(right)
  );
};
```

### D.4 최신 요청만 반영하는 검색

원본: [src/services/listStore.ts](C:/Users/woojo/OneDrive/Desktop/Movie/src/services/listStore.ts:327), 시작 행 327.

```ts
const refreshMovieSearchResults = async () => {
  const trimmedQuery = state.movieSearchQuery.trim();
  const searchToken = ++latestMovieSearchToken;

  if (!trimmedQuery) {
    state.movieResults = [];
    state.isSearchingMovies = false;
    return;
  }

  state.isSearchingMovies = true;
  const results = await searchCatalog(trimmedQuery);

  if (searchToken !== latestMovieSearchToken) {
    return;
  }

  state.movieResults = results.movies;
  state.isSearchingMovies = false;
};
```

### D.5 입력 순서를 보존하는 동시성 제한

원본: [copied-files/tmdb-api/sync-tmdb-data.mjs](C:/Users/woojo/OneDrive/Desktop/Movie/copied-files/tmdb-api/sync-tmdb-data.mjs:1024), 시작 행 1024.

```js
const mapWithConcurrency = async (items, concurrency, mapper) => {
  if (items.length === 0) {
    return [];
  }

  const results = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
};
```

### D.6 SQL 영화 협업 추천 전체

원본: [supabase/migrations/202608271200_add_score_based_movie_recommendations.sql](C:/Users/woojo/OneDrive/Desktop/Movie/supabase/migrations/202608271200_add_score_based_movie_recommendations.sql:4), 시작 행 4.

```sql
create or replace function public.get_score_based_collaborative_recommendation_signals()
returns table (
  movie_id text,
  collaborative_score numeric,
  similar_user_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with rating_signals as (
    select
      history.user_id,
      history.movie_id,
      case
        when coalesce(history.raw_decision, history.status) = 'like'
          or history.rating >= 3 then 1
        when coalesce(history.raw_decision, history.status) in ('dislike', 'not_interested')
          or history.rating < 3 then -1
        else 0
      end as preference
    from public.rating_history as history
    where coalesce(history.raw_decision, history.status) <> 'not_seen'
  ),
  interest_signals as (
    select library.user_id, library.movie_id, 1 as preference
    from public.movie_library_items as library
  ),
  user_movie_signals as (
    select signals.user_id, signals.movie_id, max(signals.preference) as preference
    from (
      select * from rating_signals
      union all
      select * from interest_signals
    ) as signals
    where signals.preference <> 0
    group by signals.user_id, signals.movie_id
  ),
  current_user_signals as (
    select signal.movie_id, signal.preference
    from user_movie_signals as signal
    where signal.user_id = auth.uid()
  ),
  similar_users as (
    select
      neighbor.user_id,
      greatest(
        0,
        least(
          100,
          70 + sum(case when neighbor.preference = current.preference then 5 else -5 end)
        )
      )::numeric as similarity_score
    from user_movie_signals as neighbor
    join current_user_signals as current using (movie_id)
    where neighbor.user_id <> auth.uid()
    group by neighbor.user_id
  ),
  candidate_movies as (
    select
      neighbor.movie_id,
      least(
        100,
        avg(similar.similarity_score) + least((count(distinct neighbor.user_id) - 1) * 5, 20)
      )::numeric as collaborative_score,
      count(distinct neighbor.user_id) as similar_user_count
    from user_movie_signals as neighbor
    join similar_users as similar on similar.user_id = neighbor.user_id
    where neighbor.preference = 1
      and similar.similarity_score >= 70
      and not exists (
        select 1
        from user_movie_signals as current
        where current.user_id = auth.uid()
          and current.movie_id = neighbor.movie_id
      )
    group by neighbor.movie_id
  )
  select candidate.movie_id, candidate.collaborative_score, candidate.similar_user_count
  from candidate_movies as candidate
  where auth.uid() is not null
  order by candidate.collaborative_score desc, candidate.similar_user_count desc, candidate.movie_id
  limit 100;
$$;

revoke all on function public.get_score_based_collaborative_recommendation_signals() from public;
grant execute on function public.get_score_based_collaborative_recommendation_signals() to authenticated;
```

### D.7 SQL 연속 날짜 그룹 계산

원본: [supabase/migrations/202607271500_create_profiles_and_titles.sql](C:/Users/woojo/OneDrive/Desktop/Movie/supabase/migrations/202607271500_create_profiles_and_titles.sql:349), 시작 행 349.

```sql
create or replace function public.profile_daily_question_streaks(p_user_id uuid, p_timezone text)
returns table (current_streak integer, longest_streak integer)
language sql
security definer
set search_path = public
as $$
  with answer_dates as (
    select distinct (created_at at time zone public.profile_timezone(p_timezone))::date as answer_date
    from public.daily_question_answers
    where user_id = p_user_id
  ), grouped as (
    select answer_date, answer_date - row_number() over (order by answer_date)::integer as streak_group
    from answer_dates
  ), streaks as (
    select count(*)::integer as streak_length, max(answer_date) as last_date
    from grouped
    group by streak_group
  )
  select
    coalesce(max(streak_length) filter (where last_date = (now() at time zone public.profile_timezone(p_timezone))::date), 0)::integer,
    coalesce(max(streak_length), 0)::integer
  from streaks;
$$;
```
