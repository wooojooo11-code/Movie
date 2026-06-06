import { addBackground, addFooter, addHeader, addCard, palette } from "../shared.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "mint");
  addHeader(slide, ctx, "03 CORE", "좋은 디지털 시민은 존중, 책임, 참여, 보안을 균형 있게 실천합니다.", "네 가지 요소가 함께 작동할 때 건강한 디지털 문화가 만들어집니다.");

  const items = [
    ["존중", "상대의 의견과 감정을 배려하고, 혐오 표현이나 악성 댓글을 멀리합니다.", 72, 260, palette.blue],
    ["책임", "내가 올린 글과 사진, 링크의 결과를 생각하고 저작권을 지킵니다.", 382, 260, palette.yellow],
    ["참여", "유익한 정보를 나누고, 문제 상황에서 방관하지 않고 도움을 줍니다.", 692, 260, palette.mint],
    ["보안", "강한 비밀번호, 2단계 인증, 개인정보 관리로 스스로를 보호합니다.", 1002, 260, palette.coral],
  ];
  items.forEach(([title, body, x, y, accent]) => {
    addCard(slide, ctx, { x, y, width: 240, height: 270, title, body, accent });
  });

  addFooter(slide, ctx, 4);
  return slide;
}
