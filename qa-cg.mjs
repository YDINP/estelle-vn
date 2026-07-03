import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.goto("http://localhost:5180/?epwait=120");
await p.waitForTimeout(1200);
for (let i = 0; i < 60; i++) {
  const vnOpen = await p.$eval("#vn", (el) => !el.classList.contains("hidden")).catch(() => false);
  if (!vnOpen) break;
  const c = await p.$("#vnChoices:not(.hidden) [data-opt]");
  if (c) { await c.click(); await p.waitForTimeout(120); continue; }
  await p.click("#vn"); await p.waitForTimeout(110);
}
await p.waitForTimeout(2200); // CG 해금 토스트 시점
await p.click("#btnCollect"); await p.waitForTimeout(300);
await p.click('[data-ctab="illust"]'); await p.waitForTimeout(400);
await p.screenshot({ path: "cg-1-estelle.png" });
// 로젤린 섹션까지 스크롤
await p.$eval(".sheet", (el) => { el.scrollTop = el.scrollHeight; });
await p.waitForTimeout(300);
await p.screenshot({ path: "cg-2-rozelin.png" });
// 해금된 CG 클릭 → 뷰어
await p.$eval(".sheet", (el) => { el.scrollTop = 0; });
await p.click(".icell.cg:not(.locked)");
await p.waitForTimeout(400);
await p.screenshot({ path: "cg-3-viewer.png" });
const cap = await p.$eval("#illustViewCap", (el) => el.textContent);
console.log("viewer:", cap);
await b.close();
