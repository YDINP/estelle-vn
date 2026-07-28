#!/usr/bin/env node
/* cast-audit.mjs — 등장인물별 아트 보유 현황 감사.
 *
 * "누가 나오는가"는 세 군데에 흩어져 있다:
 *   ① characters.ts 레지스트리 (초상 슬롯이 있는 인물)
 *   ② 실제 파일 public/char/<id>/*.webp
 *   ③ 프로즈에 이름만 나오는 인물 (발화자가 아니라 초상 자체가 없음)
 * 셋을 대조해 "초상이 없는 조연"을 드러낸다.
 *
 *   node tools/cast-audit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES = ["lilia", "marion", "belfor", "belian", "lucienne", "livia", "reimon", "azael"];

async function load(entrySrc, name) {
  const entry = path.join(ROOT, ".tmp", `_cast_${name}.ts`);
  fs.mkdirSync(path.dirname(entry), { recursive: true });
  fs.writeFileSync(entry, entrySrc);
  const out = path.join(ROOT, ".tmp", `_cast_${name}.mjs`);
  await esbuild.build({
    entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "silent",
    // characters.ts가 Vite 전역(import.meta.env.BASE_URL)을 참조한다 — node에는 없으므로 주입
    define: { "import.meta.env.BASE_URL": '"/"', "import.meta.env": "{}" },
  });
  return import(pathToFileURL(out).href + "?t=" + fs.statSync(out).mtimeMs);
}

// ① 레지스트리
// CHARACTERS는 Record<CharacterId, Character> — 배열로 정규화
const charsRec = (await load(`export { CHARACTERS } from "../src/data/characters";`, "chars")).CHARACTERS;
const chars = Object.entries(charsRec).map(([id, c]) => ({ ...c, id: c.id ?? id }));

// ② 루트 데이터 — 실제 발화자 집계
const imports = ROUTES.map((id) => `import { ${id.toUpperCase()}_EPISODES } from "../src/data/${id}_route";`).join("\n");
const exports = ROUTES.map((id) => `  ${id}: ${id.toUpperCase()}_EPISODES,`).join("\n");
const eps = (await load(`${imports}\nexport const ALL = {\n${exports}\n};`, "eps")).ALL;

const spoke = new Map();     // charId → 발화 수
function walk(steps) {
  for (const s of steps ?? []) {
    if (s.kind === "line" && s.line.speaker !== "narration")
      spoke.set(s.line.speaker, (spoke.get(s.line.speaker) ?? 0) + 1);
    if (s.kind === "choice")
      for (const o of s.choice.options ?? [])
        for (const l of o.result ?? [])
          if (l.speaker !== "narration") spoke.set(l.speaker, (spoke.get(l.speaker) ?? 0) + 1);
  }
}
for (const list of Object.values(eps))
  for (const ep of list) { walk(ep.steps); if (ep.gate) { walk(ep.gate.pass); walk(ep.gate.fail); walk(ep.gate.trueSteps); } }

// 전 루트 프로즈 원문 (③ 이름만 나오는 인물 탐지용)
const prose = ROUTES.map((r) => fs.readFileSync(path.join(ROOT, "src/data", `${r}_route.ts`), "utf8")).join("\n");

console.log("\n════ ① 초상 슬롯이 있는 인물 (characters.ts) ════\n");
console.log("id".padEnd(10) + "이름".padEnd(8) + "구분".padEnd(8) + "선언표정".padEnd(6) + "실제파일".padEnd(8) + "발화수");
console.log("─".repeat(60));
const missingArt = [];
for (const c of chars) {
  const dir = path.join(ROOT, "public", "char", c.id);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).length : 0;
  const kind = c.extra ? "조연(실루엣)" : "메인";
  const n = spoke.get(c.id) ?? 0;
  console.log(
    c.id.padEnd(10) + String(c.name).padEnd(7) + kind.padEnd(9) +
    String(c.body?.length ?? 0).padStart(4) + "   " + String(files).padStart(5) + "     " + String(n).padStart(5)
  );
  if ((c.body?.length ?? 0) > files) missingArt.push(`${c.id}: 선언 ${c.body.length} > 파일 ${files}`);
}
if (missingArt.length) { console.log("\n⚠ 선언 대비 파일 부족:"); for (const m of missingArt) console.log("  " + m); }

// 레지스트리에 없는데 발화한 경우(타입상 불가하지만 안전망)
const known = new Set(chars.map((c) => c.id));
const ghost = [...spoke.keys()].filter((k) => !known.has(k));
if (ghost.length) console.log("\n⚠ 레지스트리에 없는 발화자: " + ghost.join(", "));

// ③ 프로즈에만 이름이 나오는 조연 — 역할 명사 기반 탐지
console.log("\n════ ③ 프로즈에만 등장하는 인물 (초상 없음) ════\n");
const ROLE = [
  "집사", "공작", "후작", "백작", "재상", "시종장", "주교", "황제", "황후", "단장", "부단장",
  "기사단장", "사제", "수도원장", "검인관", "서기", "하녀", "마부", "심부름꾼", "정보상",
  "노신하", "약혼자", "대공", "황태자", "사절",
];
const found = new Map();
for (const role of ROLE) {
  // 한글 이름 2~4자가 역할 앞에 붙는 형태(예: "오르넬 백작") + 역할 단독 언급 수
  const named = [...prose.matchAll(new RegExp(`([가-힣]{2,4})\\s*${role}`, "g"))].map((m) => m[1]);
  const total = (prose.match(new RegExp(role, "g")) ?? []).length;
  if (!total) continue;
  const uniq = [...new Set(named)].filter((n) => !["그리고", "그러나", "하지만", "이번", "지난", "다른", "모든", "어떤", "자신", "우리", "당신"].includes(n));
  found.set(role, { total, names: uniq });
}
const rows = [...found.entries()].sort((a, b) => b[1].total - a[1].total);
console.log("역할".padEnd(12) + "언급수".padEnd(8) + "앞에 붙은 이름 후보");
console.log("─".repeat(70));
for (const [role, v] of rows)
  console.log(role.padEnd(11) + String(v.total).padStart(5) + "     " + (v.names.slice(0, 6).join(", ") || "—"));

// 고유명사 후보 — 따옴표 안에서 호명되는 2~4자 한글 + 조사
console.log("\n════ 프로즈에 반복 등장하는 고유명 후보 (상위 20) ════\n");
const stop = new Set(["당신", "그녀", "그들", "우리", "저는", "제가", "이번", "다음", "마지막", "사람", "이름", "그것", "여기", "거기", "지금", "오늘", "내일", "어제", "하나", "모두", "자신", "이제", "그저", "다시", "정말", "아직", "언제", "누구", "무엇", "어디", "이제야", "그날", "그때", "한번", "번째", "얼굴", "목소", "손끝", "눈빛", "표정", "문장", "대본", "봉랍", "명령", "증언", "기록", "왕관", "공작저", "연회장"]);
const mains = new Set(chars.map((c) => c.name));
const freq = new Map();
for (const m of prose.matchAll(/([가-힣]{2,4})(?:은|는|이|가|을|를|의|에게|와|과|도)\s/g)) {
  const w = m[1];
  if (stop.has(w) || mains.has(w)) continue;
  freq.set(w, (freq.get(w) ?? 0) + 1);
}
const top = [...freq.entries()].filter(([, n]) => n >= 8).sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [w, n] of top) console.log(`  ${w.padEnd(6)} ${String(n).padStart(4)}회`);
