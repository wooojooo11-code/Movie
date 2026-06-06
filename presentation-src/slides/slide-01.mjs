import { addBackground, addFooter, palette } from "../shared.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "mint");

  ctx.addShape(slide, {
    x: 72,
    y: 92,
    width: 170,
    height: 36,
    geometry: "roundRect",
    fill: palette.white,
    line: ctx.line(palette.line, 1),
  });
  ctx.addText(slide, {
    x: 90,
    y: 100,
    width: 150,
    height: 22,
    text: "MEDIA ETHICS",
    fontSize: 14,
    bold: true,
    color: palette.blue,
  });
  ctx.addText(slide, {
    x: 72,
    y: 170,
    width: 640,
    height: 170,
    text: "디지털 시민의식",
    fontSize: 56,
    bold: true,
    color: palette.navy,
    face: ctx.fonts.title,
  });
  ctx.addText(slide, {
    x: 72,
    y: 320,
    width: 660,
    height: 90,
    text: "온라인에서도 서로를 존중하고,\n책임 있게 참여하는 태도",
    fontSize: 24,
    color: palette.muted,
  });

  ctx.addShape(slide, {
    x: 790,
    y: 134,
    width: 370,
    height: 410,
    geometry: "roundRect",
    fill: palette.white,
    line: ctx.line(palette.line, 1),
  });
  ctx.addShape(slide, { x: 844, y: 188, width: 110, height: 110, geometry: "ellipse", fill: `${palette.blue}28` });
  ctx.addShape(slide, { x: 930, y: 226, width: 110, height: 110, geometry: "ellipse", fill: `${palette.mint}3A` });
  ctx.addShape(slide, { x: 882, y: 302, width: 110, height: 110, geometry: "ellipse", fill: `${palette.yellow}42` });
  ctx.addText(slide, {
    x: 860,
    y: 454,
    width: 220,
    height: 40,
    text: "Respect\nResponsibility",
    fontSize: 24,
    bold: true,
    color: palette.navy,
    align: "center",
  });

  addFooter(slide, ctx, 1);
  return slide;
}
