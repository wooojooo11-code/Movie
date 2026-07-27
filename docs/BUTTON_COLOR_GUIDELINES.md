# 기본 버튼 색상

앱의 기본 버튼 색상은 `보고싶어요` 버튼의 보관 전 상태를 기준으로 한다.

- 색상 토큰: `app-accent`
- HEX: `#5f8fc2`
- 기본 버튼 클래스: `button-primary`

새로운 일반 동작 버튼(등록, 저장, 시작, 확인 등)은 `button-primary`를 사용한다. 이 클래스는 `border-app-accent bg-app-accent !text-white`를 제공하므로 버튼의 테두리, 배경, 글자색을 동일한 기준으로 유지한다.

```html
<button type="button" class="focus-ring corner-soft button-primary px-4 py-2">
  버튼 문구
</button>
```

비활성, 선택됨/보관됨, 경고·삭제, 보조 동작처럼 상태나 의미를 구분해야 하는 버튼은 해당 상태색을 별도로 유지한다.
