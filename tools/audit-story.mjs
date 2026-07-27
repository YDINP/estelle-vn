#!/usr/bin/env node
/* audit-story.mjs — 8루트 서사 데이터 정합성 감사.
 *
 * 멀티에이전트 병렬 집필의 산출물을 기계적으로 검증한다. 사람이 8루트 × 31화를
 * 눈으로 대조할 수 없으므로, 정본(ENGINE-CONTRACT.md·PRD-story-overhaul.md)이
 * 규정한 불변 조건을 전부 코드로 옮겨 놓았다.
 *
 *   node tools/audit-story.mjs            # 전체 감사
 *   node tools/audit-story.mjs --json     # 기계 판독용
 *
 * esbuild(vite 의존성)로 TS를 그대로 번들해 실제 데이터 객체를 평가한다 —
 * 정규식 파싱은 문자열 안의 대사와 코드를 구분하지 못해 오탐이 난다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = process.argv.includes("--json");

/** 루트 id → 에피소드 id 프리픽스 (ENGINE-CONTRACT §4-1) */
const ROUTES = {
  lilia: "lip", marion: "map", belfor: "bfp", belian: "blp",
  lucienne: "lup", livia: "lvp", reimon: "rmp", azael: "azp",
};

/** 왕관의 밤 D-0 6비트 — 26~28화에 반드시 재현되어야 하는 불변 골격.
 *  각 비트를 특정하는 검색 키(대사 핵심구). 표기 흔들림을 감안해 여러 후보를 둔다. */
const SIX_BEATS = [
  { n: 1, name: "고발",        keys: ["황실의 이름으로", "반역 혐의로 고발"] },
  { n: 2, name: "위증 거부",   keys: ["대본을 잃", "대본은 잃"] },
  { n: 3, name: "봉랍 증언",   keys: ["봉랍", "예비 인장", "검인청"] },
  { n: 4, name: "확보 명령",   keys: ["증거를 따른다", "저 둘을 확보"] },
  { n: 5, name: "벨리안 재가", keys: ["짐의 검을 시험"] },
  { n: 6, name: "메피안 실각", keys: ["봄은 한 번 꺾인", "두 번이 없으리라"] },
];

/** 절대 금지 표현. 정본 §0-⑤ 및 회귀 비밀(§0-③)
 *  ⚠️ 한국어 특성상 이름이 조사·어미와 충돌한다. 앞이 한글이면 단어 경계가 아니므로 제외한다
 *     (예: "어느 쪽이든"·"무엇이든"의 '이든'은 조사이지 구 캐스트 '이든'이 아니다). */
const NAME_BOUNDARY = "(?<![가-힣])";
const FORBIDDEN = [
  { re: /악녀/g, why: "'악녀' 직접 호칭 금지 (은유로만: 가시/장미/배역/소문)" },
  { re: /회귀자/g, why: "'회귀자' 노출 — 회귀는 주인공만의 비밀" },
  // '이든'은 '이든지'(어미)도 배제. 나머지 구명은 앞 경계만으로 충분하다.
  { re: new RegExp(`${NAME_BOUNDARY}이든(?!지)`, "g"), why: "구 캐스트 이름 '이든' (현 벨포르)" },
  { re: new RegExp(`${NAME_BOUNDARY}(에스텔|로젤린|발렌|이졸데|아델|클로에|레이너|미카엘|카닐)`, "g"),
    why: "구 캐스트 이름 잔존 (개명 전 표기)" },
];

/** 캐릭터가 회귀를 '자각'했음을 시사하는 패턴 — 무귀속 서늘함 상한을 넘는 표현.
 *  나레이션(주인공 시점)은 예외이므로 캐릭터 대사에만 적용한다. */
const REGRESSION_LEAK = [
  /다시 살고/, /시간을 되돌/, /돌아왔군요/, /두 번째 삶/, /미래를 아[신는]/,
  /전생/, /이전 생/, /회귀/,
];

async function loadRoutes() {
  // 8개 루트 파일을 하나의 엔트리로 묶어 번들 → 실제 객체를 평가
  const entry = path.join(ROOT, ".tmp", "_audit-entry.ts");
  fs.mkdirSync(path.dirname(entry), { recursive: true });
  const imports = Object.keys(ROUTES)
    .map((id) => `import { ${id.toUpperCase()}_EPISODES, ${id.toUpperCase()}_DAILY } from "../src/data/${id}_route";`)
    .join("\n");
  const exports = Object.keys(ROUTES)
    .map((id) => `  ${id}: { episodes: ${id.toUpperCase()}_EPISODES, daily: ${id.toUpperCase()}_DAILY },`)
    .join("\n");
  fs.writeFileSync(entry, `${imports}\nexport const ALL = {\n${exports}\n};\n`);

  const out = path.join(ROOT, ".tmp", "_audit-bundle.mjs");
  await esbuild.build({
    entryPoints: [entry], bundle: true, format: "esm", platform: "node",
    outfile: out, logLevel: "silent",
  });
  const mod = await import(pathToFileURL(out).href + "?t=" + fs.statSync(out).mtimeMs);
  return mod.ALL;
}

/** 에피소드의 모든 Step을 평탄화해 순회 (gate 분기 안쪽까지 포함) */
function* walkSteps(ep) {
  const visit = function* (steps, branch) {
    for (const s of steps ?? []) {
      yield { step: s, branch };
      if (s.kind === "choice")
        for (const o of s.choice.options ?? [])
          for (const l of o.result ?? []) yield { step: { kind: "line", line: l }, branch };
    }
  };
  yield* visit(ep.steps, "main");
  if (ep.gate) {
    yield* visit(ep.gate.pass, "gate.pass");
    yield* visit(ep.gate.fail, "gate.fail");
    yield* visit(ep.gate.trueSteps, "gate.true");
  }
}

/** 에피소드 전체 텍스트 (대사 + 나레이션 + 선택지 라벨 + 제목/티저) */
function epText(ep) {
  const parts = [ep.title, ep.teaser, ep.card?.title, ep.card?.quote];
  for (const { step } of walkSteps(ep)) {
    if (step.kind === "line") parts.push(step.line.text);
    else if (step.kind === "choice") {
      parts.push(step.choice.prompt ?? "");
      for (const o of step.choice.options ?? []) parts.push(o.label);
    }
  }
  return parts.filter(Boolean).join("\n");
}

/** 캐릭터 대사만 (나레이션 제외) — 회귀 누설 검사용 */
function charLines(ep) {
  const out = [];
  for (const { step } of walkSteps(ep))
    if (step.kind === "line" && step.line.speaker !== "narration")
      out.push(step.line);
  return out;
}

const findings = [];
const quoteFixes = [];
const add = (sev, route, ep, msg) => findings.push({ sev, route, ep, msg });

const ALL = await loadRoutes();
const stats = {};

for (const [route, prefix] of Object.entries(ROUTES)) {
  const eps = ALL[route]?.episodes ?? [];
  const s = (stats[route] = {
    episodes: eps.length, gates: 0, choices: 0, steps: 0,
    cgCalls: new Set(), resolveMissing: 0, endings: [],
  });

  // ── 1. 화 수 / id / index 연속성 ──
  if (eps.length !== 31)
    add("HIGH", route, "-", `에피소드 ${eps.length}개 (프롤로그+30화 = 31개여야 함)`);

  eps.forEach((ep, i) => {
    const expectId = `${prefix}${i}`;
    if (ep.id !== expectId) add("HIGH", route, ep.id, `id 불일치 — 기대 ${expectId}`);
    if (ep.index !== i + 1) add("HIGH", route, ep.id, `index ${ep.index} — 기대 ${i + 1}`);
  });
  const ids = eps.map((e) => e.id);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) add("HIGH", route, "-", `id 중복: ${[...new Set(dup)].join(", ")}`);

  for (const ep of eps) {
    s.steps += ep.steps?.length ?? 0;

    // ── 2. card.quote 는 실제 대사여야 한다 (창작 문구 금지) ──
    // 공백·문장부호·말줄임표 표기가 카드와 본문에서 미세하게 갈리는 일이 잦아
    // (…/... , 줄바꿈, 전각/반각) 정규화 후 대조한다. 원문 비교는 오탐이 심하다.
    if (ep.card?.quote) {
      const norm = (t) => t.replace(/[\s.,!?"'…·—\-~()]/g, "");
      const q = norm(ep.card.quote);
      const key = q.slice(0, Math.min(12, q.length));
      // 명대사는 연속된 두 줄에 걸쳐 발화되는 일이 흔하다("오늘만은 모두 웃으라." / "짐도, 웃고 있느니라.").
      // 줄 단위로 대조하면 그런 경우를 전부 놓치므로, 대사 전체를 순서대로 이어붙여 검색한다.
      const joined = norm(
        [...walkSteps(ep)].filter(({ step }) => step.kind === "line").map(({ step }) => step.line.text).join("")
      );
      const spoken = key && joined.includes(key);
      if (!spoken) {
        add("MED", route, ep.id, `card.quote가 본문에 없음: "${ep.card.quote.slice(0, 30)}…"`);
        // 수정 작업지시서용 후보 — 그 화의 캐릭터 대사 중 '절정'에 가까운 것.
        // 휴리스틱: 뒤쪽에 나올수록, 적당히 길수록(20~60자) 명대사일 확률이 높다.
        const lines = charLines(ep);
        const cands = lines
          .map((l, i) => ({
            text: l.text, speaker: l.speaker,
            score: (i / Math.max(1, lines.length - 1)) * 2 + (l.text.length >= 20 && l.text.length <= 60 ? 1 : 0),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        quoteFixes.push({ route, ep: ep.id, title: ep.title, current: ep.card.quote, candidates: cands });
      }
    }

    // ── 3. 선택지 resolve 부여 (ENGINE-CONTRACT §1) ──
    for (const { step } of walkSteps(ep)) {
      if (step.kind !== "choice") continue;
      s.choices++;
      const opts = step.choice.options ?? [];
      if (opts.some((o) => o.resolve === undefined)) {
        s.resolveMissing++;
        add("MED", route, ep.id, `선택지에 resolve 미부여 ("${(step.choice.prompt ?? opts[0]?.label ?? "").slice(0, 24)}…")`);
      }
      if (opts.length && opts.every((o) => (o.resolve ?? 0) === 0))
        add("MED", route, ep.id, "선택지 모든 옵션 resolve=0 (게이트 판정 불능)");
    }

    // ── 4. CG 호출 수집 ──
    for (const { step } of walkSteps(ep)) if (step.kind === "cg") s.cgCalls.add(step.id);

    // ── 5. 금지어 ──
    const text = epText(ep);
    for (const f of FORBIDDEN) {
      f.re.lastIndex = 0;
      // 원문 스니펫을 함께 남긴다 — 오탐/진탐 판정에 문맥이 반드시 필요하다
      const hits = [...text.matchAll(f.re)].map((m) =>
        text.slice(Math.max(0, m.index - 14), m.index + m[0].length + 12).replace(/\n/g, " ")
      );
      if (hits.length)
        add("HIGH", route, ep.id, `${f.why} — …${[...new Set(hits)].slice(0, 3).join(" / …")}…`);
    }

    // ── 6. 회귀 누설 (캐릭터 대사 한정) ──
    for (const line of charLines(ep))
      for (const re of REGRESSION_LEAK)
        if (re.test(line.text))
          add("HIGH", route, ep.id, `회귀 누설 의심 [${line.speaker}]: "${line.text.slice(0, 44)}…"`);

    // ── 7. 게이트 ──
    if (ep.gate) {
      s.gates++;
      const g = ep.gate;
      if (g.threshold !== 0.7) add("MED", route, ep.id, `gate.threshold=${g.threshold} (정본 0.7)`);
      if (!g.pass?.length) add("HIGH", route, ep.id, "gate.pass 비어 있음");
      if (!g.fail?.length) add("HIGH", route, ep.id, "gate.fail 비어 있음");
      if (!g.failEnding) add("HIGH", route, ep.id, "gate.failEnding 미지정");
      if (g.passEnding) s.endings.push(g.passEnding);
      if (g.failEnding) s.endings.push(g.failEnding);
      if (g.trueSteps?.length) s.endings.push("true");
    }
  }

  // ── 8. 게이트 배치: 15화(idx16)·25화(idx26)·30화(idx31) ──
  for (const [화, idx] of [[15, 16], [25, 26], [30, 31]]) {
    const ep = eps.find((e) => e.index === idx);
    if (!ep) { add("HIGH", route, `index${idx}`, `${화}화 없음`); continue; }
    if (!ep.gate) add("HIGH", route, ep.id, `${화}화에 gate 없음 (엔딩 게이트 필수)`);
  }
  // 30화는 3분기 전부 필요
  const last = eps.find((e) => e.index === 31);
  if (last?.gate) {
    if (last.gate.passEnding !== "good") add("HIGH", route, last.id, "30화 gate.passEnding !== 'good'");
    if (!last.gate.trueSteps?.length) add("HIGH", route, last.id, "30화 gate.trueSteps 없음 (TRUE 엔딩 누락)");
  }
  // 게이트가 아닌 화에 gate가 붙어 있으면 발산 규칙 위반
  for (const ep of eps)
    if (ep.gate && ![16, 26, 31].includes(ep.index))
      add("MED", route, ep.id, `게이트 화가 아닌데 gate 존재 (index ${ep.index}) — 발산은 15·25·30화만`);

  // ── 9. 왕관의 밤 6비트 (26~29화 = index 27~30)
  //  ⚠️ 비트⑥ '메피안 실각'은 PRD상 29화(퇴장 화)에 놓이므로 창을 29화까지 넓힌다.
  //     26~28화로 좁히면 정상 배치를 누락으로 오판한다. ──
  const nightText = eps.filter((e) => [27, 28, 29, 30].includes(e.index)).map(epText).join("\n");
  if (nightText) {
    const missing = SIX_BEATS.filter((b) => !b.keys.some((k) => nightText.includes(k)));
    if (missing.length)
      add("HIGH", route, "26~28화", `왕관의 밤 6비트 누락: ${missing.map((b) => `${b.n}.${b.name}`).join(", ")}`);
  }

  // ── 10. '유일 원인' 주장 금지 (SHARED-TIMELINE §4 R1 기각 사례) ──
  // 전문 검색은 오탐 천지다("언제나 하나", "만나 하나", 자기희생 대사).
  // 규칙이 실제로 겨냥하는 건 "왕관의 밤을 내가 혼자 뒤집었다"는 서술뿐이므로
  // ① 검사 범위를 그 밤(26~29화)으로 좁히고 ② 어절 경계를 요구하고
  // ③ 같은 문장 안에 '밤/왕관/뒤집/무너' 같은 사건어가 함께 있을 때만 잡는다.
  const soleRe = /(?<![가-힣])(나 하나(로|뿐)?|나 혼자|내가 아니었으면|내 [가-힣]{1,4}만으로)(?![가-힣])/g;
  const soleHits = [];
  for (const sent of nightText.split(/(?<=[.!?"」])\s+/)) {
    soleRe.lastIndex = 0;
    if (soleRe.test(sent) && /(그 밤|왕관의 밤|뒤집|무너뜨렸|막았다)/.test(sent))
      soleHits.push(sent.slice(0, 70).replace(/\n/g, " "));
  }
  if (soleHits.length)
    add("LOW", route, "26~29화", `'유일 원인' 주장 의심 (${soleHits.length}건) — ${soleHits.slice(0, 2).join(" / ")}`);
}

// ── 11. CG 레지스트리 대조 ──
let cgReg = [];
try {
  const out = path.join(ROOT, ".tmp", "_audit-cgs.mjs");
  await esbuild.build({
    entryPoints: [path.join(ROOT, "src/data/cgs.ts")], bundle: true, format: "esm",
    platform: "node", outfile: out, logLevel: "silent",
  });
  const m = await import(pathToFileURL(out).href + "?t=" + fs.statSync(out).mtimeMs);
  cgReg = m.CGS ?? [];
} catch (e) {
  add("HIGH", "-", "cgs.ts", `로드 실패: ${e.message.split("\n")[0]}`);
}
const regIds = new Set(cgReg.map((c) => c.id));
for (const [route] of Object.entries(ROUTES))
  for (const id of stats[route].cgCalls)
    if (!regIds.has(id)) add("MED", route, "-", `CG 미등록: ${id} (cgs.ts에 없음)`);

const missingFiles = [];
for (const c of cgReg) {
  const p = path.join(ROOT, "public", "cg", c.char, `${c.file}.webp`);
  if (!fs.existsSync(p)) missingFiles.push(`${c.id} → ${c.char}/${c.file}.webp`);
}

// ── 출력 ──
const bySev = (s) => findings.filter((f) => f.sev === s);
if (JSON_OUT) {
  console.log(JSON.stringify({ stats: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, { ...v, cgCalls: [...v.cgCalls] }])), findings, missingFiles }, null, 2));
} else {
  console.log("\n=== 루트별 통계 ===");
  console.log("루트        화수  게이트  선택지  스텝   CG호출  엔딩");
  for (const [r, s] of Object.entries(stats))
    console.log(
      `${r.padEnd(11)} ${String(s.episodes).padStart(3)}   ${String(s.gates).padStart(3)}   ${String(s.choices).padStart(4)}  ${String(s.steps).padStart(5)}  ${String(s.cgCalls.size).padStart(4)}   ${[...new Set(s.endings)].join("/") || "-"}`
    );

  for (const sev of ["HIGH", "MED", "LOW"]) {
    const list = bySev(sev);
    console.log(`\n=== ${sev} (${list.length}) ===`);
    for (const f of list.slice(0, 60)) console.log(`  [${f.route}/${f.ep}] ${f.msg}`);
    if (list.length > 60) console.log(`  … 외 ${list.length - 60}건`);
  }

  console.log(`\n=== CG 레지스트리 ${cgReg.length}항목 / 파일 없음 ${missingFiles.length}건 ===`);
  for (const m of missingFiles.slice(0, 40)) console.log(`  ${m}`);
  if (missingFiles.length > 40) console.log(`  … 외 ${missingFiles.length - 40}건`);

  // card.quote 수정 작업지시서를 파일로 떨군다 — 95건을 대화로 옮길 수 없다
  if (quoteFixes.length) {
    const out = path.join(ROOT, ".tmp", "quote-fixes.json");
    fs.writeFileSync(out, JSON.stringify(quoteFixes, null, 2));
    console.log(`\n📝 card.quote 수정 작업지시서 ${quoteFixes.length}건 → .tmp/quote-fixes.json`);
  }

  const hi = bySev("HIGH").length;
  console.log(`\n${hi === 0 ? "✅ HIGH 0건" : `❌ HIGH ${hi}건 — 수정 필요`}`);
  process.exitCode = hi === 0 ? 0 : 1;
}
