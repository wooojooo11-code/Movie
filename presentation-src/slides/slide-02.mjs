import { addBackground, addBulletList, addFooter, addHeader, addCard, palette } from "../shared.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "blue");
  addHeader(slide, ctx, "01 DEFINE", "디지털 시민의식은 온라인 인성과 참여 역량을 함께 뜻합니다.", "기술을 잘 쓰는 것만이 아니라, 바르게 쓰는 태도가 핵심입니다.");

  addBulletList(slide, ctx, [
    "온라인 공간에서도 현실과 같은 예절과 책임이 필요합니다.",
    "정보를 비판적으로 판단하고, 허위 정보에 흔들리지 않아야 합니다.",
    "개인정보와 보안을 스스로 지킬 줄 알아야 합니다."
  ], 84, 260, 520);

  addCard(slide, ctx, {
    x: 760, y: 248, width: 410, height: 230,
    title: "한 문장 정의",
    body: "디지털 시민의식은 디지털 환경에서 권리와 의무를 이해하고, 타인과 공동체를 존중하며, 안전하고 책임 있게 행동하는 시민의 태도입니다.",
    accent: palette.mint
  });

  addFooter(slide, ctx, 2);
  return slide;
}
