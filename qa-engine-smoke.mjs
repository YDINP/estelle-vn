// 분기·엔딩 엔진 스모크 — 부팅→루트 진입→대사 진행→종료 + 게이트/엔딩/재도전/마이그레이션.
// 사용: (dev 서버 5180 기동 후) node qa-engine-smoke.mjs
//
// ⚠️ 세이브 주입은 반드시 addInitScript로 한다. 루트 대본이 동적 import라
//    enterRoute()가 비동기가 됐고, "goto → localStorage 조작 → reload" 방식은
//    이전 페이지의 남은 비동기 save()가 주입값을 덮어써 테스트가 불안정해진다.
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL || "http://localhost:5180/";
const SAVE_KEY = "estelle.save.v1";
const VIEWPORT = { width: 390, height: 844 };
const browser = await chromium.launch();
const errors = [];

let fails = 0;
const ok = (cond, label, extra = "") => {
  if (cond) console.log(`[PASS] ${label}`);
  else { console.log(`[FAIL] ${label} ${extra}`); fails++; }
};

/** 세이브를 페이지 스크립트보다 먼저 주입한 새 페이지. saveObj=null이면 완전 신규. */
async function freshPage(saveObj, query = "") {
  const p = await browser.newPage({ viewport: VIEWPORT });
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
  await p.addInitScript(([k, v]) => {
    localStorage.clear();
    if (v) localStorage.setItem(k, v);
  }, [SAVE_KEY, saveObj ? JSON.stringify(saveObj) : ""]);
  await p.goto(BASE + query);
  return p;
}

const readSave = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), SAVE_KEY);

/** VN 진행: 탭 반복, 선택지는 지정 인덱스. 완주하면 true. */
async function playVn(p, tag, optIdx = 0, maxTaps = 900) {
  for (let i = 0; i < maxTaps; i++) {
    let st;
    try {
      st = await p.evaluate(() => ({
        done: document.querySelector("#vn").classList.contains("hidden"),
        choosing: !document.querySelector("#vnChoices")?.classList.contains("hidden"),
      }));
    } catch { await p.waitForTimeout(300); continue; }
    if (st.done) { await p.waitForTimeout(500); return true; } // endVn → onEnd(저장) 대기
    try {
      if (st.choosing) {
        const sel = `#vnChoices [data-opt='${optIdx}']`;
        await p.click((await p.$(sel)) ? sel : "#vnChoices [data-opt='0']");
        await p.waitForTimeout(90);
        continue;
      }
      await p.click("#vn", { position: { x: 195, y: 250 }, force: true });
    } catch { /* 오버레이 전환 중 클릭 실패 — 다음 루프에서 재평가 */ }
    await p.waitForTimeout(45);
  }
  console.log(`[FAIL] ${tag} — ${maxTaps}탭 내 미완주`);
  fails++;
  return false;
}

async function openStoryAndPlay(p, epId) {
  await p.waitForSelector("#btnStory", { timeout: 10000 });
  await p.click("#btnStory");
  await p.waitForSelector("#storyItems .story-item", { timeout: 8000 });
  const clicked = await p.evaluate((id) => {
    const btn = document.querySelector(`[data-play="${id}"]`);
    if (!btn) return false;
    btn.click();
    return true;
  }, epId);
  if (!clicked) { console.log(`[FAIL] ${epId} 재생 버튼 없음`); fails++; return false; }
  await p.waitForSelector("#vn:not(.hidden)", { timeout: 5000 });
  return true;
}

const LILIA_EPS = (n) => Array.from({ length: n }, (_, i) => `lip${i}`);
const R = (o) => ({ epCleared: [], nextEpFreeAt: 0, resolve: 0, resolveMax: 0, endings: [], ...o });

// ─────────────────────────────────────────────
// 1. 신규 부팅 → 루트 자동 진입 → 프롤로그 자동재생 완주
// ─────────────────────────────────────────────
{
  const p = await freshPage(null);
  await p.waitForSelector("#vn:not(.hidden)", { timeout: 15000 });
  ok(true, "부팅 → 루트 자동 진입 → 프롤로그 자동재생");
  await playVn(p, "프롤로그");
  const s = await readSave(p);
  ok(s.routes.lilia.epCleared.includes("lip0"), "프롤로그 클리어 기록", JSON.stringify(s.routes.lilia));
  ok(typeof s.routes.lilia.resolve === "number" && Array.isArray(s.routes.lilia.endings),
    "RouteProgress 신필드 저장", JSON.stringify(s.routes.lilia));
  await p.close();
}

// ─────────────────────────────────────────────
// 2. 구 세이브 마이그레이션 (구 키 + 구 형태 → RouteProgress 승격)
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 500, currentRoute: "lilia", onboarded: true,
    routes: { estelle: { epCleared: ["lip0", "lip1"], nextEpFreeAt: 0 } },
    affectionBy: { estelle: 30 },
  });
  await p.waitForSelector("#btnStory", { timeout: 10000 });
  const s = await readSave(p);
  const lp = s.routes.lilia;
  ok(!!lp && lp.epCleared.length === 2, "개명 마이그레이션(estelle→lilia) 유지", JSON.stringify(s.routes));
  ok(lp.resolve === 0 && lp.resolveMax === 0 && Array.isArray(lp.endings) && lp.endings.length === 0,
    "구 세이브 → RouteProgress 승격(resolve/endings)", JSON.stringify(lp));
  ok(s.routes.estelle === undefined, "구 키 제거");
  await p.close();
}

// ─────────────────────────────────────────────
// 3. 게이트 실패 분기 → bad 엔딩 기록 (15화, threshold 0.7)
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 999, currentRoute: "lilia", onboarded: true,
    routes: { lilia: R({ epCleared: LILIA_EPS(15), resolve: 0, resolveMax: 30 }) },
  });
  if (await openStoryAndPlay(p, "lip15")) {
    await playVn(p, "lip15 (게이트 실패)");
    const lp = (await readSave(p)).routes.lilia;
    ok(lp.endings.includes("bad"), "게이트 실패 → bad 엔딩 기록", JSON.stringify(lp.endings));
    ok(lp.epCleared.includes("lip15"), "분기 재생 후 에피소드 클리어 처리", JSON.stringify(lp.epCleared.slice(-3)));
  }
  await p.close();
}

// ─────────────────────────────────────────────
// 4. 게이트 통과 분기 → 15화는 엔딩 없이 진행
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 999, currentRoute: "lilia", onboarded: true,
    routes: { lilia: R({ epCleared: LILIA_EPS(15), resolve: 30, resolveMax: 30 }) },
  });
  if (await openStoryAndPlay(p, "lip15")) {
    await playVn(p, "lip15 (게이트 통과)");
    const lp = (await readSave(p)).routes.lilia;
    ok(lp.endings.length === 0, "게이트 통과(15화) → 엔딩 미확정", JSON.stringify(lp.endings));
    ok(lp.epCleared.includes("lip15"), "통과 분기 후 클리어 처리");
  }
  await p.close();
}

// ─────────────────────────────────────────────
// 5. 결의 누적 — 최초 플레이만 누적, 다시보기는 누적하지 않는다
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 999, currentRoute: "lilia", onboarded: true,
    routes: { lilia: R({ epCleared: ["lip0"] }) },
  });
  let first = null;
  if (await openStoryAndPlay(p, "lip1")) {
    await playVn(p, "lip1 최초");
    first = (await readSave(p)).routes.lilia;
    ok(first.resolveMax > 0, "선택 확정 시 resolveMax 누적", JSON.stringify(first));
  }
  if (first && await openStoryAndPlay(p, "lip1")) {
    await playVn(p, "lip1 다시보기");
    const again = (await readSave(p)).routes.lilia;
    ok(again.resolveMax === first.resolveMax && again.resolve === first.resolve,
      "다시보기에서는 결의 미누적", `${JSON.stringify(first)} → ${JSON.stringify(again)}`);
  }
  await p.close();
}

// ─────────────────────────────────────────────
// 6. 엔딩 도감 + 완주 표시 + 재도전
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 999, currentRoute: "lilia", onboarded: true,
    routes: {
      lilia: R({ epCleared: LILIA_EPS(16), resolve: 4, resolveMax: 10, endings: ["bad"] }),
      marion: R({ endings: ["good", "true"] }),
    },
  });
  await p.waitForSelector("#btnCollect", { timeout: 10000 });
  await p.click("#btnCollect");
  await p.waitForSelector("#collect:not(.hidden)", { timeout: 5000 });
  await p.click('#collectCats [data-cat="endings"]');
  await p.waitForTimeout(200);
  const g = await p.evaluate(() => ({
    rows: document.querySelectorAll(".erow").length,
    cells: document.querySelectorAll(".ecell").length,
    locked: document.querySelectorAll(".ecell.locked").length,
    count: document.querySelector("#collectCount").textContent,
    charTabsHidden: document.querySelector("#collectTabs").classList.contains("hidden"),
  }));
  ok(g.rows === 8, "엔딩 탭 — 8루트 행", JSON.stringify(g));
  ok(g.cells === 24, "엔딩 탭 — 24셀(8×3)", JSON.stringify(g));
  ok(g.locked === 21, "미획득 21셀 자물쇠", JSON.stringify(g));
  ok(g.count === "3/24", "획득 카운트 3/24", g.count);
  ok(g.charTabsHidden, "엔딩 탭에서 캐릭터 탭 숨김");
  await p.click("#collectX");

  // 메인 화면 루트 카드 — 완주 뱃지
  await p.click("#btnMain");
  await p.waitForSelector(".route-card", { timeout: 5000 });
  const done = await p.evaluate(() => ({
    lilia: !!document.querySelector('[data-route="lilia"]')?.classList.contains("done"),
    marion: !!document.querySelector('[data-route="marion"]')?.classList.contains("done"),
    belfor: !!document.querySelector('[data-route="belfor"]')?.classList.contains("done"),
    badge: document.querySelector('[data-rcfoot="marion"]')?.textContent?.trim(),
  }));
  ok(done.lilia && done.marion && !done.belfor, "완주 루트만 뱃지", JSON.stringify(done));
  ok(/🏆/.test(done.badge || ""), "루트 카드 엔딩 뱃지", done.badge);

  // 재도전 (확인 모달 경유)
  await p.evaluate(() => document.querySelector('[data-route="lilia"]').click());
  await p.waitForSelector("#btnStory", { timeout: 8000 });
  await p.click("#btnStory");
  await p.waitForSelector("#routeEndingBar:not(.hidden)", { timeout: 5000 });
  ok(true, "완주 루트 — 이야기 목록에 엔딩 바 노출");
  await p.click("[data-restart]");
  await p.waitForSelector("#confirmModal:not(.hidden)", { timeout: 3000 });
  ok(true, "재도전 — 확인 모달 게이트");
  await p.click("#confirmOk");
  await p.waitForTimeout(300);
  const lp = (await readSave(p)).routes.lilia;
  ok(lp.epCleared.length === 0 && lp.resolve === 0 && lp.resolveMax === 0,
    "재도전 — 진행도 초기화", JSON.stringify(lp));
  ok(lp.endings.includes("bad"), "재도전 — 엔딩 기록 보존", JSON.stringify(lp.endings));
  await p.close();
}

// ─────────────────────────────────────────────
// 7. 코드분할 — 초기 로드에 진입 루트 청크만 받는다
// ─────────────────────────────────────────────
{
  const p = await browser.newPage({ viewport: VIEWPORT });
  const reqs = [];
  p.on("request", (r) => reqs.push(r.url()));
  p.on("pageerror", (e) => errors.push(`[split] ${e}`));
  await p.addInitScript(() => localStorage.clear());
  await p.goto(BASE + "?nocheat=1");
  await p.waitForSelector("#vn:not(.hidden)", { timeout: 15000 });
  const chunks = reqs.filter((u) => /_route/.test(u)).map((u) => u.split("/").pop().split("?")[0]);
  ok(chunks.length <= 2, `루트 청크는 진입 루트 것만 로드 (${chunks.length}개)`, chunks.join(","));
  await p.close();
}

// ─────────────────────────────────────────────
// 8. 도감 — 대사 구매 시 해당 셀만 갱신 / 이미지 lazy 힌트
// ─────────────────────────────────────────────
{
  const p = await freshPage({
    coins: 999, currentRoute: "lilia", onboarded: true,
    routes: { lilia: R({ epCleared: ["lip0"] }) },
  });
  await p.waitForSelector("#btnCollect", { timeout: 10000 });
  await p.click("#btnCollect");
  await p.waitForSelector("#collect:not(.hidden)", { timeout: 5000 });
  const lazy = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll("#illustWrap img")];
    return { n: imgs.length, lazy: imgs.every((i) => i.loading === "lazy" && i.decoding === "async") };
  });
  ok(lazy.n > 0 && lazy.lazy, "도감 그리드 img loading=lazy·decoding=async", JSON.stringify(lazy));

  await p.click('#collectCats [data-cat="lines"]');
  await p.waitForSelector("#illustWrap .line-item", { timeout: 5000 });
  const before = await p.evaluate(() => ({
    total: document.querySelectorAll("#illustWrap .line-item").length,
    buyable: document.querySelectorAll("#illustWrap [data-buy]").length,
    count: document.querySelector("#collectCount").textContent,
    firstBuyId: document.querySelector("#illustWrap [data-buy]")?.dataset.buy,
    marker: (document.querySelector("#illustWrap .line-list").dataset.mark = "keep"),
  }));
  await p.click("#illustWrap [data-buy]");
  await p.waitForTimeout(250);
  const after = await p.evaluate((id) => ({
    total: document.querySelectorAll("#illustWrap .line-item").length,
    buyable: document.querySelectorAll("#illustWrap [data-buy]").length,
    count: document.querySelector("#collectCount").textContent,
    unlocked: !!document.querySelector(`[data-line="${id}"]`),
    // 목록 컨테이너가 통째로 재생성됐다면 표식이 사라진다
    markKept: document.querySelector("#illustWrap .line-list")?.dataset.mark === "keep",
  }), before.firstBuyId);
  ok(after.unlocked && after.buyable === before.buyable - 1, "대사 구매 → 해당 셀만 해금 상태로 교체",
    `${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  ok(after.markKept, "구매 시 목록 컨테이너 전체 재생성 안 함(부분 갱신)");
  ok(after.count !== before.count, "수집 카운트 갱신", `${before.count} → ${after.count}`);
  ok(after.total === before.total, "항목 수 유지");
  await p.close();
}

console.log("콘솔/페이지 에러:", errors.length ? JSON.stringify(errors, null, 1) : "없음");
await browser.close();
process.exit(fails === 0 && errors.length === 0 ? 0 : 1);
