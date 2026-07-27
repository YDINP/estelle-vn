// TRUE 엔딩 경로 전용 검증 — 엔진 스모크가 커버하지 못한 마지막 분기.
//
// TRUE는 "전 8루트 GOOD 보유 + 30화 게이트 통과"에서만 열린다. 조건이 무거워
// 일반 스모크에선 도달할 수 없었다(30화 집필 완료 전엔 trueSteps 자체가 없었다).
// 여기서는 세이브를 주입해 세 경우를 직접 가른다:
//   ① 전 루트 GOOD 보유 + 통과   → true 기록
//   ② GOOD 하나 부족 + 통과      → good 기록 (TRUE 미개방)
//   ③ 결의 부족                  → bad 기록
//
// 사용: node tools/serve-dist.mjs 기동 후 `node qa-true-ending.mjs`
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5180/estelle-vn/";
const SAVE_KEY = "estelle.save.v1";
const VIEWPORT = { width: 390, height: 844 };
const ROUTES = ["lilia", "marion", "belfor", "belian", "lucienne", "livia", "reimon", "azael"];

const browser = await chromium.launch();
const errors = [];
let fails = 0;
const ok = (c, label, extra = "") => {
  if (c) console.log(`[PASS] ${label}`);
  else { console.log(`[FAIL] ${label} ${extra}`); fails++; }
};

const R = (o) => ({ epCleared: [], nextEpFreeAt: 0, resolve: 0, resolveMax: 0, endings: [], ...o });

async function freshPage(save) {
  const p = await browser.newPage({ viewport: VIEWPORT });
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => {
    // 미제작 CG 404는 의도된 폴백이라 소음에서 제외한다
    if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  await p.addInitScript(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); },
    [SAVE_KEY, JSON.stringify(save)]);
  await p.goto(BASE);
  return p;
}
const readSave = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), SAVE_KEY);

/** 릴리아 30화 직전 상태. resolve 비율로 게이트 통과/실패를 통제한다. */
function buildSave({ ratio, goodRoutes }) {
  const routes = {};
  for (const r of ROUTES) routes[r] = R({ endings: goodRoutes.includes(r) ? ["good"] : [] });
  // lip0~lip29 클리어 = 30화(lip30)만 남은 상태
  routes.lilia = R({
    epCleared: Array.from({ length: 30 }, (_, i) => `lip${i}`),
    resolve: Math.round(100 * ratio), resolveMax: 100,
    endings: goodRoutes.includes("lilia") ? ["good"] : [],
  });
  return { coins: 9999, ownedCosmetics: [], equipped: {}, cards: [], illust: {}, cgSeen: [],
    heardLines: [], specialsOwned: [], routes, affectionBy: {}, currentRoute: "lilia", onboarded: true };
}

async function playTo30(p) {
  await p.waitForSelector("#btnStory", { timeout: 15000 });
  await p.click("#btnStory");
  await p.waitForSelector("#storyItems .story-item", { timeout: 10000 });
  const clicked = await p.evaluate(() => {
    const b = document.querySelector('[data-play="lip30"]');
    if (!b) return false;
    b.click();
    return true;
  });
  if (!clicked) return false;
  await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
  // 30화 본문 + 분기까지 전부 재생
  for (let i = 0; i < 1200; i++) {
    let st;
    try {
      st = await p.evaluate(() => ({
        done: document.querySelector("#vn").classList.contains("hidden"),
        choosing: !document.querySelector("#vnChoices")?.classList.contains("hidden"),
      }));
    } catch { await p.waitForTimeout(200); continue; }
    if (st.done) { await p.waitForTimeout(600); return true; }
    try {
      if (st.choosing) { await p.click("#vnChoices [data-opt='0']"); await p.waitForTimeout(80); continue; }
      await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
    } catch { /* 전환 중 */ }
    await p.waitForTimeout(40);
  }
  return false;
}

// ① 전 8루트 GOOD 보유 + 게이트 통과 → TRUE
{
  const p = await freshPage(buildSave({ ratio: 1.0, goodRoutes: ROUTES }));
  const done = await playTo30(p);
  ok(done, "① 전 루트 GOOD + 통과 — 30화 완주");
  const s = await readSave(p);
  const e = s?.routes?.lilia?.endings ?? [];
  ok(e.includes("true"), "① TRUE 엔딩 기록", `endings=${JSON.stringify(e)}`);
  await p.close();
}

// ② GOOD 하나 부족 + 게이트 통과 → GOOD (TRUE 미개방)
{
  const p = await freshPage(buildSave({ ratio: 1.0, goodRoutes: ROUTES.filter((r) => r !== "azael") }));
  const done = await playTo30(p);
  ok(done, "② GOOD 7/8 + 통과 — 30화 완주");
  const s = await readSave(p);
  const e = s?.routes?.lilia?.endings ?? [];
  ok(e.includes("good") && !e.includes("true"), "② TRUE 미개방 · GOOD 기록", `endings=${JSON.stringify(e)}`);
  await p.close();
}

// ③ 결의 부족 → BAD
{
  const p = await freshPage(buildSave({ ratio: 0.4, goodRoutes: ROUTES }));
  const done = await playTo30(p);
  ok(done, "③ 결의 0.4 — 30화 완주");
  const s = await readSave(p);
  const e = s?.routes?.lilia?.endings ?? [];
  ok(e.includes("bad") && !e.includes("true"), "③ 게이트 실패 → BAD 기록", `endings=${JSON.stringify(e)}`);
  await p.close();
}

console.log(`\n실패 ${fails}건 · 콘솔/페이지 에러 ${errors.length}건`);
for (const e of errors.slice(0, 8)) console.log("  " + e);
await browser.close();
process.exitCode = fails === 0 && errors.length === 0 ? 0 : 1;
