// 로젤린 등장 검증: ep1~4 연속 클리어 → 4화에서 이름판 '로젤린' + rozelin 포트레이트 확인
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto("http://localhost:5180/?epwait=1");
await p.waitForTimeout(1200);

let rozSeen = false, rozSrc = "", shotDone = false;
async function playThrough() {
  for (let i = 0; i < 120; i++) {
    const vnOpen = await p.$eval("#vn", (el) => !el.classList.contains("hidden")).catch(() => false);
    if (!vnOpen) break;
    const nm = await p.$eval("#vnName", (el) => el.textContent).catch(() => "");
    if (nm === "로젤린" && !shotDone) {
      rozSeen = true; shotDone = true;
      rozSrc = await p.$eval("#vnPortrait", (el) => el.src);
      await p.waitForTimeout(600);
      await p.screenshot({ path: "roz-scene.png" });
    }
    const c = await p.$("#vnChoices:not(.hidden) [data-opt]");
    if (c) { await c.click(); await p.waitForTimeout(110); continue; }
    await p.click("#vn"); await p.waitForTimeout(90);
  }
}

// ep1(자동재생) → ep4까지
await playThrough();
for (let ep = 2; ep <= 4; ep++) {
  await p.waitForTimeout(3600); // 전면광고(2s)+타이머(1s) 여유
  await p.click("#btnStory"); await p.waitForTimeout(400);
  const btn = await p.$(`#storyItems [data-play="ep${ep}"]`);
  if (!btn) { console.log(`ep${ep} 재생버튼 없음`); break; }
  await btn.click(); await p.waitForTimeout(400);
  await playThrough();
}
// 도감에서 로젤린 수집 확인
await p.waitForTimeout(2800);
await p.click("#btnCollect"); await p.waitForTimeout(200);
await p.click('[data-ctab="illust"]'); await p.waitForTimeout(300);
const secs = await p.$$eval(".isec-t", (els) => els.map((e) => e.textContent.trim()));
console.log(`로젤린 대사 표시: ${rozSeen} / 포트레이트: ${rozSrc.split("/").slice(-3).join("/")} / 도감: ${JSON.stringify(secs)}`);
await b.close();
