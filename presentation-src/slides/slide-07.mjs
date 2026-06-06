import { addBackground, addFooter, addHeader, addCard, palette } from "../shared.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "mint");
  addHeader(slide, ctx, "06 ACTION", "학교와 가정이 함께 기준을 세울 때 실천은 더 오래갑니다.", "개인 노력만으로는 한계가 있으므로 공동 규칙과 대화가 필요합니다.");

  addCard(slide, ctx, {
    x: 72, y: 270, width: 320, height: 260,
    title: "학생", body: "친절한 언어 사용\n출처 확인 후 공유\n피해 상황 기록과 신고", accent: palette.blue
  });
  addCard(slide, ctx, {
    x: 430, y: 270, width: 320, height: 260,
    title: "학교", body: "정기적인 디지털 윤리 교육\n학급 채팅 규칙 만들기\n사이버폭력 대응 체계 안내", accent: palette.mint
  });
  addCard(slide, ctx, {
    x: 788, y: 270, width: 320, height: 260,
    title: "가정", body: "대화 중심의 미디어 지도\n스크린 사용 습관 점검\n개인정보 보호 함께 실천", accent: palette.coral
  });

  addFooter(slide, ctx, 7);
  return slide;
}
