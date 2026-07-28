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

/** 캐릭터 레지스트리 — 한국어명/영문 태그로 등장 인물을 탐지하고 레퍼런스 파일을 붙인다.
 *  `act` = 성격이 자세·표정·거리감으로 드러나는 방식(연기 지시). 레퍼런스는 '누구인가'만
 *  고정하므로, 포즈와 표정을 새로 그릴 때 이 지시가 인물을 그 사람답게 만든다.
 *  근거: STORY-BIBLE §3 목소리 가이드 · dialogue.ts VOICES · PRD-story-overhaul 7대죄 매핑 */
const CHARS = [
  { id: "lilia", ko: "릴리아", en: "Lilia",
    act: "a duchess of restraint and quiet dignity: spine straight, gestures small and careful, " +
         "grief swallowed rather than spilled — sorrow lives in the eyes while the posture stays composed. " +
         "The more she feels, the stiller she becomes." },
  { id: "marion", ko: "마리온", en: "Marion",
    act: "the calculating 'red rose': studied, theatrical elegance; often half-hides her face behind a fan, " +
         "teacup or turned shoulder; her smile never reaches her eyes. Only when the mask drops does the " +
         "posture collapse into something raw and young." },
  { id: "belfor", ko: "벨포르", en: "Belfor",
    act: "a commoner-born guard officer bound by discipline: parade-stiff bearing, hand resting on the sword " +
         "hilt but never drawing it; the conflict between orders and conscience shows only in the eyes and " +
         "in a jaw held too tight." },
  { id: "belian", ko: "벨리안", en: "Belian",
    act: "an arrogant crown prince who devours factions: languid, sprawling confidence — leaning on a throne " +
         "arm or balustrade, chin tilted to look down at others, a dangerous smile with a blade behind it." },
  { id: "lucienne", ko: "루시엔", en: "Lucienne",
    act: "the flawless 'white lily' ruled by perfectionism: immaculate vertical posture, every fingertip " +
         "controlled, absolute symmetry. In moments of collapse exactly ONE thing is out of place — a single " +
         "loose strand, a tilted shoulder — and that lone flaw carries the whole emotion." },
  { id: "livia", ko: "리비아", en: "Livia",
    act: "a shadow-raised natural daughter: half-shielded by a doorframe, pillar or her own shoulder, " +
         "looking up at others from a lowered angle, hands gripping her skirt; her whole body angles " +
         "cautiously toward the light she was never allowed to stand in." },
  { id: "reimon", ko: "레이먼", en: "Reimon",
    act: "a taciturn northern commander: near-motionless, commands a whole hall with one small gesture, " +
         "minimal facial change. His feeling is expressed by stillness and the length of a silence, " +
         "never by an outburst." },
  { id: "azael", ko: "아젤", en: "Azael",
    act: "a foreign paladin-priest of formal courtesy with a suppressed hunger: measured liturgical gestures, " +
         "hand to chest, eyes lowered — but his gaze rests one beat too long on what tempts him." },
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
  "The character and the environment are painted as ONE image in ONE style — same line weight, same finish, " +
  "same level of detail, unified palette. " +
  "NEGATIVE: photorealistic, photograph, lowres, bad anatomy, deformed hands, extra fingers, watermark, " +
  "text, signature, modern clothing, chibi, " +
  // 레퍼런스를 그대로 붙여 넣은 듯한 결과를 막는 항목들
  "cut-out character, pasted-in figure, sticker collage, character floating over background, " +
  "flat studio lighting on the character, white studio backdrop, T-pose, A-pose, " +
  "character drawn in a different style from the background, mismatched lighting.";

const RULES =
  "CRITICAL: every image MUST be VERTICAL PORTRAIT orientation, aspect ratio 3:4 (like 1086x1448). " +
  "Never landscape, never square. " +
  "The viewer-character ('you') must NEVER show a face: render them only as a blurred hooded dark shape " +
  "from behind, or a hand/shoulder entering the frame — completely gender-ambiguous. " +
  "All-ages: no sexualization. Documents and letters must be illegible decorative script, no readable text.";

/** --chars a,b,c : 그 캐릭터가 등장하는 컷만 (루트 무관). 예: 여성 4인 일괄 재생성 */
const CHARSEL = (arg("chars") || "").split(",").map((s) => s.trim()).filter(Boolean);

const todo = JSON.parse(fs.readFileSync(path.join(ROOT, ".tmp", "cg-todo.json"), "utf8"));
const pend = todo.filter((t) =>
  (ALL || !fs.existsSync(path.join(ROOT, t.rel))) &&
  (!ROUTE || t.route === ROUTE) &&
  (!CHARSEL.length || present(t).some((c) => CHARSEL.includes(c.id)))
);

/** --limit N : 앞에서 N컷만 (프롬프트 전략 바꾼 뒤 파일럿 검증용) */
const LIMIT = parseInt(arg("limit", "0"), 10);
if (LIMIT > 0) pend.length = Math.min(pend.length, LIMIT);

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
      ? `Identity references (face, hair, eye colour, costume design/colours only — pose and framing come from the scene): ` +
        refs.map((r) => `${r.file} = ${r.en}`).join(" ; ")
      : "No character reference for this image.";
    // 성격 지시 — 포즈·표정을 새로 그릴 때 인물이 '그 사람답게' 나오도록
    const acts = refs.filter((r) => r.act).map((r) => `    · ${r.en}: ${r.act}`).join("\n");
    const actLine = acts ? `\n  Acting direction (personality must show in posture, expression and distance):\n${acts}` : "";
    return `Image ${n + 1} -> save to .tmp/gen/${t.route}__${t.file}.png\n  ${refLine}${actLine}\n  Scene: ${clean(t.prompt)}${silhouetteNote(t)}`;
  }).join("\n\n");

  // ⚠️ 레퍼런스를 "동일하게 유지"로만 지시하면 캐릭터 시트의 서 있는 포즈·정면 구도·
  //    평면 조명이 그대로 딸려 와, 인물이 배경 위에 붙여 넣은 스티커처럼 보인다.
  //    레퍼런스는 '누구인가'만 고정하고, '어떻게 그려지는가'는 장면이 정하도록 분리한다.
  const LIKENESS =
    `CHARACTER LIKENESS — READ CAREFULLY.\n` +
    `The reference files are neutral full-body character sheets standing on a plain backdrop.\n` +
    `USE THEM ONLY to fix WHO the character is: facial features, hair colour and hairstyle, eye colour, ` +
    `and the design and colour scheme of their outfit. On those points the reference always wins over the scene text.\n` +
    `DO NOT copy from the reference: its standing pose, its frontal framing, its neutral expression, ` +
    `or its plain backdrop. Never paste, trace or collage the reference figure into the scene.\n` +
    `Instead RE-DRAW the character from scratch inside the scene:\n` +
    `  - a new pose, gesture and facial expression that this specific moment calls for;\n` +
    `  - a camera angle, crop and distance chosen to tell the scene (close-up, over-the-shoulder, ` +
    `low or high angle, partial figure) — not a full-body studio shot;\n` +
    `  - lit by the SAME light sources as the background: matching direction, colour temperature and ` +
    `intensity, with contact shadows, light wrap and ambient occlusion where figure meets environment;\n` +
    `  - matching the background's colour grading, atmosphere (haze, dust, rain, smoke) and depth of field.\n` +
    `The result must read as one painting, not a character standing in front of a picture.`;

  const prompt =
    `Use your built-in image_gen tool to generate ${need.length} image(s) (one image_gen call per image) ` +
    `and save each final PNG to the exact workspace path shown. ` +
    `Pass the listed reference files to image_gen as reference/input images.\n\n` +
    `${LIKENESS}\n\nSHARED STYLE: ${STYLE}\n\n${RULES}\n\n${blocks}\n\n` +
    `Do not ask questions. Generate all ${need.length} and save them to those exact paths, then stop.`;

  console.log(`\n▶ 배치 ${Math.floor(i / BATCH) + 1}: ${need.map((t) => `${t.id}[${refsOf(t).map((r) => r.id).join(",") || "-"}]`).join(" ")}`);
  if (DRY) {
    // 프롬프트가 길어 콘솔로는 확인이 안 된다 — 전문을 파일로 떨궈 검수한다
    const p = path.join(ROOT, ".tmp", `_dryprompt_${Math.floor(i / BATCH)}.txt`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, prompt, "utf8");
    console.log(`  (dry) 전문 → ${path.relative(ROOT, p)}`);
    continue;
  }

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
