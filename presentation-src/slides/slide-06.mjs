import { addBackground, addFooter, addHeader, palette } from "../shared.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  addBackground(slide, ctx, "yellow");
  addHeader(slide, ctx, "05 RISK", "디지털 시민의식이 약해질수록 갈등, 왜곡, 유출 위험은 커집니다.", "문제를 알면 예방도 더 쉬워집니다.");

  const riskData = [
    { title: "사이버폭력", desc: "익명성 뒤에 숨은 공격은 피해자의 일상과 자존감을 크게 흔듭니다.", color: palette.coral },
    { title: "가짜 정보", desc: "확인되지 않은 콘텐츠는 편견과 혼란을 빠르게 확산시킵니다.", color: palette.yellow },
    { title: "개인정보 유출", desc: "위치, 연락처, 사진 정보가 노출되면 사칭과 범죄로 이어질 수 있습니다.", color: palette.blue },
  ];

  riskData.forEach((item, index) => {
    const y = 250 + index * 110;
    ctx.addShape(slide, { x: 92, y: y + 14, width: 150 + index * 90, height: 26, geometry: "roundRect", fill: item.color });
    ctx.addText(slide, { x: 292, y, width: 180, height: 32, text: item.title, fontSize: 24, bold: true, color: palette.navy });
    ctx.addText(slide, { x: 472, y: y - 2, width: 620, height: 42, text: item.desc, fontSize: 18, color: palette.muted });
  });

  ctx.addText(slide, {
    x: 92, y: 602, width: 1040, height: 38,
    text: "예방 원칙: 멈추기 → 확인하기 → 기록하기 → 도움 요청하기",
    fontSize: 22, bold: true, color: palette.blue, align: "center"
  });

  addFooter(slide, ctx, 6);
  return slide;
}
