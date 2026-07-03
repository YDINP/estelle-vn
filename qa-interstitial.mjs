// M2 수정 검증: 1화 뒤 전면광고 스킵 / 2화 뒤 전면광고 노출
import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
let interShown = false;
const watch = setInterval(async () => {
  try {
    const v = await p.$eval("#interAd", (el) => !el.classList.contains("hidden")).catch(() => false);
    if (v) interShown = true;
  } catch { /* noop */ }
}, 150);

async function playThrough(maxTaps = 80) {
  for (let i = 0; i < maxTaps; i++) {
    const vnOpen = await p.$eval("#vn", (el) => !el.classList.contains("hidden")).catch(() => false);
    if (!vnOpen) break;
    const choice = await p.$("#vnChoices:not(.hidden) [data-opt]");
    if (choice) { await choice.click(); await p.waitForTimeout(120); continue; }
    await p.click("#vn"); await p.waitForTimeout(110);
  }
}

await p.goto("http://localhost:5180/?epwait=1");
await p.waitForTimeout(1200);
await playThrough(); // 1화 완주
await p.waitForTimeout(2600); // 전면광고 나올 시간 대기
const afterEp1 = interShown;
interShown = false;

await p.waitForTimeout(1300); // epwait=1 타이머 소진
await p.click("#btnStory"); await p.waitForTimeout(400);
const play = await p.$('#storyItems [data-play="ep2"]');
if (!play) { console.log("ep2 재생 버튼 없음 — 목록:", await p.$eval("#storyItems", (el) => el.textContent)); process.exit(1); }
await play.click(); await p.waitForTimeout(400);
await playThrough(); // 2화 완주
await p.waitForTimeout(2600);
const afterEp2 = interShown;

clearInterval(watch);
console.log(`1화 뒤 전면광고: ${afterEp1 ? "노출(FAIL)" : "미노출(PASS)"} / 2화 뒤 전면광고: ${afterEp2 ? "노출(PASS)" : "미노출(FAIL)"}`);
await b.close();
