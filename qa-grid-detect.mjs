import { chromium } from "playwright";
import { readFileSync } from "fs";
const b = await chromium.launch();
const p = await b.newPage();
const data = readFileSync("C:/Users/a/Desktop/1/005/ChatGPT Image 2026년 7월 3일 오후 06_22_09.png").toString("base64");
const r = await p.evaluate(async (src) => {
  const img = new Image();
  await new Promise(r => { img.onload = r; img.src = src; });
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const W = img.width;
  const v = (xx,y) => { const i=(y*W+xx)*4; return (d[i]+d[i+1]+d[i+2])/3; };
  // y=2 행에서 톤 전환 x 좌표들 (밝기 244 기준 교차)
  const trans = [];
  let prev = v(0,2) >= 244;
  for (let xx = 1; xx < 200; xx++) {
    const cur = v(xx,2) >= 244;
    if (cur !== prev) { trans.push(xx); prev = cur; }
  }
  // 세로 방향도
  const transY = [];
  prev = v(2,0) >= 244;
  for (let y = 1; y < 200; y++) {
    const cur = v(2,y) >= 244;
    if (cur !== prev) { transY.push(y); prev = cur; }
  }
  return { W: img.width, H: img.height, trans, transY,
    corner: [[0,0],[1,1],[8,8],[20,20],[30,30]].map(([a,bb]) => `${a},${bb}=${v(a,bb).toFixed(0)}`) };
}, "data:image/png;base64," + data);
console.log(JSON.stringify(r, null, 1));
await b.close();
