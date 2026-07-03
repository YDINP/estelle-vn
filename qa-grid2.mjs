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
  // 행 프로파일: y=12, x 0~340
  const rowVals = [];
  for (let xx = 0; xx < 340; xx += 1) rowVals.push(Math.round(v(xx,12)));
  // 톤 전환 (다크<244<라이트)
  const trans = [];
  let prev = rowVals[6] >= 244;
  for (let xx = 7; xx < 340; xx++) {
    const cur = rowVals[xx] >= 244;
    if (cur !== prev) { trans.push(xx); prev = cur; }
  }
  const transY = [];
  let prevY = v(12,6) >= 244;
  for (let y = 7; y < 340; y++) {
    const cur = v(12,y) >= 244;
    if (cur !== prevY) { transY.push(y); prevY = cur; }
  }
  return { rowHead: rowVals.slice(0, 40).join(","), trans, transY };
}, "data:image/png;base64," + data);
console.log(JSON.stringify(r, null, 1));
await b.close();
