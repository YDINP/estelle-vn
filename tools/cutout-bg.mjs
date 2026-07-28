#!/usr/bin/env node
/* cutout-bg.mjs — 캐릭터 시트의 흰 배경을 제거하고(알파화) 선택적으로 크롭한다.
 *
 * codex image_gen은 투명 배경을 내지 못해 흰 배경으로 나온다. 그런데 CSS
 * `filter: brightness(0)` 로 실루엣을 만들려면 배경이 반드시 투명해야 한다 —
 * 불투명 흰 배경이면 검은 사각형이 되어 버린다.
 *
 * ⚠️ 단순 흰색 키잉은 안 된다. 메피안은 머리·수염이 흰색이라 같이 지워진다.
 *    그래서 **테두리에서 시작하는 flood fill**로 '바깥의 연결된 흰 영역'만 지운다.
 *    인물 내부의 흰색(머리·칼라)은 선화에 막혀 도달하지 않는다.
 *
 *   node tools/cutout-bg.mjs --in a.webp --out b.webp [--tol 232] [--crop 0,0,1,0.48]
 *   --crop x,y,w,h : 원본 대비 비율 크롭(제거 후 적용)
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const IN = arg("in"), OUT = arg("out");
const TOL = parseInt(arg("tol", "232"), 10);
const CROP = arg("crop") ? arg("crop").split(",").map(Number) : null;
if (!IN || !OUT) { console.error("usage: --in <img> --out <webp> [--tol 232] [--crop x,y,w,h]"); process.exit(2); }

const browser = await chromium.launch();
const page = await browser.newPage();
const buf = fs.readFileSync(IN);

const res = await page.evaluate(async ({ dataUrl, TOL, CROP }) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const im = ctx.getImageData(0, 0, W, H);
  const d = im.data;

  const near = (i) => d[i] >= TOL && d[i + 1] >= TOL && d[i + 2] >= TOL;
  const seen = new Uint8Array(W * H);
  const stack = [];
  // 테두리 픽셀을 시드로
  for (let x = 0; x < W; x++) { stack.push(x, 0); stack.push(x, H - 1); }
  for (let y = 0; y < H; y++) { stack.push(0, y); stack.push(W - 1, y); }

  let cleared = 0;
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const p = y * W + x;
    if (seen[p]) continue;
    const i = p * 4;
    if (!near(i)) continue;      // 인물 경계(선화)에서 멈춘다
    seen[p] = 1;
    d[i + 3] = 0;                 // 투명화
    cleared++;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // 경계 1px 부드럽게 — 투명 이웃이 있는 반투명 가장자리의 알파를 낮춰 계단 완화
  const copy = new Uint8ClampedArray(d);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const p = y * W + x, i = p * 4;
    if (copy[i + 3] === 0) continue;
    let clear = 0;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]])
      if (copy[((y + dy) * W + (x + dx)) * 4 + 3] === 0) clear++;
    if (clear && near(i)) d[i + 3] = Math.max(0, 255 - clear * 90);
  }
  ctx.putImageData(im, 0, 0);

  let out = cv;
  if (CROP) {
    const [cx, cy, cw, ch] = CROP;
    const c2 = document.createElement("canvas");
    c2.width = Math.round(W * cw); c2.height = Math.round(H * ch);
    c2.getContext("2d").drawImage(cv, Math.round(W * cx), Math.round(H * cy), c2.width, c2.height, 0, 0, c2.width, c2.height);
    out = c2;
  }
  // 투명 여백 트림
  const octx = out.getContext("2d", { willReadFrequently: true });
  const od = octx.getImageData(0, 0, out.width, out.height).data;
  let minX = out.width, minY = out.height, maxX = 0, maxY = 0;
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++)
    if (od[(y * out.width + x) * 4 + 3] > 8) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  const tw = Math.max(1, maxX - minX + 1), th = Math.max(1, maxY - minY + 1);
  const c3 = document.createElement("canvas");
  c3.width = tw; c3.height = th;
  c3.getContext("2d").drawImage(out, minX, minY, tw, th, 0, 0, tw, th);

  const dd = c3.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, tw, th).data;
  let tr = 0;
  for (let i = 3; i < dd.length; i += 4) if (dd[i] < 16) tr++;
  return { url: c3.toDataURL("image/webp", 0.92), w: tw, h: th, cleared, transparent: (tr / (tw * th) * 100).toFixed(1) };
}, { dataUrl: `data:image/webp;base64,${buf.toString("base64")}`, TOL, CROP });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const out = Buffer.from(res.url.split(",")[1], "base64");
fs.writeFileSync(OUT, out);
console.log(`✓ ${OUT}  ${res.w}x${res.h}  투명 ${res.transparent}%  ${Math.round(out.length / 1024)}KB`);
await browser.close();
