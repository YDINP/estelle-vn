// EstelleVN '기다리면 무료' 개편 QA 자동화 (Playwright)
// 실행: node qa-test.mjs  (dev 서버 http://localhost:5180/ 가 떠 있어야 함)
// 스크린샷: qa-shots/
//
// 컨텍스트 구성 (매 시나리오 깨끗한 localStorage):
//  A: ?epwait=12  → #1 1화 자동재생, #2 전면광고+보상, #3 홈 버튼, #4 에피소드 목록, #5 타이머 무료 해금
//     (epwait=5면 광고닫힘/토스트 확인 중에 타이머가 끝나버려 '타이머 표시' 검증 불가 → 12초 사용)
//  B: ?epwait=120 → #6 광고 즉시 해금 (타이머가 확실히 남아있는 상태에서 광고 해금 검증)
//  C: ?epwait=5   → #7 오늘의 일상
//  D: ?epwait=5   → #8 수집 갤러리
//  E: ?epwait=5   → #9 코인 부족 → 광고 충전 → 선물 재개

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:5180/";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(ROOT, "qa-shots");
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const shotsTaken = [];
const consoleErrors = []; // { ctx, type, text }

function report(id, name, pass, detail = "") {
  results.push({ id, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${id} ${name}${detail ? " — " + detail : ""}`);
}

async function shot(page, name) {
  const file = path.join(SHOTS, name);
  await page.screenshot({ path: file });
  shotsTaken.push(name);
}

async function newPage(browser, ctxName, epwaitSec) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  // 토스트(우상단 스택 .toast-item)는 자동 소멸하므로 페이지 안에서 상시 수집
  await context.addInitScript(() => {
    window.__toastLog = [];
    setInterval(() => {
      document.querySelectorAll("#toasts .toast-item").forEach((t) => {
        const log = window.__toastLog;
        if (t.textContent && !t.__logged) { t.__logged = true; log.push(t.textContent); }
      });
    }, 100);
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error")
      consoleErrors.push({ ctx: ctxName, type: "console.error", text: msg.text() });
  });
  page.on("pageerror", (err) =>
    consoleErrors.push({ ctx: ctxName, type: "pageerror", text: String(err) })
  );
  await page.goto(`${BASE}?epwait=${epwaitSec}`, { waitUntil: "domcontentloaded" });
  return { context, page };
}

const toasts = (page) => page.evaluate(() => window.__toastLog ?? []);
const saveData = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("estelle.save.v1") || "null"));

// VN 탭 연타 진행. 선택지는 첫 옵션 클릭. #vn 이 닫힐 때까지.
async function tapThroughVN(page, { shotAtChoice, maxMs = 90000 } = {}) {
  const start = Date.now();
  let choiceShot = false;
  while (Date.now() - start < maxMs) {
    if (await page.locator("#vn").isHidden()) return true;
    const choices = page.locator("#vnChoices");
    if (await choices.isVisible()) {
      const btn = choices.locator("[data-opt]").first();
      if ((await btn.count()) > 0) {
        if (shotAtChoice && !choiceShot) {
          await shot(page, shotAtChoice);
          choiceShot = true;
        }
        await btn.click({ force: true });
        await page.waitForTimeout(160);
        continue;
      }
    }
    await page.locator("#vn").click({ position: { x: 195, y: 250 }, force: true });
    await page.waitForTimeout(140);
  }
  return false; // 타임아웃
}

// 1화 완주 + 전면광고 닫힘까지. 반환: { interSeen }
async function clearEp1(page, opts = {}) {
  await enterEstelle(page); // 메인 화면 → 에스텔 루트 진입 → 1화 자동재생
  await page.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
  const done = await tapThroughVN(page, opts);
  if (!done) throw new Error("1화 탭 진행 타임아웃 (#vn 이 닫히지 않음)");
  let interSeen = false;
  try {
    await page.waitForSelector("#interAd:not(.hidden)", { timeout: 2500 });
    interSeen = true;
    await page.waitForSelector("#interAd.hidden", { timeout: 5000 });
  } catch {
    /* 전면광고 미노출/미닫힘 → interSeen 값으로 판정 */
  }
  return { interSeen };
}

const text = async (page, sel) => ((await page.locator(sel).textContent()) ?? "").trim();

// 에스텔 루트 진입. 온보딩 개편: 첫 실행(진행 0)은 메인 화면 없이 에스텔 루트로
// 자동 진입하므로 루트 카드가 안 뜨면 이미 진입된 것으로 간주한다.
// (진행 저장이 있는 컨텍스트에선 메인이 뜨므로 카드 클릭 경로 유지)
async function enterEstelle(page) {
  try {
    await page.waitForSelector('#routeCards [data-route="estelle"]', { timeout: 2500 });
    await page.click('#routeCards [data-route="estelle"]');
  } catch { /* 자동 진입됨 — 1화 자동재생(#vn) 또는 홈 상태 */ }
}

// ─────────────────────────────────────────────────────────────
async function ctxA(browser) {
  const { context, page } = await newPage(browser, "A", 12);
  try {
    // #1 메인 화면 → 에스텔 루트 진입 → 1화 자동재생 + 타이핑
    await enterEstelle(page);
    let autoOpen = false, typing = false;
    try {
      await page.waitForSelector("#vn:not(.hidden)", { timeout: 8000 });
      autoOpen = true;
    } catch { /* autoOpen=false */ }
    if (autoOpen) {
      await page.waitForTimeout(250);
      const t1 = await text(page, "#vnText");
      await page.waitForTimeout(400);
      const t2 = await text(page, "#vnText");
      typing = t2.length > 0 && (t2.length > t1.length || t1.length > 0);
      await shot(page, "01-ep1-autoplay.png");
    }
    if (!autoOpen) {
      report(1, "1화 자동재생", false, "첫 로드 시 #vn 이 자동으로 열리지 않음");
    } else {
      const done = await tapThroughVN(page, { shotAtChoice: "02-ep1-choice.png" });
      report(1, "1화 자동재생", done && typing,
        done ? `타이핑 연출 ${typing ? "확인" : "미확인"} / 선택지 진행 / 완주 OK` : "탭 연타로 완주 실패");
      if (!done) throw new Error("1화 완주 실패 — 이후 시나리오 중단");
    }

    // #2 보상 + 전면광고 정책 (정책: 자동재생 1화는 인트로 성격 → 전면광고 스킵, 2화부터 노출)
    let interSeen = false;
    try {
      await page.waitForSelector("#interAd:not(.hidden)", { timeout: 2500 });
      interSeen = true;
      await shot(page, "03-interstitial.png");
      await page.waitForSelector("#interAd.hidden", { timeout: 5000 });
    } catch { /* interSeen 유지 */ }
    await page.waitForTimeout(1200); // CG 해금 토스트(+950ms) 로그 수집 여유
    const coin = await text(page, "#coinVal");
    const tlog = await toasts(page);
    const rewardToast = tlog.some((t) => t.includes("완료") && t.includes("+30"));
    // CG는 스토리 중 연출 시 "수집", 미연출분만 클리어 시 "해금" — 둘 중 하나면 OK
    const cgToast = tlog.some((t) => t.includes("이벤트 일러"));
    await shot(page, "04-after-reward.png");
    report(2, "1화 보상+전면광고 스킵", !interSeen && coin === "130" && rewardToast && cgToast,
      `1화 뒤 전면광고 ${interSeen ? "노출(정책 위반)" : "미노출(정책 준수)"} / 코인 ${coin}(기대 130) / ` +
      `보상토스트 ${rewardToast ? "O" : "X"} / CG해금토스트 ${cgToast ? "O" : "X"} / toasts=${JSON.stringify(tlog)}`);

    // #3 홈 버튼 구성
    const btns = await page.locator(".actions .btn").allTextContents();
    const labels = btns.map((b) => b.trim());
    const want = ["이야기", "오늘의 일상", "선물하기", "수집", "옷장"];
    const hasAll = want.every((w) => labels.some((l) => l.includes(w)));
    const banned = ["대화하기", "출석", "광고 코인", "광고코인"];
    const hasBanned = banned.filter((w) => labels.some((l) => l.includes(w)));
    await shot(page, "05-home-buttons.png");
    report(3, "홈 버튼 구성", labels.length === 5 && hasAll && hasBanned.length === 0,
      `버튼 ${labels.length}개: ${labels.join(" | ")}${hasBanned.length ? " / 잔존 구버튼: " + hasBanned : ""}`);

    // #4 에피소드 목록 (타이머 진행 중)
    await page.click("#btnStory");
    await page.waitForSelector("#storyList:not(.hidden)", { timeout: 3000 });
    const items = page.locator("#storyItems .story-item");
    const n = await items.count();
    const ep1Redo = (await items.nth(0).locator("[data-play]").count()) === 1 &&
      (await items.nth(0).innerText()).includes("다시보기");
    const ep2El = items.nth(1);
    const ep2Timer = (await ep2El.locator("[data-count]").count()) === 1;
    const ep2CountText = ep2Timer ? await text(page, "#storyItems [data-count]") : "";
    const ep2AdBtn = (await ep2El.locator("[data-adplay]").count()) === 1 &&
      (await ep2El.innerText()).includes("광고 보고 지금 보기");
    let lockedOk = true;
    for (let i = 2; i < n; i++)
      if (!(await items.nth(i).innerText()).includes("🔒")) lockedOk = false;
    const teasers = await page.locator("#storyItems .teaser").allTextContents();
    const teaserOk = teasers.length === n && teasers.every((t) => t.trim().length > 0);
    await shot(page, "06-storylist-timer.png");
    report(4, "에피소드 목록",
      n === 12 && ep1Redo && ep2Timer && ep2CountText.includes("⏳") && ep2AdBtn && lockedOk && teaserOk,
      `${n}화 / 1화 다시보기:${ep1Redo} / 2화 ⏳"${ep2CountText}"+광고버튼:${ep2AdBtn} / 3화~ 잠김:${lockedOk} / teaser:${teaserOk}`);

    // #5 타이머 무료 해금 (카운트다운 실시간 갱신 → 재생 버튼 전환)
    const c1 = await text(page, "#storyItems [data-count]").catch(() => "");
    await page.waitForTimeout(1300);
    const c2 = await text(page, "#storyItems [data-count]").catch(() => "");
    const ticking = c1 !== "" && c2 !== "" && c1 !== c2;
    let unlocked = false;
    try {
      await page.waitForSelector('#storyItems [data-play="ep2"]', { timeout: 20000 });
      unlocked = true;
    } catch { /* unlocked=false */ }
    await shot(page, "07-storylist-unlocked.png");
    let ep2Plays = false;
    if (unlocked) {
      await page.click('#storyItems [data-play="ep2"]');
      try {
        await page.waitForSelector("#vn:not(.hidden)", { timeout: 3000 });
        await page.waitForTimeout(500);
        ep2Plays = (await text(page, "#vnText")).length > 0;
        await shot(page, "08-ep2-timer-play.png");
      } catch { /* ep2Plays=false */ }
    }
    report(5, "타이머 무료 해금", ticking && unlocked && ep2Plays,
      `카운트다운 갱신 ${ticking ? `O("${c1}"→"${c2}")` : `X("${c1}"→"${c2}")`} / 해금 후 ▶재생 전환:${unlocked} / 2화 재생:${ep2Plays}`);
  } catch (e) {
    report(0, "컨텍스트 A 진행", false, String(e));
  } finally {
    await context.close();
  }
}

// #6 광고 즉시 해금 (epwait=120 → 타이머가 확실히 남은 상태)
async function ctxB(browser) {
  const { context, page } = await newPage(browser, "B", 120);
  try {
    await clearEp1(page);
    await page.click("#btnStory");
    await page.waitForSelector("#storyList:not(.hidden)", { timeout: 3000 });
    const adBtn = page.locator("#storyItems [data-adplay]");
    if ((await adBtn.count()) !== 1) throw new Error("2화 '광고 보고 지금 보기' 버튼 없음");
    await adBtn.click();
    let mockSeen = false;
    try {
      await page.waitForSelector("#adModal:not(.hidden)", { timeout: 2500 });
      mockSeen = true;
      await shot(page, "09-adunlock-mock.png");
      await page.waitForSelector("#adModal.hidden", { timeout: 6000 }); // 3초 mock
    } catch { /* mockSeen 유지 */ }
    let ep2Plays = false;
    try {
      await page.waitForSelector("#vn:not(.hidden)", { timeout: 3000 });
      await page.waitForTimeout(500);
      ep2Plays = (await text(page, "#vnText")).length > 0 &&
        (await page.locator("#storyList").isHidden());
      await shot(page, "10-ep2-adunlock-play.png");
    } catch { /* ep2Plays=false */ }
    const sv = await saveData(page);
    report(6, "광고 즉시 해금", mockSeen && ep2Plays && sv?.nextEpFreeAt === 0,
      `mock 3초 광고:${mockSeen} / 2화 즉시 재생:${ep2Plays} / nextEpFreeAt=${sv?.nextEpFreeAt}(기대 0)`);
  } catch (e) {
    report(6, "광고 즉시 해금", false, String(e));
  } finally {
    await context.close();
  }
}

// #7 오늘의 일상
async function ctxC(browser) {
  const { context, page } = await newPage(browser, "C", 5);
  try {
    await clearEp1(page);
    const affBefore = Number(await text(page, "#affVal"));
    await page.click("#btnDaily");
    await page.waitForSelector("#vn:not(.hidden)", { timeout: 3000 });
    await shot(page, "11-daily-scene.png");
    const done = await tapThroughVN(page);
    if (!done) throw new Error("일일 씬 완주 실패");
    // 일일 씬 뒤 전면광고 금지 확인
    await page.waitForTimeout(800);
    const interAfterDaily = await page.locator("#interAd").isVisible();
    const affAfter = Number(await text(page, "#affVal"));
    const disabled = await page.locator("#btnDaily").isDisabled();
    const dState = await text(page, "#dailyState");
    const tlog = await toasts(page);
    const dailyToast = tlog.some((t) => t.includes("오늘의 일상 완료"));
    const sv = await saveData(page);
    await shot(page, "12-daily-done.png");
    report(7, "오늘의 일상",
      affAfter === affBefore + 3 && disabled && dState.includes("내일 다시") && dailyToast && !interAfterDaily,
      `호감도 ${affBefore}→${affAfter}(기대 +3) / 버튼 비활성:${disabled} / 표시:"${dState}" / ` +
      `토스트:${dailyToast} / 일일 씬 뒤 전면광고 없음:${!interAfterDaily} / dailyDoneDay=${sv?.dailyDoneDay}`);
  } catch (e) {
    report(7, "오늘의 일상", false, String(e));
  } finally {
    await context.close();
  }
}

// #8 일러스트 도감 (캐릭터별 탭 / 표정·전신·CG 섹션)
async function ctxD(browser) {
  const { context, page } = await newPage(browser, "D", 5);
  try {
    await clearEp1(page);
    await page.click("#btnCollect");
    await page.waitForSelector("#collect:not(.hidden)", { timeout: 3000 });
    // 캐릭터 탭 존재 (에스텔/로젤린)
    const tabs = await page.locator("#collectTabs .tab").allTextContents();
    const hasTabs = tabs.some((t) => t.includes("에스텔")) && tabs.some((t) => t.includes("로젤린"));
    // 에스텔 탭: 1화 클리어 후 표정 일부 수집 + CG 1장(스러진 봄) 해금
    const ownedIll = await page.locator("#illustWrap [data-ill]").count();
    const ownedCg = await page.locator("#illustWrap [data-cg]").count();
    const lockedN = await page.locator("#illustWrap .icell.locked").count();
    // 로젤린 탭 전환 동작
    await page.click('#collectTabs [data-ctab="rozelin"]');
    await page.waitForTimeout(200);
    const rozCells = await page.locator("#illustWrap .icell").count();
    await shot(page, "13-collect.png");
    report(8, "일러스트 도감", hasTabs && ownedIll >= 1 && ownedCg >= 1 && lockedN >= 1 && rozCells > 0,
      `탭 ${JSON.stringify(tabs)} / 에스텔 수집 표정 ${ownedIll}·CG ${ownedCg}·잠금 ${lockedN} / 로젤린 탭 셀 ${rozCells}`);
  } catch (e) {
    report(8, "일러스트 도감", false, String(e));
  } finally {
    await context.close();
  }
}

// #9 코인 부족 → 광고 충전 → 원래 시도 재개
async function ctxE(browser) {
  const { context, page } = await newPage(browser, "E", 5);
  try {
    await clearEp1(page); // 코인 100+30=130
    for (let i = 0; i < 3; i++) {
      await page.click("#btnGift");
      await page.waitForTimeout(350);
    }
    const coinsAfter3 = await text(page, "#coinVal"); // 기대 10
    await page.click("#btnGift"); // 부족 → 모달
    await page.waitForSelector("#coinShort:not(.hidden)", { timeout: 3000 });
    await shot(page, "14-coinshort-modal.png");
    const modalTxt = await text(page, "#coinShort");
    await page.click("#coinAdWatch");
    let mockSeen = false;
    try {
      await page.waitForSelector("#adModal:not(.hidden)", { timeout: 2500 });
      mockSeen = true;
      await shot(page, "15-coin-ad-mock.png");
      await page.waitForSelector("#adModal.hidden", { timeout: 6000 });
    } catch { /* mockSeen 유지 */ }
    await page.waitForTimeout(600);
    const coinsFinal = await text(page, "#coinVal"); // 10+50-40=20 (선물 자동 재개 시)
    const shortHidden = await page.locator("#coinShort").isHidden();
    const tlog = await toasts(page);
    const plus50 = tlog.some((t) => t.includes("+50"));
    await shot(page, "16-gift-resumed.png");
    report(9, "코인 부족→광고 충전→선물 재개",
      coinsAfter3 === "10" && mockSeen && plus50 && coinsFinal === "20" && shortHidden,
      `선물 3회 후 코인 ${coinsAfter3}(기대 10) / 부족모달 문구 "${modalTxt.slice(0, 40)}..." / ` +
      `mock:${mockSeen} / +50토스트:${plus50} / 최종 코인 ${coinsFinal}(기대 20=자동재개로 -40) / 모달닫힘:${shortHidden}`);
  } catch (e) {
    report(9, "코인 부족→광고 충전→선물 재개", false, String(e));
  } finally {
    await context.close();
  }
}

// ─────────────────────────────────────────────────────────────
const browser = await chromium.launch();
try {
  await ctxA(browser);
  await ctxB(browser);
  await ctxC(browser);
  await ctxD(browser);
  await ctxE(browser);
} finally {
  await browser.close();
}

console.log("\n================ 결과 요약 ================");
for (const r of results)
  console.log(`${r.pass ? "PASS" : "FAIL"} | #${r.id} ${r.name} | ${r.detail}`);
console.log("\n스크린샷:", shotsTaken.join(", "));
console.log("\n콘솔 에러:", consoleErrors.length ? "" : "없음");
for (const e of consoleErrors) console.log(`  [ctx ${e.ctx}] ${e.type}: ${e.text}`);
process.exit(results.every((r) => r.pass) && consoleErrors.length === 0 ? 0 : 1);
