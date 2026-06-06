import { addBackground, addFooter, addHeader, addCard, palette } from "../shared.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "yellow");
  addHeader(slide, ctx, "02 WHY", "디지털 시민의식은 안전한 학교생활과 건강한 관계를 지켜 줍니다.", "온라인 행동 하나가 실제 인간관계, 학습 분위기, 개인 안전으로 이어집니다.");

  const cards = [
    ["관계 보호", "댓글, 채팅, SNS에서의 말 한마디가 친구 관계와 학교 분위기에 큰 영향을 줍니다.", palette.blue],
    ["학습 보호", "과제 표절, 허위 정보 공유, 무분별한 AI 사용은 배움의 질을 떨어뜨릴 수 있습니다.", palette.mint],
    ["자기 보호", "개인정보 유출, 피싱, 사이버폭력 같은 위험을 예방하는 힘이 됩니다.", palette.coral],
  ];
  cards.forEach(([title, body, accent], i) => {
    addCard(slide, ctx, {
      x: 72 + i * 380,
      y: 280,
      width: 340,
      height: 250,
      title,
      body,
      accent,
    });
  });

  ctx.addText(slide, {
    x: 72, y: 570, width: 1120, height: 44,
    text: "핵심 메시지: 디지털 시민의식은 '온라인 예절'을 넘어서 나와 공동체를 지키는 생활 역량입니다.",
    fontSize: 20, bold: true, color: palette.navy
  });

  addFooter(slide, ctx, 3);
  return slide;
}
