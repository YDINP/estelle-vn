#!/usr/bin/env node
/* cg-generate.mjs — 남은/전체 CG를 codex image_gen으로 생성한다(에이전트 없이).
 *
 * ★ 캐릭터 외형은 텍스트가 아니라 **실제 캐릭터 일러(public/char/<id>/soft.webp)를
 *   레퍼런스 이미지로 넘겨** 맞춘다. codex image_gen은 워크스페이스 파일을 참조 입력으로
 *   받는다(검증 완료). 초기 생성분은 ILLUST-SPEC.md의 구버전 텍스트 서술을 앵커로 써서
 *   벨포르(갈발·감청군복→백금발·판금갑옷) 벨리안(적발→금발) 리비아(성인 녹색드레스→시골소녀)
 *   등이 전부 딴사람으로 나왔다. 그래서 매니페스트 프롬프트에 박힌 외형 형용구는
 *   레퍼런스와 충돌하지 않도록 역할명만 남기고 중립화한다.
 *
 * 서브에이전트를 통한 생성은 Anthropic API 과부하(529)에 취약해 중간에 죽는다.
 * codex는 OpenAI 경로라 그 영향을 받지 않으므로 직접 구동이 훨씬 안정적이다.
 *
 * 스테이징 파일명은 반드시 `<route>__<file>.png` — 루트 간 file명이 겹쳐
 * (seven_threads / the_seizure / sealed_gate / lost_script / three_hours)
 * 평면 네임스페이스에서 덮어쓰기 사고가 실제로 났다.
 *
 *   node tools/cg-generate.mjs --route azael [--batch 2] [--all] [--dry]
 *   --all : 이미 배치된 컷도 다시 생성(레퍼런스 반영 재생성용)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes("--" + n);
const ROUTE = arg("route");
const BATCH = parseInt(arg("batch", "2"), 10);
const DRY = has("dry");
const ALL = has("all");
const BASH = process.env.CLAUDE_CODE_GIT_BASH_PATH || "C:\\Program Files\\Git\\bin\\bash.exe";

/** 캐릭터 레지스트리 — 한국어명/영문 태그로 등장 인물을 탐지하고 레퍼런스 파일을 붙인다 */
const CHARS = [
  { id: "lilia",    ko: "릴리아", en: "Lilia" },
  { id: "marion",   ko: "마리온", en: "Marion" },
  { id: "belfor",   ko: "벨포르", en: "Belfor" },
  { id: "belian",   ko: "벨리안", en: "Belian" },
  { id: "lucienne", ko: "루시엔", en: "Lucienne" },
  { id: "livia",    ko: "리비아", en: "Livia" },
  { id: "reimon",   ko: "레이먼", en: "Reimon" },
  { id: "azael",    ko: "아젤",   en: "Azael" },
  // 메피안·약혼자는 게임에서 얼굴 없는 실루엣 엑스트라다(portrait이 통째로 검은 실루엣).
  // 레퍼런스로 넘기면 CG에 검은 형체만 찍히므로 제외하고, 대신 그림자 처리로 지시한다.
  { id: "mephian",  ko: "메피안", en: "Mephian", silhouette: true },
  { id: "fiance",   ko: "약혼자", en: "fiance",  silhouette: true },
];

/** 구버전 외형 형용구 → 역할명만 남긴다. 레퍼런스 이미지가 외형의 유일한 근거가 되도록. */
const SANITIZE = [
  [/platinum-blonde vice-captain/gi, "guard vice-captain"],
  [/blonde-blue duchess/gi, "duchess"],
  [/blonde duchess/gi, "duchess"],
  [/soft-smiling elderly chancellor/gi, "elderly chancellor"],
  [/blue-grey-haired northern commander/gi, "northern commander"],
  [/silver-ivory paladin-priest/gi, "paladin-priest"],
  [/golden-haired crown prince/gi, "crown prince"],
  [/wine-red-haired lady/gi, "noble lady"],
  [/shy brown-haired girl/gi, "young lady"],
  [/silver-white-haired marchioness/gi, "marchioness"],
];

const STYLE =
  "Korean romance-fantasy (romfan) otome visual-novel event CG, semi-realistic cel-shaded ANIME style, " +
  "soft painterly rendering, ornate rococo European fantasy, cinematic lighting, highly detailed background, 8k. " +
  "NEGATIVE: photorealistic, photograph, lowres, bad anatomy, deformed hands, extra fingers, watermark, " +
  "text, signature, modern clothing, chibi.";

const RULES =
  "CRITICAL: every image MUST be VERTICAL PORTRAIT orientation, aspect ratio 3:4 (like 1086x1448). " +
  "Never landscape, never square. " +
  "The viewer-character ('you') must NEVER show a face: render them only as a blurred hooded dark shape " +
  "from behind, or a hand/shoulder entering the frame — completely gender-ambiguous. " +
  "All-ages: no sexualization. Documents and letters must be illegible decorative script, no readable text.";

const todo = JSON.parse(fs.readFileSync(path.join(ROOT, ".tmp", "cg-todo.json"), "utf8"));
const pend = todo.filter((t) => (ALL || !fs.existsSync(path.join(ROOT, t.rel))) && (!ROUTE || t.route === ROUTE));

if (!pend.length) { console.log(`생성할 항목 없음${ROUTE ? ` (route=${ROUTE})` : ""}`); process.exit(0); }
console.log(`대상 ${pend.length}컷${ROUTE ? ` · route=${ROUTE}` : ""} · 배치 ${BATCH}${ALL ? " · 전량 재생성" : ""}`);

/** 그 컷에 등장하는 캐릭터(레퍼런스 파일이 실재하는 것만) */
function present(t) {
  const hay = `${t.cast ?? ""} ${t.prompt ?? ""} ${t.scene ?? ""}`;
  return CHARS.filter((c) => hay.includes(c.ko) || new RegExp(`\\b${c.en}\\b`, "i").test(hay));
}
function refsOf(t) {
  return present(t)
    .filter((c) => !c.silhouette)
    .map((c) => ({ ...c, file: `public/char/${c.id}/soft.webp` }))
    .filter((c) => fs.existsSync(path.join(ROOT, c.file)));
}
/** 실루엣 엑스트라 등장 시 붙일 지시 */
function silhouetteNote(t) {
  const s = present(t).filter((c) => c.silhouette);
  if (!s.length) return "";
  return ` IMPORTANT: ${s.map((c) => c.en).join(" and ")} must be drawn as a SHADOWED FACELESS figure ` +
    `(features lost in shadow, no readable face) — that is their canonical in-game depiction.`;
}
const clean = (p) => SANITIZE.reduce((s, [re, to]) => s.replace(re, to), p);

for (let i = 0; i < pend.length; i += BATCH) {
  const grp = pend.slice(i, i + BATCH);
  const need = grp.filter((t) => ALL || !fs.existsSync(path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`)));
  if (!need.length) { console.log(`  배치 ${i / BATCH + 1}: 이미 스테이징됨 — 건너뜀`); continue; }

  const blocks = need.map((t, n) => {
    const refs = refsOf(t);
    const refLine = refs.length
      ? `Reference images (open each and match that character's hair colour, eye colour, outfit design and colour scheme EXACTLY): ` +
        refs.map((r) => `${r.file} = ${r.en}`).join(" ; ")
      : "No character reference for this image.";
    return `Image ${n + 1} -> save to .tmp/gen/${t.route}__${t.file}.png\n  ${refLine}\n  Scene: ${clean(t.prompt)}${silhouetteNote(t)}`;
  }).join("\n\n");

  const prompt =
    `Use your built-in image_gen tool to generate ${need.length} image(s) (one image_gen call per image) ` +
    `and save each final PNG to the exact workspace path shown.\n\n` +
    `IMPORTANT — CHARACTER LIKENESS: for each image, the listed reference image files are the single source of ` +
    `truth for that character's appearance. Pass them to image_gen as reference/input images. If a character's ` +
    `appearance in the scene text ever conflicts with the reference file, THE REFERENCE FILE WINS. ` +
    `Keep hair colour, eye colour, hairstyle and costume design/colours identical to the reference.\n\n` +
    `SHARED STYLE: ${STYLE}\n\n${RULES}\n\n${blocks}\n\n` +
    `Do not ask questions. Generate all ${need.length} and save them to those exact paths, then stop.`;

  console.log(`\n▶ 배치 ${Math.floor(i / BATCH) + 1}: ${need.map((t) => `${t.id}[${refsOf(t).map((r) => r.id).join(",") || "-"}]`).join(" ")}`);
  if (DRY) { console.log(prompt.slice(0, 1200) + "…"); continue; }

  try {
    // Windows에서 codex는 Git Bash PATH의 셸 래퍼다 — cmd/execFileSync 직접 호출은 ENOENT.
    const pf = path.join(ROOT, ".tmp", `_cgprompt_${ROUTE ?? "all"}_${Math.floor(i / BATCH)}.txt`);
    fs.writeFileSync(pf, prompt, "utf8");
    const posix = (p) => p.replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`).replace(/\\/g, "/");
    execFileSync(
      BASH,
      ["-c", `cd "${posix(ROOT)}" && codex exec -s workspace-write --skip-git-repo-check -C "${posix(ROOT)}" "$(cat "${posix(pf)}")"`],
      { cwd: ROOT, timeout: 40 * 60 * 1000, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }
    );
  } catch (e) {
    console.log(`  ⚠ codex 실패/타임아웃: ${(e.message || "").split("\n")[0]}`);
  }
  const got = need.filter((t) => fs.existsSync(path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`)));
  console.log(`  → ${got.length}/${need.length} 도착`);
}

console.log("\n완료. `node tools/cg-place.mjs --force` 로 배치하라.");
