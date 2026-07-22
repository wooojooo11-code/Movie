# Movie 리팩토링·최적화 감사

> 점검일: 2026-07-23  
> 범위: Vue/Pinia/Supabase/PWA 애플리케이션의 소스 구조, 저장소, 번들, 테스트, 배포 설정 및 Git 관리 상태  
> 원칙: 이 문서는 진단 결과이며, 기존 기능과 진행 중인 변경은 수정하지 않았다.

## 결론

가장 먼저 다룰 항목은 **원격 저장의 전체 삭제 후 재삽입 방식**이다. 네트워크 오류나 여러 기기 동시 사용 시 원격 데이터가 비어 있거나 마지막 저장이 다른 변경을 덮어쓸 수 있다. 그 다음은 **첫 화면 번들(2.08 MB, gzip 577 KB)**, **5초 단위 인증 폴링**, **산출물·`node_modules` 추적** 순서다.

전체를 한 번에 재작성하지 말고, 데이터 안전성 → 초기 로딩 → 유지보수성 → 테스트 체계 순으로 나누어 진행하는 것이 안전하다.

## 점검 스냅샷

| 항목 | 확인 결과 | 의미 |
| --- | --- | --- |
| 애플리케이션 소스 | Vue 35개, TypeScript 34개, CSS 1개 | 화면/도메인 코드가 서비스 계층에 많이 집중되어 있다. |
| 가장 큰 데이터 파일 | `src/data/catalog.ts` 49,773줄 / 1.80 MB | 정적 카탈로그가 초기 로딩 비용의 핵심이다. |
| 가장 큰 로직 파일 | `recommendationStore.ts` 1,200줄, `RatingView.vue` 961줄, `listStore.ts` 778줄 | 한 파일에 상태·정규화·저장·표현 책임이 섞여 있다. |
| 현재 생산 번들 | JS 2,075,675 bytes / gzip 576,857 bytes | 모바일 네트워크에서 최초 진입이 무거울 수 있다. |
| 라우팅 | 모든 View를 정적 import, dynamic import 없음 | 경로를 바꿔도 화면 코드가 첫 번들에 함께 들어간다. |
| 원격 저장 | 목록·보관함이 전체 delete 후 insert | 원자성 및 동시성 위험이 있다. |
| Git 추적 | `node_modules`, `dist`, 개발 로그가 추적됨 (총 12,933개 build/dependency 관련 경로) | 설치·빌드마다 불필요한 diff와 충돌이 발생한다. |
| 품질 자동화 | `typecheck`, 상황 추천용 단일 Node 회귀 스크립트만 존재; lint/formatter/test runner/CI 없음 | 변경 범위가 넓어질수록 회귀를 잡기 어렵다. |

## 우선순위 백로그

| 우선순위 | 항목 | 근거 | 권장 변경 | 기대 효과 |
| --- | --- | --- | --- | --- |
| P0 | 목록·보관함 원격 저장을 차등 upsert/delete로 교체 | `listRepository.ts`의 `save()`는 사용자 목록과 상호작용을 모두 삭제한 뒤 삽입하고, `libraryRepository.ts`도 보관함 전체를 삭제 후 삽입한다. | 변경·삭제된 ID만 전송한다. 여러 테이블을 함께 바꿔야 하면 Supabase RPC/DB 함수로 트랜잭션 처리한다. `updated_at` 또는 revision을 이용해 충돌을 감지한다. | 중간 실패 시 원격 데이터 공백 방지, 쓰기량 감소, 다기기 덮어쓰기 완화 |
| P1 | 초기 번들 분리와 카탈로그 지연 로딩 | `router/index.ts`의 모든 View가 정적 import이고, `main.ts → auth.ts → 3개 도메인 store → catalog.ts` 경로도 초기 import된다. | 라우트 View를 lazy import로 전환하고, 인증 후 필요한 도메인 store만 동적 import한다. 카탈로그/크레딧은 기능별 chunk 또는 검색용 경량 인덱스 + 상세 데이터로 분리한다. | 첫 화면 전송량과 파싱 시간 감소, 모바일 체감 개선 |
| P1 | 인증 동기화 폴링 축소 | `stores/auth.ts`가 포커스·스토리지·입력 이벤트와 함께 5초 간격으로 `syncSession({ force: true })`를 실행하고, 로그인 상태에서는 평가 수까지 다시 조회한다. | Supabase auth 이벤트를 기준으로 하고 `visibilitychange`/`online` 재개 시에만 보조 동기화한다. 평가 수는 평가 저장 직후 로컬 반영하거나 수 분 단위로 제한한다. | 불필요한 요청, 배터리·DB 사용량, 경쟁 상태 감소 |
| P1 | 저장소 초기화가 앱 마운트를 막지 않도록 변경 | `main.ts`는 `authStore.initialize()`가 끝난 뒤에 mount하고, 그 과정에서 recommendation/list/library 원격 로드를 순차 대기한다. | 앱을 먼저 mount하고 인증·도메인 hydration은 로딩 상태와 함께 백그라운드로 실행한다. 요청 timeout·취소·사용자 변경 방지도 추가한다. | 느린 네트워크/일시 장애에서 빈 화면 대기 방지 |
| P1 | Git 산출물 정리 | `.gitignore`는 `.env.local` 한 줄뿐이며 `dist`, `node_modules`, 여러 로그가 추적되고 있다. 현재도 빌드 산출물과 tsbuildinfo가 변경 상태다. | `.gitignore`에 `node_modules/`, `dist/`, `dev-dist/`, `*.log`, `*.tsbuildinfo` 등을 추가하고, 추적 해제는 별도 정리 커밋으로 한다. 배포는 CI/Netlify가 build하도록 유지한다. | 깨끗한 작업 트리, 작은 저장소, 재현 가능한 빌드 |
| P1 | 의존성 보안 업데이트 | `npm audit --omit=dev`에서 high 1건: `@supabase/realtime-js → ws@8.20.0`의 DoS 취약점. | 먼저 `@supabase/supabase-js`를 안전 버전으로 업데이트하고 audit을 재실행한다. 해결되지 않으면 검증 후 `ws` override를 보안 수정 버전으로 고정한다. | 알려진 취약 의존성 제거 |
| P2 | Supabase 타입을 `any` 없이 모델링 | 세 repository에 `getSupabase…Relation() as any`가 20회 이상 있다. 스키마/컬럼 변경이 컴파일 단계에서 잡히지 않는다. | Supabase Database 타입을 생성하고 관계별 typed client를 반환한다. row ↔ domain mapper는 별도 파일로 둔다. | 스키마 드리프트 조기 탐지, 캐스팅·런타임 오류 감소 |
| P2 | 저장소/원격 큐 공통화 | `library`, `list`, `recommendation`에 local JSON 저장·오류 추출·직렬 원격 저장 큐가 각각 복제되어 있다. | `createLocalSnapshotRepository`, `createSerializedSyncQueue`, `RemoteSyncState` 같은 작은 공용 유틸로 추출한다. 도메인별 mapper만 남긴다. | 버그 수정 한 곳 적용, 파일 크기 감소, 동작 일관성 확보 |
| P2 | LocalStorage 스키마 버전·검증 도입 | 세 repository가 `JSON.parse(raw) as …`로 역직렬화한다. recommendation만 일부 정규화하고 list/library는 구조 검증이 약하다. | snapshot에 `version`을 넣고, type guard 또는 schema validator로 읽은 값을 검증·마이그레이션한다. 손상 데이터는 사용자 데이터 삭제 대신 안전한 기본값과 복구 안내를 사용한다. | 오래된/손상된 저장 데이터로 인한 런타임 오류 감소 |
| P2 | DB 인덱스를 실제 조회 패턴에 맞춤 | ratings/rating history/library/user lists는 `user_id` 필터 뒤 날짜 정렬을 수행하지만 단일 컬럼 인덱스가 중심이다. | `(user_id, answered_at DESC)`, `(user_id, saved_at DESC)`, `(user_id, updated_at DESC)` 복합 인덱스를 새 migration으로 추가한다. EXPLAIN ANALYZE로 확인한다. | 사용자 데이터 증가 시 목록 로딩 안정화 |
| P2 | 큰 화면·store를 역할별로 분리 | `RatingView.vue`와 `recommendationStore.ts`에 화면 상태, 흐름 전환, 저장, 정규화가 공존한다. | `useRatingFlow`, `useRatingResume`, `ratingPersistence`, `ratingSelectors` composable/서비스로 분리하고 View는 조합과 표현만 맡긴다. `listStore`도 draft/search/sync로 분리한다. | 기능 수정 시 영향 범위 축소, 단위 테스트 가능 |
| P2 | 테스트와 코드 규칙 자동화 | 현재 상황 추천 회귀 스크립트는 유용하지만 단일 Node 파일이며, lint/format/컴포넌트·저장소 테스트가 없다. | ESLint + Prettier, Vitest(도메인/저장소), Playwright(로그인·평가·목록 핵심 흐름)를 추가한다. `lint`, `test`, `test:e2e`, `build`를 CI에서 실행한다. | 리팩토링 후 회귀 방지와 리뷰 비용 절감 |
| P3 | 추천 저장도 전체 교체 범위를 축소 | `recommendationRepository.ts`는 제외 목록을 전부 삭제 후 재삽입하며, schema-호환 fallback 로직도 한 파일에 밀집돼 있다. | 제외 목록은 set diff로 처리하고, schema capability/cache와 SQL mapper를 별도 모듈로 옮긴다. | 요청량·복잡도·재시도 위험 감소 |
| P3 | 전역 singleton store의 경계 재정리 | Pinia는 auth에만 쓰이고 나머지는 module-level `reactive` singleton이다. | 즉시 전면 전환하지 말고 새 기능부터 Pinia 또는 일관된 composable 패턴 하나로 정한다. | DI·테스트·SSR/다중 앱 확장성 개선 |
| P3 | PWA 갱신 UX 정리 | 서비스 워커가 갱신 발견 시 즉시 활성화한다. 입력 중 화면이 갱신되는 경험이 생길 수 있다. | 새 버전 알림 후 사용자가 갱신하도록 하거나, 안전한 화면 전환 시점에 적용한다. | 작성 중 데이터 손실 인상 방지 |

## 권장 실행 순서

### 1. 데이터 안전성 (가장 먼저)

1. `listRepository`와 `libraryRepository`에 대해 현재 snapshot 전체 저장을 변경 집합 기반 저장으로 바꾼다.
2. 두 테이블 이상을 함께 변경하는 목록 저장은 RPC로 묶어 원자성을 보장한다.
3. 동시에 다른 기기에서 변경했을 때의 정책(마지막 수정 우선, 충돌 알림, 혹은 병합)을 명확히 정한다.
4. 이 단계의 테스트를 먼저 작성한다: 추가, 수정, 삭제, 삽입 실패, 두 기기 동시 변경.

### 2. 체감 성능

1. 앱 mount와 auth/domain hydration을 분리하고 로딩 화면을 제공한다.
2. 5초 polling을 제거하고 인증 이벤트·재개 이벤트 중심으로 줄인다.
3. 라우트 lazy loading을 적용한다.
4. 그 뒤 카탈로그를 분할한다. **라우트만 lazy로 바꾸면 auth가 store를 정적으로 불러와 카탈로그가 여전히 초기 번들에 남을 수 있으므로, `auth.ts`의 도메인 store import 경로도 함께 끊어야 한다.**
5. Lighthouse/실제 저사양 휴대폰에서 초기 JS, LCP, interaction을 다시 측정한다.

### 3. 구조 정리

1. Supabase 타입 생성과 repository mapper 분리.
2. 반복되는 local persistence 및 remote queue 유틸 추출.
3. `recommendationStore`와 `RatingView`를 흐름/선택자/표현 단위로 분리.
4. LocalStorage snapshot version/migration 도입.

### 4. 품질 게이트

1. ESLint/Prettier와 `lint` 스크립트를 추가한다.
2. 현재 `test:situations`를 Vitest 테스트로 옮기고 평가, 목록, 보관함 저장소 테스트를 더한다.
3. 로그인 → 평가 → 추천 → 목록/보관함의 최소 E2E 경로를 자동화한다.
4. `typecheck`, `lint`, `test`, `build`를 PR/배포 전 필수로 둔다.

## 파일별 우선 작업표

| 파일 | 역할 | 다음 리팩토링 |
| --- | --- | --- |
| `src/services/listRepository.ts` | 사용자 목록/상호작용 원격 저장 | 전체 delete/insert 제거, typed relation, 원자적 저장 |
| `src/services/libraryRepository.ts` | 보관함 원격 저장 | ID 단위 upsert/delete, 복합 인덱스와 함께 검증 |
| `src/services/recommendationRepository.ts` | 평가·제외·상황 저장 | capability fallback, mapper, 제외 목록 diff로 분리 |
| `src/stores/auth.ts` | 세션·도메인 초기화 | 5초 polling 제거, hydration 병렬/백그라운드화 |
| `src/main.ts` | 부트스트랩 | auth 초기화 대기 후 mount하는 흐름 분리 |
| `src/router/index.ts` | 화면 전달 | route-level dynamic import |
| `src/services/recommendationStore.ts` | 추천 상태/저장/선택자 | domain state, persistence, selector, rating flow로 분할 |
| `src/views/RatingView.vue` | 평가 UI 흐름 | 컨테이너 역할만 남기고 단계별 composable/표현 컴포넌트로 분리 |
| `src/data/catalog.ts`, `src/data/movieCredits.ts` | 대용량 정적 데이터 | 필요 시점 로딩과 검색 인덱스 분리 |
| `.gitignore`, `README.md`, `package.json` | 운영·개발 기준 | build 산출물 제외, 실행/검증 절차 문서화, lint/test 스크립트 추가 |

## 검증 기록

| 검증 | 결과 | 비고 |
| --- | --- | --- |
| `vue-tsc --noEmit` | 통과 | 임시 tsbuildinfo 경로를 사용해 작업 트리를 변경하지 않았다. |
| `npm.cmd run test:situations` | 통과 | 상황별 추천 규칙 회귀 스크립트가 통과했다. |
| `git diff --check` | 통과 | 기존 진행 중 변경에서 공백 오류는 발견되지 않았다. |
| `npm.cmd audit --omit=dev` | high 1건 | `@supabase/realtime-js`가 사용하는 `ws@8.20.0` 취약점이다. |
| production build | 이번 점검에서는 미실행 | `dist`와 tsbuildinfo가 이미 추적·변경 중이어서 사용자의 산출물을 덮어쓰지 않기 위해 읽기 전용 점검만 수행했다. |

## 작업 시 주의점

- 현재 작업 트리에 `src/data/home.ts`, `src/services/situationRecommendation.ts`, `scripts/test-situation-recommendations.mjs` 등 사용자의 진행 중 변경이 있다. 이 감사와 분리해 보존한다.
- `dist`를 Git에서 제거하는 작업은 배포 방식에 영향을 줄 수 있으므로 `.gitignore` 추가와 `git rm --cached`를 별도 커밋으로 분리한다.
- remote save 변경은 UI부터 바꾸지 말고 repository 계약과 migration/RPC, 테스트를 먼저 확정한다.
- PWA와 캐시 변경 뒤에는 새 배포본뿐 아니라 이미 설치된 앱의 업데이트/복구 경로도 확인한다.
