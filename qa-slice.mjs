import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
const sheets = [
  ["C:/Users/a/Desktop/1/005/ChatGPT Image 2026년 7월 3일 오후 06_22_09.png", "s1"],
  ["C:/Users/a/Desktop/1/005/ChatGPT Image 2026년 7월 3일 오후 06_28_11.png", "s2"],
];
const b = await chromium.launch();
const p = await b.newPage();
for (const [path, tag] of sheets) {
  const data = readFileSync(path).toString("base64");
  const cells = await p.evaluate(async (src) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = src; });
    const W = img.width, H = img.height, cw = W/4, ch = H/2;
    const out = [];
    for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) {
      const c = document.createElement("canvas");
      const inset = 10; // 셀 구분선 회피
      c.width = cw - inset*2; c.height = ch - inset*2;
      const x = c.getContext("2d");
      x.drawImage(img, col*cw + inset, row*ch + inset, c.width, c.height, 0, 0, c.width, c.height);
      // 알파 트림
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
      for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) {
        if (d[(y*c.width+xx)*4+3] > 20) {
          if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
      const pad = 4;
      minX = Math.max(0, minX-pad); minY = Math.max(0, minY-pad);
      maxX = Math.min(c.width-1, maxX+pad); maxY = Math.min(c.height-1, maxY+pad);
      const t = document.createElement("canvas");
      t.width = maxX-minX+1; t.height = maxY-minY+1;
      t.getContext("2d").drawImage(c, minX, minY, t.width, t.height, 0, 0, t.width, t.height);
      out.push({ url: t.toDataURL("image/png"), w: t.width, h: t.height });
    }
    return out;
  }, "data:image/png;base64," + data);
  cells.forEach((cell, i) => {
    writeFileSync(`.tmp-lucian/${tag}c${i+1}.png`, Buffer.from(cell.url.split(",")[1], "base64"));
    console.log(`${tag}c${i+1}: ${cell.w}x${cell.h}`);
  });
}
// 검수용 라벨 몽타주
const names = [];
for (const t of ["s1","s2"]) for (let i = 1; i <= 8; i++) names.push(`${t}c${i}`);
const imgs = names.map(n => ({ n, s: "data:image/png;base64," + readFileSync(`.tmp-lucian/${n}.png`).toString("base64") }));
await p.setViewportSize({ width: 1600, height: 800 });
await p.setContent(`<body style="margin:0;background:#26130a;display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:8px">
  ${imgs.map(({n,s}) => `<div style="text-align:center;color:#f3dfa4;font:12px sans-serif">${n}<br><img src="${s}" style="width:100%"></div>`).join("")}
</body>`);
await p.waitForTimeout(700);
await p.screenshot({ path: "qa-shots/lucian-cells.png", fullPage: true });
await b.close();
console.log("montage ok");
