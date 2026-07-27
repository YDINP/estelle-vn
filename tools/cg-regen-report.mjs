#!/usr/bin/env node
/* cg-regen-report.mjs — 레퍼런스 미반영(구버전 외형) CG를 격리하고 재생성 목록을 만든다.
 *
 * 초기 CG는 ILLUST-SPEC.md의 구버전 텍스트를 앵커로 생성돼 인물이 게임 속 캐릭터와
 * 달랐다. 실제 캐릭터 아트를 레퍼런스로 넘기는 방식으로 재생성 중인데, Codex 사용량
 * 한도로 일부가 남았다. 남은 컷의 "틀린 그림"을 배포본에 두면 다른 사람이 나오므로
 * 격리하고(엔진의 .cg-missing 폴백이 플레이스홀더로 대체), 재생성 지시서를 남긴다.
 *
 *   node tools/cg-regen-report.mjs            # 목록만 (dry)
 *   node tools/cg-regen-report.mjs --apply    # 격리 실행 + 목록 파일 기록
 *
 * 판정 기준: `.tmp/gen/<route>__<file>.png` 이 있으면 레퍼런스 반영본, 없으면 구버전.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const QUAR = path.join(ROOT, "art-backup", "mismatched-cg");

/** 캐릭터 레지스트리 — cg-generate.mjs와 동일 규약 */
const CHARS = [
  { id: "lilia", ko: "릴리아", en: "Lilia", desc: "금발 반묶음(작은 꽃·리본)·파란 눈·세이지그린 오버드레스+크림 언더스커트(긴소매)·금 리본벨트 에메랄드" },
  { id: "marion", ko: "마리온", en: "Marion", desc: "와인빛 적발 롱웨이브·붉은 눈·진홍+검정 로코코 볼가운·검은 레이스 초커" },
  { id: "belfor", ko: "벨포르", en: "Belfor", desc: "갈색 숏컷·황금 눈·감청(네이비) 군복코트+은색 견장·검은 장갑/롱부츠" },
  { id: "belian", ko: "벨리안", en: "Belian", desc: "적발·앰버 눈·검정+금 자수 대형 케이프(모피 어깨)·붉은 선버스트 브로치" },
  { id: "lucienne", ko: "루시엔", en: "Lucienne", desc: "은백~라벤더 롱스트레이트(앞머리)·보라 눈·연보라 라일락 시폰 드레스" },
  { id: "livia", ko: "리비아", en: "Livia", desc: "갈색 롱웨이브(금색 별 장식)·황금 눈·짙은 녹색 오프숄더 귀족드레스" },
  { id: "reimon", ko: "레이먼", en: "Reimon", desc: "흑발 숏컷·파란 눈·전신 검정 깃털 대형망토+흑금 군복" },
  { id: "azael", ko: "아젤", en: "Azael", desc: "은발·황금 눈·흰금 십자문양 성기사 갑주+흑금 안감 케이프" },
  { id: "mephian", ko: "메피안", en: "Mephian", silhouette: true, desc: "얼굴 없는 검은 실루엣 노신사 (게임 정본 표현)" },
  { id: "fiance", ko: "약혼자", en: "fiance", silhouette: true, desc: "얼굴 없는 그림자 귀족 남성 (게임 정본 표현)" },
];

/** 구버전 텍스트 앵커와 실제 아트가 어긋났던 캐릭터.
 *  이 인물이 등장하는 미교정 컷은 "다른 사람"이 그려져 있으므로 격리한다.
 *  아젤만 구 앵커(은발·금안·흰금 성기사 갑주)가 실제 아트와 일치해 제외 — 육안 확인함. */
const MISMATCHED = new Set(["lilia", "marion", "belfor", "belian", "lucienne", "livia", "reimon"]);

const todo = JSON.parse(fs.readFileSync(path.join(ROOT, ".tmp", "cg-todo.json"), "utf8"));
const staged = (t) => fs.existsSync(path.join(ROOT, ".tmp", "gen", `${t.route}__${t.file}.png`));
const pending = todo.filter((t) => !staged(t));

function castOf(t) {
  const hay = `${t.cast ?? ""} ${t.prompt ?? ""} ${t.scene ?? ""}`;
  return CHARS.filter((c) => hay.includes(c.ko) || new RegExp(`\\b${c.en}\\b`, "i").test(hay));
}

console.log(`전체 ${todo.length}컷 · 레퍼런스 반영 ${todo.length - pending.length} · 구버전 잔여 ${pending.length}\n`);

// ── 격리: 어긋난 캐릭터가 등장하는 컷만 ──
const bad = (t) => castOf(t).some((c) => MISMATCHED.has(c.id));
const toQuar = pending.filter(bad);
const keep = pending.filter((t) => !bad(t));

let moved = 0, absent = 0;
for (const t of toQuar) {
  const src = path.join(ROOT, t.rel);
  if (!fs.existsSync(src)) { absent++; continue; }
  if (!APPLY) continue;
  fs.mkdirSync(QUAR, { recursive: true });
  fs.renameSync(src, path.join(QUAR, `${t.route}__${t.file}.webp`));
  moved++;
}
console.log(APPLY
  ? `격리 ${moved}개 → art-backup/mismatched-cg/ (없던 것 ${absent}) · 유지 ${keep.length}개`
  : `(dry) 격리 대상 ${toQuar.length - absent}개 · 유지 ${keep.length}개 (아젤 = 구 앵커가 실제 아트와 일치) · --apply 로 실행`);
if (keep.length) console.log(`  유지: ${keep.map((t) => t.id).join(" ")}`);

// ── 재생성 지시서 ──
const byRoute = {};
for (const t of pending) (byRoute[t.route] ??= []).push(t);

const lines = [];
lines.push("# CG 재생성 대기 목록 (레퍼런스 미반영분)", "");
lines.push("> 생성: `tools/cg-regen-report.mjs` · 기준일 2026-07-27");
lines.push(">");
lines.push("> 초기 CG는 `ILLUST-SPEC.md`의 **구버전 텍스트 서술**을 앵커로 생성돼 그림 속 인물이");
lines.push("> 게임 속 캐릭터와 달랐다. 아래 컷들은 아직 교정되지 않았고, 배포본에서는");
lines.push("> `art-backup/mismatched-cg/` 로 **격리**해 뒀다(엔진의 `.cg-missing` 폴백이 플레이스홀더 표시).");
lines.push(">");
lines.push("> ⚠️ **Codex 사용량 한도로 중단됨 — 리셋 2026-08-02.**");
lines.push("");
lines.push("## 재개 절차");
lines.push("```bash");
lines.push("node tools/cg-worklist.mjs --emit --all");
lines.push("node tools/cg-generate.mjs --route <id> --batch 2 --all   # 엔딩부터");
lines.push("node tools/cg-place.mjs --force");
lines.push("node .tmp/dupcheck.mjs        # 루트 간 중복 배치 점검");
lines.push("```");
lines.push("`cg-generate.mjs`가 아래 레퍼런스 파일을 codex image_gen에 자동으로 넘긴다 — 수동 지정 불필요.");
lines.push("");
lines.push("## 캐릭터 레퍼런스 정본");
lines.push("");
lines.push("| 캐릭터 | 레퍼런스 파일 | 외형 |");
lines.push("|---|---|---|");
for (const c of CHARS) {
  const f = c.silhouette ? "*(레퍼런스 미사용 — 실루엣 지시)*" : `\`public/char/${c.id}/soft.webp\``;
  lines.push(`| ${c.ko} (${c.id}) | ${f} | ${c.desc} |`);
}
lines.push("");
lines.push(`## 잔여 ${pending.length}컷 — 격리 ${toQuar.length} · 유지 ${keep.length}`);
lines.push("");
lines.push("- 🔴 **격리** — 어긋난 캐릭터가 등장해 `art-backup/mismatched-cg/` 로 옮겼다. 게임에선 플레이스홀더가 뜬다.");
lines.push("- 🟡 **유지** — 배포본에 그대로 있다. 아젤은 구 앵커가 실제 아트와 일치했고(육안 확인),");
lines.push("  `cg_lvp_bad`는 인물이 등장하지 않는 컷(텅 빈 별채)이다. 화풍 통일을 위해 재생성 대상에는 남겨 둔다.");
lines.push("");

const order = Object.keys(byRoute).sort((a, b) => byRoute[b].length - byRoute[a].length);
for (const r of order) {
  const list = byRoute[r];
  const endings = list.filter((t) => /_(good|bad|true)$/.test(t.id)).length;
  lines.push(`### ${r} — ${list.length}컷${endings ? ` (엔딩 ${endings})` : ""}`);
  lines.push("");
  lines.push("| id | 상태 | 파일 | 등장 캐릭터 → 레퍼런스 | 장면 |");
  lines.push("|---|---|---|---|---|");
  for (const t of list) {
    const cast = castOf(t);
    const refs = cast.length
      ? cast.map((c) => (c.silhouette ? `${c.ko}(실루엣)` : `${c.ko}=\`char/${c.id}/soft.webp\``)).join("<br>")
      : "*(인물 없음)*";
    // 장면 설명은 자르지 않는다 — 이 문서가 재생성 작업지시서라 뒤쪽 연출 지시가 곧 정보다
    const scene = (t.scene ?? t.title ?? "").replace(/\|/g, "/").replace(/\n/g, " ");
    const st = bad(t) ? "🔴 격리" : "🟡 유지";
    lines.push(`| \`${t.id}\` | ${st} | \`${t.char}/${t.file}.webp\` | ${refs} | ${scene} |`);
  }
  lines.push("");
}

const out = path.join(ROOT, "story", "CG-REGEN-TODO.md");
if (APPLY) {
  fs.writeFileSync(out, lines.join("\n"));
  fs.writeFileSync(path.join(ROOT, "story", "CG-REGEN-TODO.json"),
    JSON.stringify(pending.map((t) => ({ ...t, refs: castOf(t).filter((c) => !c.silhouette).map((c) => `public/char/${c.id}/soft.webp`) })), null, 2));
  console.log(`\n→ ${out}\n→ story/CG-REGEN-TODO.json`);
}

// 콘솔 요약
console.log("\n루트별 잔여:");
for (const r of order) {
  const list = byRoute[r];
  const e = list.filter((t) => /_(good|bad|true)$/.test(t.id)).length;
  console.log(`  ${r.padEnd(10)} ${String(list.length).padStart(2)}컷${e ? `  (엔딩 ${e})` : ""}  ${list.map((t) => t.id).join(" ")}`);
}
