// 신규 기능 검증: 일러스트 도감 + 전체보기 + 광고 팝업 z-index(목록 위)
import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.goto("http://localhost:5180/?epwait=120");
await p.waitForTimeout(1200);
// 1화 완주 (일러 수집 발생)
for (let i = 0; i < 60; i++) {
  const vnOpen = await p.$eval("#vn", (el) => !el.classList.contains("hidden")).catch(() => false);
  if (!vnOpen) break;
  const c = await p.$("#vnChoices:not(.hidden) [data-opt]");
  if (c) { await c.click(); await p.waitForTimeout(120); continue; }
  await p.click("#vn"); await p.waitForTimeout(110);
}
await p.waitForTimeout(1000);

// A. 수집 → 일러스트 탭
await p.click("#btnCollect"); await p.waitForTimeout(300);
await p.click('[data-ctab="illust"]'); await p.waitForTimeout(300);
await p.screenshot({ path: "ill-1-gallery.png" });
const count = await p.$eval("#collectCount", (el) => el.textContent);
const ownedCells = await p.$$eval("#illustWrap .icell:not(.locked)", (els) => els.length);
const lockedCells = await p.$$eval("#illustWrap .icell.locked", (els) => els.length);

// B. 소장 일러 클릭 → 전체보기
await p.click("#illustWrap .icell:not(.locked)");
await p.waitForTimeout(400);
await p.screenshot({ path: "ill-2-viewer.png" });
const viewerOpen = await p.$eval("#illustView", (el) => !el.classList.contains("hidden"));
await p.click("#illustView"); await p.waitForTimeout(200);
await p.click("#collectX"); await p.waitForTimeout(200);

// C. 광고 팝업 z-index: 목록 열고 광고 해금 → 광고 모달이 목록 위인지
await p.click("#btnStory"); await p.waitForTimeout(300);
const adBtn = await p.$("#storyItems button:not([data-play])"); // 광고 보고 지금 보기
await adBtn.click(); await p.waitForTimeout(800);
await p.screenshot({ path: "ill-3-ad-on-top.png" });
const adZ = await p.$eval("#adModal", (el) => getComputedStyle(el).zIndex);
const listZ = await p.$eval("#storyList", (el) => getComputedStyle(el).zIndex);

console.log(`도감 수집률=${count} 소장=${ownedCells} 잠금=${lockedCells} / 뷰어=${viewerOpen ? "OK" : "FAIL"} / 광고z=${adZ} vs 목록z=${listZ} → ${Number(adZ) > Number(listZ) ? "광고 최상단 OK" : "FAIL"}`);
await b.close();
