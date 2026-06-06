import { addBackground, addFooter, addHeader, addCard, palette } from "../shared.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "blue");
  addHeader(slide, ctx, "04 PRACTICE", "작은 습관이 모이면 디지털 시민의식은 일상이 됩니다.", "지금 바로 실천할 수 있는 행동 기준입니다.");

  const left = [
    "댓글을 달기 전, 상대가 상처받지 않을지 한 번 더 생각하기",
    "출처를 확인한 뒤 공유하기",
    "사진이나 영상을 올릴 때 타인의 동의 구하기",
  ];
  const right = [
    "비밀번호를 주기적으로 바꾸고 중복 사용 줄이기",
    "사이버폭력을 보면 캡처 후 신고하고 도움 요청하기",
    "AI 도구를 사용할 때는 사실 확인과 자기 생각 덧붙이기",
  ];

  addCard(slide, ctx, {
    x: 72, y: 250, width: 520, height: 330,
    title: "말과 정보", body: left.map((v, i) => `${i + 1}. ${v}`).join("\n\n"), accent: palette.blue
  });
  addCard(slide, ctx, {
    x: 640, y: 250, width: 520, height: 330,
    title: "보안과 대응", body: right.map((v, i) => `${i + 1}. ${v}`).join("\n\n"), accent: palette.mint
  });

  addFooter(slide, ctx, 5);
  return slide;
}
