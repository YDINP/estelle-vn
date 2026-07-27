#!/usr/bin/env node
/* cg-generate.mjs — 남은 CG를 codex image_gen으로 직접 생성한다(에이전트 없이).
 *
 * 서브에이전트를 통한 생성은 Anthropic API 과부하(529)에 취약해 중간에 죽는다.
 * codex는 OpenAI 경로라 그 영향을 받지 않으므로, 작업지시서를 읽어 codex를 직접
 * 구동하는 편이 훨씬 안정적이다.
 *
 * 스테이징 파일명은 반드시 `<route>__<file>.png` — 루트 간 file명이 겹쳐
 * (seven_threads / the_seizure / sealed_gate / lost_script / three_hours)
 * 평면 네임스페이스에서 덮어쓰기 사고가 실제로 났다.
 *
 *   node tools/cg-generate.mjs --route azael [--batch 3] [--dry]
 *   node tools/cg-generate.mjs --all
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes("--" + n);
const ROUTE = arg("route");
const BASH = process.env.CLAUDE_CODE_GIT_BASH_PATH || "C:\\Program Files\\Git\\bin\\bash.exe";
const BATCH = parseInt(arg("batch", "3"), 10);
const DRY = has("dry");

const STYLE =
  "Korean romance-fantasy (romfan) otome visual-novel event CG, semi-realistic cel-shaded ANIME style, " +
  "soft painterly rendering, ornate rococo European fantasy, warm dark-brown/gold/rose color harmony, " +
  "cinematic lighting, highly detailed background, 8k. " +
  "NEGATIVE: photorealistic, photograph, lowres, bad anatomy, deformed hands, extra fingers, watermark, " +
  "text, signature, modern clothing, chibi.";

const RULES =
  "CRITICAL: every image MUST be VERTICAL PORTRAIT orientation, aspect ratio 3:4 (like 1086x1448). " +
  "Never landscape, never square. " +
  "The viewer-character ('you') must NEVER show a face: render them only as a blurred hooded dark shape " +
  "from behind, or a hand/shoulder entering the frame — completely gender-ambiguous. " +
  "All-ages: no sexualization. Documents and letters must be illegible decorative script, no readable text.";

const todo = JSON.parse(fs.readFileSync(path.join(ROOT, ".tmp", "cg-todo.json"), "utf8"));
const pend = todo.filter((t) => !fs.existsSync(path.join(ROOT, t.rel)) && (!ROUTE || t.route === ROUTE));

if (!pend.length) { console.log(`생성할 항목 없음${ROUTE ? ` (route=${ROUTE})` : ""}`); process.exit(0); }
console.log(`대상 ${pend.length}컷${ROUTE ? ` · route=${ROUTE}` : ""} · 배치크기 ${BATCH}`);

for (let i = 0; i < pend.length; i += BATCH) {
  const grp = pend.slice(i, i + BATCH);
  // 이미 스테이징에 도착한 건 건너뛴다(재실행 시 중복 생성 방지)
  const need = grp.filter((t) => !fs.existsSync(path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`)));
  if (!need.length) { console.log(`  배치 ${i / BATCH + 1}: 이미 스테이징됨 — 건너뜀`); continue; }

  const lines = need
    .map((t, n) => `Image ${n + 1} -> save to .tmp/gen/${t.route}__${t.file}.png : ${t.prompt}`)
    .join("\n");
  const prompt =
    `Use your built-in image_gen tool to generate ${need.length} image(s) (one image_gen call per image) ` +
    `and save each final PNG to the exact workspace path shown.\n\n` +
    `SHARED STYLE (apply to every image): ${STYLE}\n\n${RULES}\n\n${lines}\n\n` +
    `Do not ask questions. Generate all ${need.length} and save them to those exact paths, then stop.`;

  console.log(`\n▶ 배치 ${Math.floor(i / BATCH) + 1}: ${need.map((t) => t.id).join(", ")}`);
  if (DRY) { console.log(prompt.slice(0, 600) + "…"); continue; }

  try {
    // Windows에서 codex는 Git Bash PATH의 셸 래퍼다 — cmd/execFileSync 직접 호출은 ENOENT.
    // 검증된 형태는 "bash에서 프롬프트를 인자로 넘기는 것". 프롬프트에 따옴표·개행이 많아
    // 파일에 써 두고 "$(cat …)" 로 전개한다(POSIX 경로 필요).
    const pf = path.join(ROOT, ".tmp", `_cgprompt_${Math.floor(i / BATCH)}.txt`);
    fs.writeFileSync(pf, prompt, "utf8");
    const posix = (p) => p.replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`).replace(/\\/g, "/");
    execFileSync(
      BASH,
      ["-c", `cd "${posix(ROOT)}" && codex exec -s workspace-write --skip-git-repo-check -C "${posix(ROOT)}" "$(cat "${posix(pf)}")"`],
      { cwd: ROOT, timeout: 30 * 60 * 1000, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }
    );
  } catch (e) {
    console.log(`  ⚠ codex 실패/타임아웃: ${(e.message || "").split("\n")[0]}`);
  }
  const got = need.filter((t) => fs.existsSync(path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`)));
  console.log(`  → ${got.length}/${need.length} 도착`);
}

console.log("\n완료. `node tools/cg-place.mjs` 로 배치하라.");
