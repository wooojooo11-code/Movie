# Movie

## KOBIS 일별 박스오피스

홈의 인기 영화는 배포 환경에서 KOBIS 일별 박스오피스 API를 호출합니다. KOBIS에서 발급한 API 키를 Netlify 환경 변수 `KOBIS_API_KEY`에 설정하세요. 이 키는 `netlify/functions/kobis-boxoffice.mjs`에서만 사용되며 브라우저 번들에는 포함되지 않습니다.

KOBIS는 일간 집계 데이터를 제공하므로 화면에는 최신 완료 일자의 순위가 표시됩니다. 키가 없거나 API 요청이 실패하면 기존 연간 순위를 안전하게 유지합니다.
