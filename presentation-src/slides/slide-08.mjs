import { addBackground, addFooter, palette } from "../shared.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "blue");

  ctx.addText(slide, {
    x: 120, y: 138, width: 1040, height: 90,
    text: "좋은 디지털 시민은\n좋은 세상을 온라인에서도 만듭니다.",
    fontSize: 42, bold: true, color: palette.navy, face: ctx.fonts.title, align: "center"
  });
  ctx.addText(slide, {
    x: 250, y: 290, width: 780, height: 100,
    text: "존중하고, 확인하고, 보호하고, 책임지기.\n이 네 가지 실천이 건강한 디지털 공동체의 시작입니다.",
    fontSize: 24, color: palette.muted, align: "center"
  });
  ctx.addShape(slide, {
    x: 330, y: 430, width: 620, height: 120,
    geometry: "roundRect",
    fill: palette.white,
    line: ctx.line(palette.line, 1),
  });
  ctx.addText(slide, {
    x: 370, y: 462, width: 540, height: 46,
    text: "“나는 온라인에서도 배려와 책임을 실천하는 시민이 되겠습니다.”",
    fontSize: 24, bold: true, color: palette.blue, align: "center"
  });

  addFooter(slide, ctx, 8);
  return slide;
}
