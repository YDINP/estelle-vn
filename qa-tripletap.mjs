// 라이브(GitHub Pages) 모바일 트리플탭 치트 열림 검증 — 터치 에뮬레이션
import { chromium, devices } from "playwright";

const URL = process.env.PREVIEW_URL || "https://ydinp.github.io/estelle-vn/";
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices["iPhone 13"] }); // hasTouch: true
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));

await p.goto(URL + "?epwait=5");
await p.evaluate(() => localStorage.clear());
await p.reload();
await p.waitForSelector("#vn:not(.hidden)", { timeout: 10000 });
await p.waitForTimeout(800);
// cheat.js 로드 확인
const loaded = await p.evaluate(() => typeof window.cheat !== "undefined");
console.log(`[${loaded ? "PASS" : "FAIL"}] cheat.js 로드 (배포판, 파라미터 없음)`);
// 같은 위치 트리플탭 (VN 나가기 버튼 피해서 우상단 아래쪽)
for (let i = 0; i < 3; i++) {
  await p.touchscreen.tap(195, 300);
  await p.waitForTimeout(180);
}
await p.waitForTimeout(600);
const open = await p.$eval("#cheat-bottomsheet", (el) => {
  const r = el.getBoundingClientRect();
  return r.height > 50 && getComputedStyle(el).display !== "none";
}).catch(() => false);
console.log(`[${open ? "PASS" : "FAIL"}] 트리플탭으로 치트 바텀시트 열림`);
await p.screenshot({ path: "qa-shots/tripletap.png" });
console.log("콘솔 에러:", errors.length ? JSON.stringify(errors) : "없음");
await b.close();
process.exit(loaded && open && !errors.length ? 0 : 1);
