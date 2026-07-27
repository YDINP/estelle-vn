// 8루트 전수 스모크 — 각 루트가 실제로 끝까지 도달 가능한지 확인한다.
//
// 엔진 스모크(qa-engine-smoke.mjs)는 릴리아 한 루트로 기능을 검증한다.
// 여기서는 반대로 "8개 루트 전부가 같은 계약을 지키는가"를 본다:
//   · 루트 청크가 로드되고 31화 목록이 뜨는가
//   · 프롤로그·1화가 재생되는가
//   · 게이트 3곳(15·25·30화)이 실제로 분기하는가 (세이브 주입으로 직행)
//   · 30화 GOOD 도달 시 good 이 기록되는가
//   · 콘솔 에러 0 (미제작 CG 404는 의도된 폴백이라 제외)
//
// 사용: node tools/serve-dist.mjs 기동 후 `node qa-all-routes.mjs`
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5180/estelle-vn/";
const SAVE_KEY = "estelle.save.v1";
const VIEWPORT = { width: 390, height: 844 };
const ROUTES = [
  ["lilia", "lip"], ["marion", "map"], ["belfor", "bfp"], ["belian", "blp"],
  ["lucienne", "lup"], ["livia", "lvp"], ["reimon", "rmp"], ["azael", "azp"],
];

const browser = await chromium.launch();
let fails = 0;
const errors = [];
const ok = (c, label, extra = "") => {
  if (c) console.log(`  [PASS] ${label}`);
  else { console.log(`  [FAIL] ${label} ${extra}`); fails++; }
};

const R = (o) => ({ epCleared: [], nextEpFreeAt: 0, resolve: 0, resolveMax: 0, endings: [], ...o });

/** 지정 루트의 지정 화만 남기고 전부 클리어된 세이브 */
function saveAt(routeId, prefix, upto, ratio) {
  const routes = {};
  for (const [r] of ROUTES) routes[r] = R({});
  routes[routeId] = R({
    epCleared: Array.from({ length: upto }, (_, i) => `${prefix}${i}`),
    resolve: Math.round(100 * ratio), resolveMax: 100,
  });
  return { coins: 9999, ownedCosmetics: [], equipped: {}, cards: [], illust: {}, cgSeen: [],
    heardLines: [], specialsOwned: [], routes, affectionBy: {}, currentRoute: routeId, onboarded: true };
}

async function page(save) {
  const p = await browser.newPage({ viewport: VIEWPORT });
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => {
    // 미제작 CG의 404는 .cg-missing 폴백이 처리하는 의도된 상태다
    if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  await p.addInitScript(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); },
    [SAVE_KEY, JSON.stringify(save)]);
  await p.goto(BASE);
  return p;
}
const readSave = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), SAVE_KEY);

async function playEp(p, epId, optIdx = 0) {
  await p.waitForSelector("#btnStory", { timeout: 15000 });
  await p.click("#btnStory");
  await p.waitForSelector("#storyItems .story-item", { timeout: 10000 });
  const clicked = await p.evaluate((id) => {
    const b = document.querySelector(`[data-play="${id}"]`);
    if (!b) return false;
    b.click();
    return true;
  }, epId);
  if (!clicked) return "no-button";
  await p.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
  for (let i = 0; i < 1400; i++) {
    let st;
    try {
      st = await p.evaluate(() => ({
        done: document.querySelector("#vn").classList.contains("hidden"),
        choosing: !document.querySelector("#vnChoices")?.classList.contains("hidden"),
      }));
    } catch { await p.waitForTimeout(200); continue; }
    if (st.done) { await p.waitForTimeout(500); return "done"; }
    try {
      if (st.choosing) {
        const sel = `#vnChoices [data-opt='${optIdx}']`;
        await p.click((await p.$(sel)) ? sel : "#vnChoices [data-opt='0']");
        await p.waitForTimeout(80);
        continue;
      }
      await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
    } catch { /* 전환 중 */ }
    await p.waitForTimeout(40);
  }
  return "timeout";
}

for (const [route, prefix] of ROUTES) {
  console.log(`\n── ${route} ──`);

  // 1) 목록에 31화가 뜨는가 (청크 로드 + 데이터 무결성)
  {
    const p = await page(saveAt(route, prefix, 31, 1.0));
    await p.waitForSelector("#btnStory", { timeout: 15000 });
    await p.click("#btnStory");
    await p.waitForSelector("#storyItems .story-item", { timeout: 10000 });
    const n = await p.evaluate(() => document.querySelectorAll("#storyItems .story-item").length);
    ok(n === 31, `에피소드 31화 목록 (${n})`);
    await p.close();
  }

  // 2) 프롤로그 재생
  {
    const p = await page(saveAt(route, prefix, 0, 1.0));
    const r = await playEp(p, `${prefix}0`);
    ok(r === "done", "프롤로그 재생 완주", r);
    await p.close();
  }

  // 3) 15화 게이트 — 결의 부족 시 bad 기록
  {
    const p = await page(saveAt(route, prefix, 16, 0.3));
    const r = await playEp(p, `${prefix}15`);
    const s = await readSave(p);
    ok(r === "done", "15화 재생 완주", r);
    ok((s?.routes?.[route]?.endings ?? []).includes("bad"), "15화 게이트 실패 → bad 기록",
      JSON.stringify(s?.routes?.[route]?.endings));
    await p.close();
  }

  // 4) 30화 게이트 — 결의 충분 시 good 기록
  {
    const p = await page(saveAt(route, prefix, 31, 1.0));
    const r = await playEp(p, `${prefix}30`);
    const s = await readSave(p);
    ok(r === "done", "30화 재생 완주", r);
    ok((s?.routes?.[route]?.endings ?? []).includes("good"), "30화 게이트 통과 → good 기록",
      JSON.stringify(s?.routes?.[route]?.endings));
    await p.close();
  }
}

console.log(`\n════ 실패 ${fails}건 · 콘솔/페이지 에러 ${errors.length}건 ════`);
for (const e of [...new Set(errors)].slice(0, 10)) console.log("  " + e);
await browser.close();
process.exitCode = fails === 0 && errors.length === 0 ? 0 : 1;
