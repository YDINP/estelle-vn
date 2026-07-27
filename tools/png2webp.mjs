#!/usr/bin/env node
/* png2webp.mjs — 생성된 CG PNG를 프로젝트 배포 규격(WebP)으로 변환한다.
 *
 * codex image_gen 출력이 이미 1086x1448(3:4)이라 리사이즈는 기본적으로 불필요하고,
 * PNG(~2.6MB) → WebP(~200KB)로 줄이는 것이 목적이다. 배포 용량이 10배 이상 차이난다.
 * 이미 설치된 playwright(chromium)만 사용 — sharp/magick 등 추가 의존성 없음.
 *
 *   node tools/png2webp.mjs --in .tmp/gen/a.png --out public/cg/lilia/a.webp
 *   node tools/png2webp.mjs --dir .tmp/gen --outdir public/cg/lilia
 *   옵션: --w 1086 --h 1448 (지정 시 cover 크롭) --q 0.86
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const arg = (n, d) => {
  const i = process.argv.indexOf("--" + n);
  if (i < 0) return d;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
};

const inFile = arg("in");
const outFile = arg("out");
const inDir = arg("dir");
const outDir = arg("outdir");
const Q = parseFloat(arg("q", "0.86"));
// 크기 미지정 = 원본 유지(생성물이 이미 규격이라 재샘플링 손실을 피한다)
const W = arg("w") ? parseInt(arg("w"), 10) : 0;
const H = arg("h") ? parseInt(arg("h"), 10) : 0;

/** 변환 대상 [입력, 출력] 쌍 목록 */
const jobs = [];
if (inFile && outFile) {
  jobs.push([inFile, outFile]);
} else if (inDir && outDir) {
  for (const f of fs.readdirSync(inDir).filter((f) => /\.(png|jpe?g)$/i.test(f)))
    jobs.push([path.join(inDir, f), path.join(outDir, f.replace(/\.(png|jpe?g)$/i, ".webp"))]);
} else {
  console.error("usage: --in <png> --out <webp>  |  --dir <srcdir> --outdir <dstdir>  [--w --h --q]");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
let ok = 0;

for (const [src, dst] of jobs) {
  const buf = fs.readFileSync(src);
  const dataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  const result = await page.evaluate(
    async ({ dataUrl, W, H, Q }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      // 크기 미지정이면 원본 그대로, 지정하면 종횡비 유지 cover 중앙크롭
      const tw = W || img.naturalWidth;
      const th = H || img.naturalHeight;
      const cv = document.createElement("canvas");
      cv.width = tw;
      cv.height = th;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      const scale = Math.max(tw / img.naturalWidth, th / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (tw - dw) / 2, (th - dh) / 2, dw, dh);
      return { url: cv.toDataURL("image/webp", Q), w: tw, h: th };
    },
    { dataUrl, W, H, Q }
  );
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const out = Buffer.from(result.url.split(",")[1], "base64");
  fs.writeFileSync(dst, out);
  const pct = Math.round((1 - out.length / buf.length) * 100);
  console.log(`✓ ${path.basename(dst)}  ${result.w}x${result.h}  ${Math.round(buf.length / 1024)}KB → ${Math.round(out.length / 1024)}KB (-${pct}%)`);
  ok++;
}

await browser.close();
console.log(`\n${ok}/${jobs.length} 변환 완료`);
