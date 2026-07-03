import { chromium } from "playwright";
import { readFileSync } from "fs";
const b = await chromium.launch();
const p = await b.newPage();
const data = readFileSync(".tmp-lucian/s1c1.png").toString("base64");
const r = await p.evaluate(async (src) => {
  const img = new Image();
  await new Promise(r => { img.onload = r; img.src = src; });
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  // 좌상단 40x40 색 빈도
  const freq = {};
  for (let y = 0; y < 60; y++) for (let xx = 0; xx < 60; xx++) {
    const i = (y*img.width+xx)*4;
    const k = `${d[i]},${d[i+1]},${d[i+2]},${d[i+3]}`;
    freq[k] = (freq[k]||0)+1;
  }
  const top = Object.entries(freq).sort((a,b2)=>b2[1]-a[1]).slice(0,8);
  // 체커 주기 확인: y=0 행에서 색 전환 위치
  const row = [];
  let prev = "";
  for (let xx = 0; xx < 80; xx++) {
    const i = xx*4;
    const k = `${d[i]},${d[i+1]},${d[i+2]}`;
    if (k !== prev) { row.push(xx + ":" + k); prev = k; }
  }
  return { top, row: row.slice(0, 10) };
}, "data:image/png;base64," + data);
console.log(JSON.stringify(r, null, 1));
await b.close();
