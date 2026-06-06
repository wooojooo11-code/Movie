export const palette = {
  navy: "#12355B",
  blue: "#3C91E6",
  mint: "#61D2B4",
  yellow: "#FFD166",
  coral: "#FF7F6A",
  paper: "#F7F4EC",
  white: "#FFFFFF",
  text: "#183153",
  muted: "#5B6B83",
  line: "#D7E2F1",
};

export function addBackground(slide, ctx, accent = "blue") {
  const accentFill = accent === "mint" ? palette.mint : accent === "yellow" ? palette.yellow : palette.blue;
  ctx.addShape(slide, { x: 0, y: 0, width: ctx.W, height: ctx.H, fill: palette.paper });
  ctx.addShape(slide, { x: -120, y: -140, width: 360, height: 360, geometry: "ellipse", fill: `${accentFill}22` });
  ctx.addShape(slide, { x: ctx.W - 300, y: 520, width: 260, height: 260, geometry: "ellipse", fill: `${palette.coral}1E` });
  ctx.addShape(slide, { x: ctx.W - 240, y: -90, width: 280, height: 220, geometry: "ellipse", fill: `${palette.yellow}24` });
}

export function addHeader(slide, ctx, kicker, title, subtitle) {
  ctx.addShape(slide, {
    x: 72,
    y: 58,
    width: 14,
    height: 14,
    geometry: "ellipse",
    fill: palette.mint,
    name: "kicker-marker",
  });
  ctx.addText(slide, {
    x: 94,
    y: 50,
    width: 250,
    height: 28,
    text: kicker,
    fontSize: 15,
    bold: true,
    color: palette.blue,
    face: ctx.fonts.body,
    name: "kicker-label",
  });
  ctx.addText(slide, {
    x: 72,
    y: 92,
    width: 820,
    height: 84,
    text: title,
    fontSize: 30,
    bold: true,
    color: palette.navy,
    face: ctx.fonts.title,
  });
  if (subtitle) {
    ctx.addText(slide, {
      x: 72,
      y: 176,
      width: 820,
      height: 46,
      text: subtitle,
      fontSize: 18,
      color: palette.muted,
      face: ctx.fonts.body,
    });
  }
}

export function addFooter(slide, ctx, page) {
  ctx.addText(slide, {
    x: 72,
    y: 684,
    width: 240,
    height: 20,
    text: "Digital Citizenship",
    fontSize: 10,
    color: palette.muted,
  });
  ctx.addText(slide, {
    x: 1180,
    y: 684,
    width: 40,
    height: 20,
    text: String(page),
    fontSize: 10,
    color: palette.muted,
    align: "right",
  });
}

export function addBulletList(slide, ctx, items, x, y, width, gap = 52) {
  items.forEach((item, index) => {
    const top = y + index * gap;
    ctx.addShape(slide, { x, y: top + 8, width: 12, height: 12, geometry: "ellipse", fill: palette.blue });
    ctx.addText(slide, {
      x: x + 24,
      y: top,
      width,
      height: 38,
      text: item,
      fontSize: 22,
      color: palette.text,
      face: ctx.fonts.body,
    });
  });
}

export function addCard(slide, ctx, { x, y, width, height, title, body, fill = palette.white, accent = palette.blue }) {
  ctx.addShape(slide, {
    x,
    y,
    width,
    height,
    geometry: "roundRect",
    fill,
    line: ctx.line(palette.line, 1),
  });
  ctx.addShape(slide, {
    x: x + 20,
    y: y + 20,
    width: 36,
    height: 6,
    geometry: "roundRect",
    fill: accent,
  });
  ctx.addText(slide, {
    x: x + 20,
    y: y + 38,
    width: width - 40,
    height: 36,
    text: title,
    fontSize: 22,
    bold: true,
    color: palette.navy,
  });
  ctx.addText(slide, {
    x: x + 20,
    y: y + 82,
    width: width - 40,
    height: height - 98,
    text: body,
    fontSize: 16,
    color: palette.muted,
  });
}
