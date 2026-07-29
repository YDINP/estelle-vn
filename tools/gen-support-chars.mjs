#!/usr/bin/env node
/* gen-support-chars.mjs — 조연 캐릭터 시트를 생성한다(레퍼런스용).
 *
 * 조연들은 characters.ts에 없다 — Speaker 타입상 발화할 수 없고 CG에만 등장한다.
 * 그런데 레퍼런스 아트가 없어 CG마다 새로 그려지고, 결과적으로 같은 인물이
 * 컷마다 딴사람으로 나온다(하이델 공작 7컷·집사 6컷에 걸쳐 특히 눈에 띈다).
 *
 * 그래서 메인 캐릭터와 같은 규약(전신·중립 3/4 포즈·흰 배경·3:4)으로 시트를 뽑고,
 * 배경을 투명화해 `art/refs/<id>.webp` 에 둔다. public/ 밖이므로 배포에 포함되지 않고
 * cg-generate.mjs 가 정체성 레퍼런스로만 사용한다.
 *
 * 외형·성격은 전부 프로즈 근거에 맞췄다(추측 금지) — 각 항목 `근거` 주석 참조.
 *
 *   node tools/gen-support-chars.mjs [--only duke,butler] [--batch 3] [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const BATCH = parseInt(arg("batch", "3"), 10);
const ONLY = (arg("only") || "").split(",").map((s) => s.trim()).filter(Boolean);
const BASH = process.env.CLAUDE_CODE_GIT_BASH_PATH || "C:\\Program Files\\Git\\bin\\bash.exe";

const CAST = [
  {
    id: "duke", ko: "하이델 공작", en: "Duke Heidel",
    // 근거: lilia_route — "하이델을 지킬 방패다. 다음 달, 약혼을 발표한다"(딸에게 통보),
    //       "봉쇄 부서에 서명한 손이 아직 붕대를 감고 있었다", "공작은 변명하지 않았다"
    look: "a duke in his late fifties, father of the blonde blue-eyed duchess Lilia — the same blonde hair " +
      "faded to ash-gold and swept back, the same clear blue eyes but harder and tired, deep lines. " +
      "He wears a stately sage-green and cream ducal coat with gold embroidery and a fur-trimmed overmantle " +
      "(House Heidel colours), a signet ring, a chain of office. " +
      "IMPORTANT DETAIL: his signing hand is wrapped in a fresh white bandage.",
    act: "a patriarch who puts the house before the daughter: he announces decisions instead of explaining " +
      "feelings, mouth set hard, never pleading and never apologising. The exhaustion is in the eyes, not the posture.",
  },
  {
    id: "butler", ko: "하이델가 집사", en: "the Heidel butler",
    // 근거: "위증을 공모한 두 사람 — 공작영애의 약혼자와 하이델가의 집사" / 확보 표적
    look: "a butler in his sixties serving a great ducal house: white hair combed neatly back, clean-shaven, " +
      "black tailcoat over a grey waistcoat, high starched collar, white gloves, a pocket watch chain.",
    act: "flawless deference on the surface and appraisal underneath: a small precise bow, hands folded, " +
      "the smile of perfect service — but the eyes are pricing everything in the room. He will testify falsely.",
  },
  {
    id: "chamberlain", ko: "궁 시종장", en: "the palace chamberlain",
    // 근거: belian_route — "대관 축배를 준비하던 시종장이 잔을 놓치고 있었다",
    //       "시종장의 손이, 잔을 다시 집을 때까지 오래 떨렸다"
    look: "an old palace chamberlain in his sixties: neat grey-white hair, clean-shaven, deep navy-and-gold " +
      "court livery with silver braid and a ceremonial key at his belt, holding a silver salver.",
    act: "loyalty and terror fighting in his hands: he stands correctly, chin level, the practised bearing of " +
      "decades of service — but the hand holding the salver is visibly trembling and he knows it.",
  },
  {
    id: "bishop", ko: "주교", en: "the bishop",
    // 근거: belian_route — "주교가 왕관을 들어 올렸다. 재상의 손이 아니라, 성직자의 손이었다"
    look: "a bishop in his seventies: white hair and full white beard, tall white-and-gold mitre, " +
      "heavy white ceremonial vestments with gold orphrey and jewelled morse, a crozier in one hand, " +
      "ring of office.",
    act: "a man in whom ritual has replaced feeling: absolutely upright, unhurried, expression neutral to the " +
      "point of blankness. He executes procedure; he does not judge it.",
  },
  {
    id: "ornel", ko: "오르넬", en: "Ornel",
    // 근거: azael_route — "격자 너머의 목소리는 늙었고, 억양이 아젤과 같았다",
    //       "신학교 앞자리의 오르넬이다. 죽은 것으로 적혔지만" / "형제는 파문되셨습니다. 성물매매로"
    look: "an OLD excommunicated priest in his seventies, from the same holy kingdom as Azael (so the same " +
      "foreign features and silver-toned hair, but unkempt): long tangled grey-white hair and beard, " +
      "a threadbare ivory cassock with the sacred insignia visibly torn away, no jewellery, thin hands.",
    act: "the dry irony of a man recorded as dead: gaunt and shabby but the spine is straight and the gaze is " +
      "level and unafraid. Faint sardonic amusement at being alive on paper's terms.",
  },
  {
    id: "old_retainer", ko: "북부 노신하", en: "the northern retainer",
    // 근거: reimon_route — "북부 성의 노신하다. 내 서신함 열쇠를 맡긴 자",
    //       "노신하가 왼손을 들어 보였다. 잘린 오른손 자리가 붕대도 없이 드러났다"
    look: "an old northern retainer in his seventies: long grey-white hair and beard in northern style, " +
      "a worn dark fur-lined northern coat over layered wool. " +
      "CRITICAL DETAIL: his RIGHT HAND IS GONE — the severed wrist is bare and unbandaged, plainly visible. " +
      "He raises his intact LEFT hand.",
    act: "he does not hide the missing hand — he holds it where it can be seen. Blunt northern directness, " +
      "no self-pity, the stillness of someone who has already been counted among the dead.",
  },
  {
    id: "kyle", ko: "서기관 카일", en: "the clerk Kyle",
    // 근거: reimon_route — "서기관 카일. 이월 셋째 주 당직 셋 중 하나",
    //       "사복으로 병영을 나섰다" / "각본 스물두 장이 통째로 옮겨졌다. 카일은 자기가 감시당한 줄도 몰랐다"
    look: "a chancellery clerk in his thirties: pale, thin, dark hair a little untidy, small round spectacles, " +
      "a plain grey-and-black chancellery clerk's uniform with ink-stained cuffs and ink on his fingers, " +
      "a bundle of documents clutched under one arm.",
    act: "a small man playing a large game: shoulders drawn in, documents held too tightly, eyes sliding " +
      "sideways as if checking a corridor. He believes he is the one watching.",
  },
];

const STYLE =
  "Korean romance-fantasy (romfan) otome visual-novel CHARACTER SHEET, semi-realistic cel-shaded ANIME style, " +
  "soft painterly rendering, ornate rococo European fantasy, warm dark-brown/gold colour harmony, " +
  "clean even lighting, FULL BODY standing, neutral three-quarter pose, PLAIN WHITE background " +
  "(this is a character sheet, not a scene), VERTICAL PORTRAIT 3:4 aspect ratio. " +
  "NEGATIVE: photorealistic, photograph, lowres, bad anatomy, deformed hands, extra fingers, watermark, " +
  "text, signature, modern clothing, chibi, background scenery, dramatic scene lighting, multiple characters.";

const targets = CAST.filter((c) => !ONLY.length || ONLY.includes(c.id));
console.log(`조연 시트 ${targets.length}종 생성${DRY ? " (dry)" : ""}`);

for (let i = 0; i < targets.length; i += BATCH) {
  const grp = targets.slice(i, i + BATCH);
  const need = grp.filter((c) => !fs.existsSync(path.join(ROOT, ".tmp", "gen", `support_${c.id}.png`)));
  if (!need.length) { console.log(`  배치 ${i / BATCH + 1}: 이미 생성됨 — 건너뜀`); continue; }

  const blocks = need.map((c, n) =>
    `Image ${n + 1} -> save to .tmp/gen/support_${c.id}.png\n` +
    `  Character: ${c.en} (${c.ko}). ${c.look}\n` +
    `  Acting direction (personality must show in posture and expression): ${c.act}`
  ).join("\n\n");

  const prompt =
    `Use your built-in image_gen tool to generate ${need.length} character sheet(s) ` +
    `(one image_gen call per image) and save each final PNG to the exact workspace path shown.\n\n` +
    `These are supporting-cast reference sheets for a visual novel. Each must be ONE character alone, ` +
    `full body, neutral standing three-quarter pose, on a plain white background — the same format as a ` +
    `game's character line-up sheet. Keep all seven consistent with each other in style and rendering.\n\n` +
    `SHARED STYLE: ${STYLE}\n\n${blocks}\n\n` +
    `Do not ask questions. Generate all ${need.length} and save them to those exact paths, then stop.`;

  console.log(`\n▶ 배치 ${Math.floor(i / BATCH) + 1}: ${need.map((c) => c.id).join(", ")}`);
  if (DRY) {
    const p = path.join(ROOT, ".tmp", `_supportprompt_${Math.floor(i / BATCH)}.txt`);
    fs.writeFileSync(p, prompt, "utf8");
    console.log(`  전문 → ${path.relative(ROOT, p)}`);
    continue;
  }

  try {
    const pf = path.join(ROOT, ".tmp", `_supportprompt_${Math.floor(i / BATCH)}.txt`);
    fs.mkdirSync(path.dirname(pf), { recursive: true });
    fs.writeFileSync(pf, prompt, "utf8");
    const posix = (p) => p.replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`).replace(/\\/g, "/");
    execFileSync(BASH,
      ["-c", `cd "${posix(ROOT)}" && codex exec -s workspace-write --skip-git-repo-check -C "${posix(ROOT)}" "$(cat "${posix(pf)}")"`],
      { cwd: ROOT, timeout: 40 * 60 * 1000, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  } catch (e) {
    console.log(`  ⚠ codex 실패/타임아웃: ${(e.message || "").split("\n")[0]}`);
  }
  const got = need.filter((c) => fs.existsSync(path.join(ROOT, ".tmp", "gen", `support_${c.id}.png`)));
  console.log(`  → ${got.length}/${need.length} 도착`);
}

console.log(`\n다음: 배경 투명화 후 art/refs/ 배치`);
console.log(`  for id in ${targets.map((c) => c.id).join(" ")}; do node tools/cutout-bg.mjs --in .tmp/gen/support_$id.png --out art/refs/$id.webp; done`);
