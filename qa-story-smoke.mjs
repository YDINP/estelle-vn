// 스토리 전 화 완주 스모크 — 에스텔 12 + 로젤린 10 + 프롤로그.
// 전 화 클리어 시드로 다시보기(▶) 진입 → 자동 진행(선택지 1번) → 완주/에러 검증.
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5180/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
let fails = 0;

const EPS = {
  estelle: Array.from({ length: 12 }, (_, i) => `ep${i + 1}`),
  rozelin: Array.from({ length: 10 }, (_, i) => `rep${i + 1}`),
};

await p.goto(BASE + "?epwait=5");
await p.evaluate((eps) => {
  localStorage.clear();
  localStorage.setItem("estelle.save.v1", JSON.stringify({
    coins: 999, affection: 0, ownedCosmetics: ["dress_basic"],
    equipped: { outfit: "dress_basic", accessory: "" },
    dailyTalkLeft: 3, epCleared: [], nextEpFreeAt: 0, dailyDoneDay: "",
    cards: [], streak: 1, lastStreakDay: "", illust: {}, cgSeen: [],
    routes: {
      estelle: { epCleared: eps.estelle, nextEpFreeAt: 0 },
      rozelin: { epCleared: eps.rozelin, nextEpFreeAt: 0 },
    },
    affectionBy: { estelle: 30, rozelin: 30 }, currentRoute: "estelle", onboarded: true,
  }));
}, EPS);
await p.reload();
await p.waitForSelector("#btnStory", { timeout: 8000 });

async function playCurrentVn(tag) {
  // 진행: 탭 반복, 선택지는 첫 옵션, CG 위 진행 포함. 화당 최대 200탭.
  // vite 재최적화/HMR로 페이지가 리로드될 수 있어 evaluate 실패는 재시도로 흡수.
  for (let i = 0; i < 200; i++) {
    let st;
    try {
      st = await p.evaluate(() => ({
        done: document.querySelector("#vn").classList.contains("hidden"),
        choosing: !document.querySelector("#vnChoices")?.classList.contains("hidden"),
      }));
    } catch {
      await p.waitForTimeout(600);
      continue;
    }
    if (st.done) return true;
    try {
      if (st.choosing) { await p.click("#vnChoices [data-opt='0']"); await p.waitForTimeout(120); continue; }
      await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
    } catch { /* 리로드 직후 클릭 실패 — 다음 루프에서 재평가 */ }
    await p.waitForTimeout(90);
  }
  console.log(`[FAIL] ${tag} — 200탭 내 미완주`);
  fails++;
  return false;
}

async function playRoute(routeId, count) {
  for (let idx = 0; idx < count; idx++) {
    await p.click("#btnStory");
    await p.waitForSelector("#storyItems .story-item", { timeout: 5000 });
    const opened = await p.evaluate((i) => {
      const it = document.querySelectorAll("#storyItems .story-item")[i];
      const btn = it?.querySelector("[data-play]");
      if (btn) { btn.click(); return true; }
      return false;
    }, idx);
    if (!opened) { console.log(`[FAIL] ${routeId} ${idx + 1}화 — 재생 버튼 없음`); fails++; continue; }
    await p.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });
    const ok = await playCurrentVn(`${routeId} ${idx + 1}화`);
    if (ok) console.log(`[PASS] ${routeId} ${idx + 1}화 완주`);
    await p.waitForTimeout(250);
  }
}

// 에스텔 루트 12화
await playRoute("estelle", 12);

// 메인 → 프롤로그
await p.click("#btnMain");
await p.waitForSelector("#btnPrologue", { timeout: 5000 });
await p.click("#btnPrologue");
await p.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });
if (await playCurrentVn("프롤로그")) console.log("[PASS] 프롤로그 완주");

// 로젤린 루트 진입 → 10화
await p.waitForSelector(".route-card", { timeout: 5000 });
await p.evaluate(() => document.querySelector('[data-route="rozelin"]').click());
await p.waitForTimeout(600);
// 최초 진입 자동재생이 뜨면 완주 처리
const vnOpen = await p.evaluate(() => !document.querySelector("#vn").classList.contains("hidden"));
if (vnOpen) await playCurrentVn("rozelin 자동재생");
await playRoute("rozelin", 10);

console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(fails === 0 && errors.length === 0 ? 0 : 1);
