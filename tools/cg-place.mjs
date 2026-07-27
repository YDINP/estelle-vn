#!/usr/bin/env node
/* cg-place.mjs — `.tmp/gen/`에 도착한 CG PNG를 작업지시서(.tmp/cg-todo.json)에 따라
 * WebP로 변환해 `public/cg/{char}/`에 배치한다.
 *
 * 여러 생성 에이전트가 codex 세션을 병렬로 돌리는 동안, 산출물 수거를 한 곳에서
 * 멱등적으로 처리하기 위한 스위퍼다. 몇 번을 돌려도 이미 배치된 컷은 건너뛴다.
 *
 *   node tools/cg-place.mjs           # 도착분 배치
 *   node tools/cg-place.mjs --dry     # 무엇이 배치될지만 표시
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const Q = 0.86;

const todo = JSON.parse(fs.readFileSync(path.join(ROOT, ".tmp", "cg-todo.json"), "utf8"));

/** 둘 이상의 루트가 쓰는 file명 — 평면 스테이징에서 서로를 덮어쓴다 */
const SHARED_FILES = (() => {
  const seen = new Map();
  const dup = new Set();
  // 전체 매니페스트 기준(이미 배치된 것 포함)으로 판정해야 한다
  for (const m of fs.readdirSync(path.join(ROOT, "story")).filter((f) => /^cg-manifest-.+\.json$/.test(f))) {
    const route = m.replace(/^cg-manifest-|\.json$/g, "");
    for (const it of JSON.parse(fs.readFileSync(path.join(ROOT, "story", m), "utf8"))) {
      const prev = seen.get(it.file);
      if (prev && prev !== route) dup.add(it.file);
      seen.set(it.file, route);
    }
  }
  return dup;
})();

const pending = [];
for (const t of todo) {
  const dst = path.join(ROOT, t.rel);
  // --force: 레퍼런스 반영 재생성분으로 기존 배치본을 덮어쓴다
  if (!FORCE && fs.existsSync(dst)) continue;             // 이미 배치됨
  // 스테이징은 루트별 네임스페이스를 우선한다.
  // `.tmp/gen/<file>.png` 평면 이름은 루트 간 충돌한다 — seven_threads/the_seizure/
  // sealed_gate/lost_script/three_hours 처럼 여러 루트가 같은 file명을 쓰기 때문에,
  // 나중 생성물이 앞 것을 덮어써 엉뚱한 그림이 배치되는 사고가 실제로 발생했다.
  // 평면 이름 폴백은 그 file명을 오직 한 루트만 쓸 때에만 허용한다.
  // 공유 file명(seven_threads 등)에 폴백을 허용하면 다른 루트의 그림을 집어와 배치한다 —
  // livia/the_seizure 에 marion 그림이 들어간 사고가 실제로 이 경로로 발생했다.
  const cand = [path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`)];
  if (!SHARED_FILES.has(t.file)) cand.push(path.join(ROOT, ".tmp", "gen", `${t.file}.png`));
  const src = cand.find((c) => fs.existsSync(c));
  if (!src) continue;                                     // 아직 생성 안 됨
  pending.push({ ...t, src, dst });
}

const waiting = todo.filter((t) => !fs.existsSync(path.join(ROOT, t.rel))).length;
console.log(`작업지시 ${todo.length}컷 · 미배치 ${waiting} · 이번에 배치 가능 ${pending.length}`);

if (!pending.length || DRY) {
  for (const p of pending) console.log(`  (dry) ${p.file} → ${p.rel}`);
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const p of pending) {
  try {
    const buf = fs.readFileSync(p.src);
    const url = await page.evaluate(
      async ({ dataUrl, Q }) => {
        const img = new Image();
        img.src = dataUrl;
        await img.decode();
        const cv = document.createElement("canvas");
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        cv.getContext("2d").drawImage(img, 0, 0);
        return cv.toDataURL("image/webp", Q);
      },
      { dataUrl: `data:image/png;base64,${buf.toString("base64")}`, Q }
    );
    fs.mkdirSync(path.dirname(p.dst), { recursive: true });
    const out = Buffer.from(url.split(",")[1], "base64");
    fs.writeFileSync(p.dst, out);
    console.log(`✓ ${p.id.padEnd(12)} ${p.rel}  ${Math.round(out.length / 1024)}KB`);
  } catch (e) {
    console.log(`✗ ${p.id}: ${e.message.split("\n")[0]}`);
  }
}

await browser.close();
